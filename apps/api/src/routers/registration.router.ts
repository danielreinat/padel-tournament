import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicRegistrationSchema, confirmRegistrationSchema } from "@padel/shared";
import { router, publicProcedure, adminProcedure } from "../trpc/trpc";

export const registrationRouter = router({
  // Public: register a team (creates players + team + registration)
  register: publicProcedure
    .input(publicRegistrationSchema)
    .mutation(async ({ ctx, input }) => {
      // Check tournament is open
      const tournament = await ctx.prisma.tournament.findUnique({
        where: { id: input.tournamentId },
        include: { _count: { select: { registrations: true } } },
      });

      if (!tournament || tournament.status !== "OPEN") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "El torneo no esta abierto para inscripciones",
        });
      }

      if (tournament.maxTeams && tournament._count.registrations >= tournament.maxTeams) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "El torneo ha alcanzado el maximo de equipos",
        });
      }

      // Upsert players (by email)
      const player1 = await ctx.prisma.player.upsert({
        where: { email: input.player1.email },
        update: { name: input.player1.name, phone: input.player1.phone, skillLevel: input.player1.skillLevel },
        create: input.player1,
      });

      const player2 = await ctx.prisma.player.upsert({
        where: { email: input.player2.email },
        update: { name: input.player2.name, phone: input.player2.phone, skillLevel: input.player2.skillLevel },
        create: input.player2,
      });

      if (player1.id === player2.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Los dos jugadores deben ser diferentes",
        });
      }

      const avgLevel = (player1.skillLevel + player2.skillLevel) / 2;

      // Create team + registration in transaction
      const result = await ctx.prisma.$transaction(async (tx) => {
        const team = await tx.team.create({
          data: {
            tournamentId: input.tournamentId,
            categoryId: input.categoryId,
            player1Id: player1.id,
            player2Id: player2.id,
            teamName: input.teamName,
            avgLevel,
          },
        });

        const registration = await tx.registration.create({
          data: {
            tournamentId: input.tournamentId,
            teamId: team.id,
          },
        });

        return { team, registration };
      });

      return result;
    }),

  // Public: check registration status by team email
  checkStatus: publicProcedure
    .input(z.object({ email: z.string().email(), tournamentId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const player = await ctx.prisma.player.findUnique({
        where: { email: input.email },
      });

      if (!player) return null;

      const team = await ctx.prisma.team.findFirst({
        where: {
          tournamentId: input.tournamentId,
          OR: [{ player1Id: player.id }, { player2Id: player.id }],
        },
        include: {
          player1: true,
          player2: true,
          registration: true,
        },
      });

      return team;
    }),

  // Admin: list registrations for a tournament
  listByTournament: adminProcedure
    .input(z.object({ tournamentId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.registration.findMany({
        where: { tournamentId: input.tournamentId },
        include: {
          team: { include: { player1: true, player2: true, category: true } },
        },
        orderBy: { registeredAt: "desc" },
      });
    }),

  // Admin: confirm registration
  confirm: adminProcedure
    .input(confirmRegistrationSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.registration.update({
        where: { id: input.registrationId },
        data: {
          status: "CONFIRMED",
          paymentMethod: input.paymentMethod,
          paymentConfirmed: true,
          confirmedAt: new Date(),
        },
      });
    }),

  // Admin: cancel registration
  cancel: adminProcedure
    .input(z.object({ registrationId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.registration.update({
        where: { id: input.registrationId },
        data: { status: "CANCELLED" },
      });
    }),
});
