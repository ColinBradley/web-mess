deno run \
    --allow-env=ESBUILD_BINARY_PATH,XDG_CACHE_HOME,HOME \
    --allow-write=./server/www/static/,$HOME/.cache/esbuild/ \
    --allow-read=./,$HOME/.cache/esbuild/ \
    --allow-net=registry.npmjs.org \
    --allow-run \
    --import-map=./server/importMap.json \
    ./server/buildClient.ts