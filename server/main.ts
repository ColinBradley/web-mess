import { serveTls } from "https://deno.land/std@0.127.0/http/server.ts";

await serveTls(
    (_req) => {
        return new Response('Hi');
    },
    {
        certFile: './server/config/https.crt',
        keyFile: './server/config/https.key',
    });