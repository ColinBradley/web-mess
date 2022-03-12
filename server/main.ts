import HttpServer from "./server.ts";

const server = new HttpServer();
await server.initialize(new AbortController().signal);
server.listen1();
server.listen2();
