import { z } from "zod";
import { randomBytes } from "crypto";
import { router, publicProcedure, adminProcedure } from "../trpc/trpc";

const STREAM_BASE_URL = process.env.NEXT_PUBLIC_STREAM_URL || "http://localhost:8889";

export const streamRouter = router({
  // Public: list active streams for a tournament
  byTournament: publicProcedure
    .input(z.object({ tournamentId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.stream.findMany({
        where: { tournamentId: input.tournamentId, status: { in: ["LIVE", "INACTIVE"] } },
        include: {
          match: {
            include: {
              homeTeam: { include: { player1: true, player2: true } },
              awayTeam: { include: { player1: true, player2: true } },
              court: true,
            },
          },
        },
        orderBy: { startedAt: "desc" },
      });
    }),

  // Admin: create stream key
  create: adminProcedure
    .input(z.object({
      tournamentId: z.string().uuid(),
      matchId: z.string().uuid().optional(),
      title: z.string().max(200).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const streamKey = randomBytes(12).toString("hex");
      return ctx.prisma.stream.create({
        data: {
          tournamentId: input.tournamentId,
          matchId: input.matchId || null,
          streamKey,
          rtmpUrl: `rtmp://localhost:1935/${streamKey}`,
          hlsUrl: `${STREAM_BASE_URL}/${streamKey}/index.m3u8`,
          title: input.title,
        },
      });
    }),

  // Admin: update stream status
  updateStatus: adminProcedure
    .input(z.object({
      streamId: z.string().uuid(),
      status: z.enum(["INACTIVE", "LIVE", "ENDED"]),
    }))
    .mutation(async ({ ctx, input }) => {
      const data: any = { status: input.status };
      if (input.status === "LIVE") data.startedAt = new Date();
      if (input.status === "ENDED") data.endedAt = new Date();
      return ctx.prisma.stream.update({ where: { id: input.streamId }, data });
    }),

  // Admin: delete stream
  delete: adminProcedure
    .input(z.object({ streamId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.stream.delete({ where: { id: input.streamId } });
    }),

  // Admin: list all streams for a tournament
  adminList: adminProcedure
    .input(z.object({ tournamentId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.stream.findMany({
        where: { tournamentId: input.tournamentId },
        include: {
          match: {
            include: {
              homeTeam: { include: { player1: true, player2: true } },
              awayTeam: { include: { player1: true, player2: true } },
            },
          },
        },
        orderBy: { streamKey: "desc" },
      });
    }),
});
