import { serveTls } from 'std/http/server.ts';
import PagesServer from "./modules/pagesServer.ts";
import StaticFilesServer from './modules/staticFilesServer.ts';
import { RequestContext } from "./types.ts";

export default class HttpServer {

    private readonly staticFileModule = new StaticFilesServer('www');
    private readonly pagesModule = new PagesServer();

    private readonly modules = [
        this.pagesModule,
        this.staticFileModule,
    ];

    public async initialize(signal: AbortSignal) {
        await this.staticFileModule.initialize(signal);
        await this.pagesModule.initialize(signal);
    }

    public async listen1() {
        await serveTls(
            r => {
                const response = this.handleRequest(r);
                response.headers.append('date', new Date().toUTCString());
                response.headers.append('connection', 'keep-alive');

                return response;
            },
            {
                port: 8444,
                certFile: './config/https.crt',
                keyFile: './config/https.key',
            });
    }

    public async listen2() {
        const options: Deno.ListenTlsOptions = {
            port: 8443,
            certFile: './config/https.crt',
            keyFile: './config/https.key',
        };

        (options as any).alpnProtocols = ['h2', 'http/1.1'];

        const listener = Deno.listenTls(options);

        for await (const connection of listener) {
            this.handleConnection(connection);
        }
    }

    private async handleConnection(conn: Deno.Conn) {
        const httpConn = Deno.serveHttp(conn);

        while (true) {
            const requestEvent = await httpConn.nextRequest().catch(err => {
                if (err instanceof Error && err.message.includes('CertificateUnknown')) {
                    return null;
                }

                throw err;
            });

            if (requestEvent === null) {
                break;
            }

            requestEvent.respondWith(this.handleRequest(requestEvent.request));
        }
    }

    private handleRequest(request: Request) {
        const context: RequestContext = {
            request,
            url: new URL(request.url)
        }

        for (const module of this.modules) {
            const result = module.tryHandle(context);
            if (result !== undefined) {
                return result;
            }
        }

        return new Response('oh :(', { status: 404 });
    }
}