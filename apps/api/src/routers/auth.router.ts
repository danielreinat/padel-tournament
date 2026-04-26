import { TRPCError } from "@trpc/server";
import { SignJWT } from "jose";
import { createHash } from "crypto";
import { loginSchema } from "@padel/shared";
import { router, publicProcedure, adminProcedure } from "../trpc/trpc";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "dev-secret-cambiar-en-produccion"
);

function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

export const authRouter = router({
  login: publicProcedure.input(loginSchema).mutation(async ({ ctx, input }) => {
    const admin = await ctx.prisma.admin.findUnique({
      where: { email: input.email },
    });

    if (!admin || admin.passwordHash !== hashPassword(input.password)) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Email o contrasena incorrectos",
      });
    }

    const token = await new SignJWT({
      id: admin.id,
      email: admin.email,
      role: admin.role,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("24h")
      .sign(JWT_SECRET);

    return { token, admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role } };
  }),

  me: adminProcedure.query(async ({ ctx }) => {
    const admin = await ctx.prisma.admin.findUnique({
      where: { id: ctx.admin.id },
      select: { id: true, name: true, email: true, role: true },
    });
    return admin;
  }),
});
