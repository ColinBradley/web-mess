import HttpServer from "./server.ts";

const server = new HttpServer();
await server.initialize(new AbortController().signal);
server.listen1();
console.log('Started h1: https://localhost:8444/');
server.listen2();
console.log('Started h2: https://localhost:8443/');
