import { serveTls } from 'std/http/server.ts';

await serveTls(
    (_req) => {
        return new Response('Hi');
    },
    {
        certFile: './server/config/https.crt',
        keyFile: './server/config/https.key',
    });