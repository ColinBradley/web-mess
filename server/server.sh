deno run \
    --unstable \
    --allow-read=. \
    --import-map=./import_map.json \
    --allow-net=0.0.0.0:8443,0.0.0.0:8444 \
    ./main.ts