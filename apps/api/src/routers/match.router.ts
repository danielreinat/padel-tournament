import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { updateMatchResultSchema } from "@padel/shared";
import { router, publicProcedure, adminProcedure } from "../trpc/trpc";

export const matchRouter = router({
  // Public: list matches for a tournament
  byTournament: publicProcedure
    .input(z.object({ tournamentId: z.string().uuid(), phase: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.match.findMany({
        where: {
          tournamentId: input.tournamentId,
          ...(input.phase ? { phase: input.phase as any } : {}),
        },
        include: {
          homeTeam: { include: { player1: true, player2: true } },
          awayTeam: { include: { player1: true, player2: true } },
          court: true,
          group: true,
          sets: { orderBy: { setNumber: "asc" } },
          winner: true,
        },
        orderBy: [{ bracketRound: "asc" }, { bracketPosition: "asc" }, { createdAt: "asc" }],
      });
    }),

  // Public: get a single match
  byId: publicProcedure
    .input(z.object({ matchId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.match.findUnique({
        where: { id: input.matchId },
        include: {
          homeTeam: { include: { player1: true, player2: true } },
          awayTeam: { include: { player1: true, player2: true } },
          court: true,
          group: true,
          sets: { orderBy: { setNumber: "asc" } },
          winner: true,
          stream: true,
        },
      });
    }),

  // Admin: update match result (scores + winner)
  updateResult: adminProcedure
    .input(updateMatchResultSchema)
    .mutation(async ({ ctx, input }) => {
      const match = await ctx.prisma.match.findUnique({
        where: { id: input.matchId },
        include: { sets: true },
      });

      if (!match) throw new TRPCError({ code: "NOT_FOUND" });

      // Upsert sets
      for (const set of input.sets) {
        await ctx.prisma.matchSet.upsert({
          where: {
            matchId_setNumber: { matchId: input.matchId, setNumber: set.setNumber },
          },
          create: {
            matchId: input.matchId,
            setNumber: set.setNumber,
            homeGames: set.homeGames,
            awayGames: set.awayGames,
            tiebreakHome: set.tiebreakHome,
            tiebreakAway: set.tiebreakAway,
          },
          update: {
            homeGames: set.homeGames,
            awayGames: set.awayGames,
            tiebreakHome: set.tiebreakHome,
            tiebreakAway: set.tiebreakAway,
          },
        });
      }

      // Update match status and winner
      await ctx.prisma.match.update({
        where: { id: input.matchId },
        data: { status: "FINISHED", winnerId: input.winnerId },
      });

      // Update group standings if it's a group match
      if (match.phase === "GROUP" && match.groupId && match.homeTeamId && match.awayTeamId) {
        await recalculateGroupStandings(ctx.prisma, match.groupId);
      }

      // If it's an elimination match, advance winner to next round
      if (match.phase !== "GROUP" && match.bracketPosition !== null) {
        await advanceWinner(ctx.prisma, match, input.winnerId);
      }

      return { success: true };
    }),

  // Admin: set match as live
  setLive: adminProcedure
    .input(z.object({ matchId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.match.update({
        where: { id: input.matchId },
        data: { status: "LIVE" },
      });
    }),

  // Admin: generate elimination bracket from group standings
  generateBracket: adminProcedure
    .input(z.object({ tournamentId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const tournament = await ctx.prisma.tournament.findUnique({
        where: { id: input.tournamentId },
        include: { categories: true },
      });
      if (!tournament) throw new TRPCError({ code: "NOT_FOUND" });

      // Delete existing elimination matches
      await ctx.prisma.match.deleteMany({
        where: { tournamentId: input.tournamentId, phase: { not: "GROUP" } },
      });

      for (const category of tournament.categories) {
        const groups = await ctx.prisma.group.findMany({
          where: { tournamentId: input.tournamentId, categoryId: category.id },
          include: {
            standings: { orderBy: [{ points: "desc" }, { setsWon: "desc" }, { gamesWon: "desc" }] },
          },
          orderBy: { name: "asc" },
        });

        // Collect qualified teams
        const qualified: string[] = [];
        for (const group of groups) {
          const advancing = group.standings.slice(0, tournament.teamsAdvancingPerGroup);
          qualified.push(...advancing.map((s) => s.teamId));
        }

        if (qualified.length < 2) continue;

        // Pad to next power of 2
        const bracketSize = Math.pow(2, Math.ceil(Math.log2(qualified.length)));
        const totalRounds = Math.log2(bracketSize);

        // Seed: alternate 1st of groups with 2nd of other groups
        const seeded: (string | null)[] = [];
        for (let i = 0; i < bracketSize; i++) {
          seeded.push(i < qualified.length ? qualified[i] : null);
        }

        // Determine phase names
        const phaseForRound = (round: number): string => {
          const remaining = totalRounds - round;
          if (remaining === 0) return "FINAL";
          if (remaining === 1) return "SEMI";
          if (remaining === 2) return "QUARTER";
          if (remaining === 3) return "ROUND_OF_16";
          return "ROUND_OF_32";
        };

        // Create first round matches
        let position = 0;
        for (let i = 0; i < bracketSize; i += 2) {
          const home = seeded[i];
          const away = seeded[i + 1];

          const match = await ctx.prisma.match.create({
            data: {
              tournamentId: input.tournamentId,
              categoryId: category.id,
              homeTeamId: home,
              awayTeamId: away,
              phase: phaseForRound(0) as any,
              bracketRound: 0,
              bracketPosition: position,
            },
          });

          // If one side is a bye, auto-advance
          if (home && !away) {
            await ctx.prisma.match.update({
              where: { id: match.id },
              data: { winnerId: home, status: "FINISHED" },
            });
          } else if (!home && away) {
            await ctx.prisma.match.update({
              where: { id: match.id },
              data: { winnerId: away, status: "FINISHED" },
            });
          }

          position++;
        }

        // Create empty matches for subsequent rounds
        for (let round = 1; round < totalRounds; round++) {
          const matchesInRound = bracketSize / Math.pow(2, round + 1);
          for (let pos = 0; pos < matchesInRound; pos++) {
            await ctx.prisma.match.create({
              data: {
                tournamentId: input.tournamentId,
                categoryId: category.id,
                phase: phaseForRound(round) as any,
                bracketRound: round,
                bracketPosition: pos,
              },
            });
          }
        }
      }

      return { success: true };
    }),
});

async function recalculateGroupStandings(prisma: any, groupId: string) {
  const standings = await prisma.groupStanding.findMany({
    where: { groupId },
  });

  const matches = await prisma.match.findMany({
    where: { groupId, status: "FINISHED" },
    include: { sets: true },
  });

  // Reset all standings for this group
  for (const standing of standings) {
    let wins = 0, losses = 0, setsWon = 0, setsLost = 0, gamesWon = 0, gamesLost = 0;
    let matchesPlayed = 0;

    for (const match of matches) {
      const isHome = match.homeTeamId === standing.teamId;
      const isAway = match.awayTeamId === standing.teamId;
      if (!isHome && !isAway) continue;

      matchesPlayed++;
      if (match.winnerId === standing.teamId) wins++;
      else losses++;

      for (const set of match.sets) {
        const myGames = isHome ? set.homeGames : set.awayGames;
        const theirGames = isHome ? set.awayGames : set.homeGames;
        gamesWon += myGames;
        gamesLost += theirGames;
        if (myGames > theirGames) setsWon++;
        else if (theirGames > myGames) setsLost++;
      }
    }

    await prisma.groupStanding.update({
      where: { id: standing.id },
      data: {
        matchesPlayed,
        wins,
        losses,
        setsWon,
        setsLost,
        gamesWon,
        gamesLost,
        points: wins * 3, // 3 points per win
      },
    });
  }

  // Update positions
  const updated = await prisma.groupStanding.findMany({
    where: { groupId },
    orderBy: [{ points: "desc" }, { setsWon: "desc" }, { gamesWon: "desc" }],
  });

  for (let i = 0; i < updated.length; i++) {
    await prisma.groupStanding.update({
      where: { id: updated[i].id },
      data: { position: i + 1 },
    });
  }
}

async function advanceWinner(prisma: any, match: any, winnerId: string) {
  if (match.bracketRound === null || match.bracketPosition === null) return;

  const nextRound = match.bracketRound + 1;
  const nextPosition = Math.floor(match.bracketPosition / 2);
  const isTopSlot = match.bracketPosition % 2 === 0;

  const nextMatch = await prisma.match.findFirst({
    where: {
      tournamentId: match.tournamentId,
      categoryId: match.categoryId,
      bracketRound: nextRound,
      bracketPosition: nextPosition,
    },
  });

  if (nextMatch) {
    await prisma.match.update({
      where: { id: nextMatch.id },
      data: isTopSlot ? { homeTeamId: winnerId } : { awayTeamId: winnerId },
    });
  }
}
