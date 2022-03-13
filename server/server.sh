deno run \
    --unstable \
    --allow-read=. \
    --import-map=./importMap.json \
    --allow-net=0.0.0.0:8443,0.0.0.0:8444 \
    ./main.ts