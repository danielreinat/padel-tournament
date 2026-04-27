import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, publicProcedure, adminProcedure } from "../trpc/trpc";

const OPTIMIZER_URL = process.env.OPTIMIZER_URL || "http://localhost:8000";

export const groupRouter = router({
  // Public: get groups for a tournament
  byTournament: publicProcedure
    .input(z.object({ tournamentId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.group.findMany({
        where: { tournamentId: input.tournamentId },
        include: {
          category: true,
          standings: {
            include: {
              team: { include: { player1: true, player2: true } },
            },
            orderBy: [{ points: "desc" }, { setsWon: "desc" }, { gamesWon: "desc" }],
          },
        },
        orderBy: { name: "asc" },
      });
    }),

  // Admin: generate groups using OR-Tools optimizer
  generate: adminProcedure
    .input(z.object({ tournamentId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const tournament = await ctx.prisma.tournament.findUnique({
        where: { id: input.tournamentId },
        include: {
          categories: true,
          courts: true,
          registrations: {
            where: { status: "CONFIRMED" },
            include: { team: true },
          },
        },
      });

      if (!tournament) throw new TRPCError({ code: "NOT_FOUND" });
      if (tournament.status !== "CLOSED") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "El torneo debe estar en estado CLOSED para generar grupos",
        });
      }

      const confirmedTeams = tournament.registrations.map((r) => r.team);
      if (confirmedTeams.length < 2) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Necesitas al menos 2 equipos confirmados (tienes ${confirmedTeams.length})`,
        });
      }

      // Group teams by category
      const teamsByCategory = new Map<string, typeof confirmedTeams>();
      for (const team of confirmedTeams) {
        const list = teamsByCategory.get(team.categoryId) || [];
        list.push(team);
        teamsByCategory.set(team.categoryId, list);
      }

      // Delete existing groups and matches for this tournament
      await ctx.prisma.match.deleteMany({ where: { tournamentId: input.tournamentId, phase: "GROUP" } });
      await ctx.prisma.groupStanding.deleteMany({
        where: { group: { tournamentId: input.tournamentId } },
      });
      await ctx.prisma.group.deleteMany({ where: { tournamentId: input.tournamentId } });

      const allGroups = [];

      for (const [categoryId, teams] of teamsByCategory) {
        const teamsPerGroup = tournament.teamsPerGroup || 3;
        const numGroups = Math.max(1, Math.ceil(teams.length / teamsPerGroup));

        // Try optimizer first, fallback to round-robin
        let groupAssignments: { groups: { group_name: string; team_ids: string[] }[] };
        try {
          const res = await fetch(`${OPTIMIZER_URL}/generate-groups`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              teams: teams.map((t) => ({ id: t.id, avg_level: t.avgLevel })),
              num_groups: numGroups,
            }),
          });
          if (!res.ok) throw new Error(await res.text());
          groupAssignments = await res.json();
        } catch {
          // Fallback: simple round-robin distribution sorted by level
          const sorted = [...teams].sort((a, b) => b.avgLevel - a.avgLevel);
          const groupBuckets: string[][] = Array.from({ length: numGroups }, () => []);
          sorted.forEach((t, i) => groupBuckets[i % numGroups].push(t.id));

          const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
          groupAssignments = {
            groups: groupBuckets
              .filter((b) => b.length > 0)
              .map((teamIds, i) => ({
                group_name: letters[i] || `G${i + 1}`,
                team_ids: teamIds,
              })),
          };
          console.log(`Optimizer no disponible para categoría ${categoryId}, usando fallback round-robin (${groupAssignments.groups.length} grupos)`);
        }

        // Create groups and standings
        for (const ga of groupAssignments.groups) {
          const group = await ctx.prisma.group.create({
            data: {
              tournamentId: input.tournamentId,
              categoryId,
              name: ga.group_name,
            },
          });

          for (const teamId of ga.team_ids) {
            await ctx.prisma.groupStanding.create({
              data: { groupId: group.id, teamId },
            });
          }

          allGroups.push({ ...group, teamIds: ga.team_ids });
        }

        // Generate schedule
        try {
          const scheduleRes = await fetch(`${OPTIMIZER_URL}/generate-schedule`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              groups: groupAssignments.groups,
              num_courts: tournament.courts.length || tournament.numCourts,
            }),
          });
          if (!scheduleRes.ok) throw new Error(await scheduleRes.text());
          const schedule = await scheduleRes.json();

          const courts = await ctx.prisma.court.findMany({
            where: { tournamentId: input.tournamentId },
          });

          for (const match of schedule.matches) {
            const groupForMatch = allGroups.find(
              (g) =>
                g.categoryId === categoryId &&
                groupAssignments.groups[match.group_index]?.group_name === g.name
            );

            await ctx.prisma.match.create({
              data: {
                tournamentId: input.tournamentId,
                categoryId,
                homeTeamId: match.home_team_id,
                awayTeamId: match.away_team_id,
                phase: "GROUP",
                groupId: groupForMatch?.id,
                courtId: courts[match.court_index]?.id || null,
                bracketRound: match.round_number,
              },
            });
          }
        } catch (e) {
          // Schedule generation failed but groups were created - that's ok
          console.error("Schedule generation failed:", e);
        }
      }

      return { groupCount: allGroups.length };
    }),
});
