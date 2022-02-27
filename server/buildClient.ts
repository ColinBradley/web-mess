import * as esbuild from 'https://deno.land/x/esbuild@v0.14.23/mod.js';
import { emptyDir } from 'https://deno.land/std@0.127.0/fs/empty_dir.ts';

await emptyDir('./server/www/static');

await esbuild.build({
    entryPoints: [
        'vs/language/json/json.worker.js',
        'vs/language/css/css.worker.js',
        'vs/language/html/html.worker.js',
        'vs/language/typescript/ts.worker.js',
        'vs/editor/editor.worker.js'
    ].map(entry => `./node_modules/monaco-editor/esm/${entry}`),
    bundle: true,
    minify: true,
    format: 'esm',
    outbase: './node_modules/monaco-editor/esm/',
    outdir: './server/www/static',
});

await esbuild.build({
    entryPoints: [
        './client/main.ts',
    ],
    assetNames: 'assets/[name]-[hash]',
    chunkNames: 'chunks/[name]-[hash]',
    entryNames: '[dir]/[name]-[hash]',
    bundle: true,
    format: 'esm',
    splitting: true,
    sourcemap: 'inline',
    // minify: true,
    // watch: true,
    outdir: './server/www/static',
    loader: {
        '.ttf': 'file'
    },
    logLevel: 'info'
});

