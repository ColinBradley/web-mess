import * as path from 'std/path/mod.ts';
import { walk } from 'std/fs/walk.ts';
import { RequestContext } from "../types.ts";

export default class StaticFileServer {

    private readonly files = new Map<
        string,
        {
            body: Uint8Array,
            headers: Record<string, string>,
        }>();

    public constructor(
        private readonly rootPath: string,
    ) {
    }

    public async initialize(signal: AbortSignal) {
        for await (const file of walk(this.rootPath, { includeDirs: false })) {
            const headers = {
                'content-type': EXT_TO_CONTENT_TYPE.get(path.extname(file.name))!,
            };

            this.files.set(
                file.path.substring(this.rootPath.length),
                {
                    body: await Deno.readFile(file.path, { signal }),
                    headers,
                });
        }
    }

    public tryHandle(ctx: RequestContext) {
        const result = this.files.get(ctx.url.pathname);
        if (result === undefined) {
            return undefined;
        }

        return new Response(result.body, { headers: result.headers });
    }
}

const EXT_TO_CONTENT_TYPE = new Map([
    ['.js', 'text/javascript'],
    ['.css', 'text/css'],
]);