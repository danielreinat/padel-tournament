import { prisma } from "@padel/db";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "dev-secret-cambiar-en-produccion"
);

export async function createContext(opts: { req: Request; resHeaders: Headers }) {
  const authHeader = opts.req.headers.get("authorization");
  let admin: { id: string; email: string; role: string } | null = null;

  if (authHeader?.startsWith("Bearer ")) {
    try {
      const token = authHeader.slice(7);
      const { payload } = await jwtVerify(token, JWT_SECRET);
      admin = payload as { id: string; email: string; role: string };
    } catch {
      // Invalid token, admin stays null
    }
  }

  return { prisma, admin };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
