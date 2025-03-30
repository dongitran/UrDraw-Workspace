import app from "./src";

const serve = Bun.serve({
  routes: {
    "/health": () => new Response("OK"),
  },
  port: Bun.env.PORT,
  fetch: app.fetch,
});
console.log(`Server running on port http://localhost:${serve.port}`);
