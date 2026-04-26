import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./trpc/router";
import { createContext } from "./trpc/context";

const app = new Hono();

// CORS for both frontends
app.use(
  "*",
  cors({
    origin: ["http://localhost:3003", "http://localhost:3002"],
    credentials: true,
  })
);

// Health check
app.get("/health", (c) => c.json({ status: "ok", timestamp: new Date().toISOString() }));

// tRPC handler via fetch adapter
app.all("/trpc/*", async (c) => {
  const response = await fetchRequestHandler({
    endpoint: "/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext: ({ req }) => createContext({ req, resHeaders: new Headers() }),
  });
  return response;
});

const port = Number(process.env.API_PORT) || 3001;

console.log(`API server running on http://localhost:${port}`);

serve({ fetch: app.fetch, port });

export type { AppRouter } from "./trpc/router";
