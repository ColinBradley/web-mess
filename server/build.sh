deno run \
    --allow-env=ESBUILD_BINARY_PATH,XDG_CACHE_HOME,HOME \
    --allow-write=./www/static/,$HOME/.cache/esbuild/ \
    --allow-read=./,$HOME/.cache/esbuild/ \
    --allow-net=registry.npmjs.org \
    --allow-run \
    --import-map=./import_map.json \
    ./buildClient.ts