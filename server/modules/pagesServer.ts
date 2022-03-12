import * as path from 'std/path/mod.ts';
import { walk } from 'std/fs/walk.ts';
import { RequestContext } from "../types.ts";
import { getIndexBody } from "../pages/index.ts";

export default class PagesServer {

    private readonly pages = new Map<string, string>();

    public async initialize(signal: AbortSignal) {
        this.pages.set('/', await getIndexBody());
    }

    public tryHandle(ctx: RequestContext) {
        const result = this.pages.get(ctx.url.pathname);
        if (result === undefined) {
            return undefined;
        }

        return new Response(result, { headers: { 'content-type': 'text/html' } });
    }
}