import * as esbuild from 'esbuild/mod.js';
import { walk } from "std/fs/walk.ts";

const workerPaths = [
    'vs/language/json/json.worker.js',
    'vs/language/css/css.worker.js',
    'vs/language/html/html.worker.js',
    'vs/language/typescript/ts.worker.js',
    'vs/editor/editor.worker.js'
];

await esbuild.build({
    entryPoints: workerPaths.map(entry => `../node_modules/monaco-editor/esm/${entry}`),
    bundle: true,
    minify: true,
    format: 'esm',
    outbase: '../node_modules/monaco-editor/esm/',
    outdir: './www/static',
});

const fullWorkerPaths = new Set(workerPaths.map(p => 'www/static/' + p));

await esbuild.build({
    entryPoints: [
        '../client/main.ts',
    ],
    assetNames: 'assets/[name]-[hash]',
    chunkNames: 'chunks/[name]-[hash]',
    entryNames: '[dir]/[name]-[hash]',
    bundle: true,
    format: 'esm',
    splitting: true,
    sourcemap: 'inline',
    // minify: true,
    watch: true,
    outdir: './www/static',
    loader: {
        '.ttf': 'file'
    },
    logLevel: 'info',
    plugins: [
        {
            name: 'Clean unused files',
            setup: build => {
                build.initialOptions.metafile = true;
                build.onEnd(async result => {

                    console.log(`Built @ ${new Date().toLocaleString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}`);

                    const outputFiles = new Set(Object.keys(result.metafile?.outputs!));
                    for await (const file of walk('./www/static', { includeDirs: false })) {
                        if (outputFiles.has(file.path) || fullWorkerPaths.has(file.path)) {
                            continue;
                        }

                        console.log(`Removing: ${file.path}`);
                        await Deno.remove(file.path);
                    }
                });
            }
        }
    ]
});
