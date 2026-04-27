import { z } from "zod";
import {
  createTournamentSchema,
  updateTournamentSchema,
  categorySchema,
  courtSchema,
} from "@padel/shared";
import { router, publicProcedure, adminProcedure } from "../trpc/trpc";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export const tournamentRouter = router({
  // Public: list tournaments with status OPEN or IN_PROGRESS
  list: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.tournament.findMany({
      where: { status: { in: ["OPEN", "IN_PROGRESS", "FINISHED"] } },
      orderBy: { dateStart: "asc" },
      include: { categories: true, _count: { select: { registrations: true } } },
    });
  }),

  // Public: get tournament by slug
  bySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.tournament.findUnique({
        where: { slug: input.slug },
        include: {
          categories: true,
          courts: true,
          _count: { select: { registrations: true } },
        },
      });
    }),

  // Admin: list all tournaments
  adminList: adminProcedure.query(async ({ ctx }) => {
    return ctx.prisma.tournament.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { registrations: true } } },
    });
  }),

  // Admin: get tournament by id with full details
  byId: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.tournament.findUnique({
        where: { id: input.id },
        include: {
          categories: true,
          courts: true,
          groups: { include: { standings: { include: { team: { include: { player1: true, player2: true } } } } } },
          registrations: { include: { team: { include: { player1: true, player2: true } } } },
          _count: { select: { registrations: true, matches: true } },
        },
      });
    }),

  // Admin: create tournament
  create: adminProcedure
    .input(createTournamentSchema)
    .mutation(async ({ ctx, input }) => {
      const slug = slugify(input.name) + "-" + Date.now().toString(36);
      return ctx.prisma.tournament.create({
        data: {
          ...input,
          slug,
          dateStart: new Date(input.dateStart),
          dateEnd: new Date(input.dateEnd),
          registrationDeadline: input.registrationDeadline
            ? new Date(input.registrationDeadline)
            : undefined,
        },
      });
    }),

  // Admin: update tournament
  update: adminProcedure
    .input(updateTournamentSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.prisma.tournament.update({
        where: { id },
        data: {
          ...data,
          ...(data.dateStart && { dateStart: new Date(data.dateStart) }),
          ...(data.dateEnd && { dateEnd: new Date(data.dateEnd) }),
          ...(data.registrationDeadline && {
            registrationDeadline: new Date(data.registrationDeadline),
          }),
        },
      });
    }),

  // Admin: add category to tournament
  addCategory: adminProcedure
    .input(z.object({ tournamentId: z.string().uuid() }).merge(categorySchema))
    .mutation(async ({ ctx, input }) => {
      const { tournamentId, ...data } = input;
      return ctx.prisma.category.create({
        data: { ...data, tournamentId },
      });
    }),

  // Admin: delete category
  deleteCategory: adminProcedure
    .input(z.object({ categoryId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.category.delete({ where: { id: input.categoryId } });
    }),

  // Admin: add court to tournament
  addCourt: adminProcedure
    .input(z.object({ tournamentId: z.string().uuid() }).merge(courtSchema))
    .mutation(async ({ ctx, input }) => {
      const { tournamentId, ...data } = input;
      return ctx.prisma.court.create({
        data: { ...data, tournamentId },
      });
    }),

  // Admin: delete court
  deleteCourt: adminProcedure
    .input(z.object({ courtId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.court.delete({ where: { id: input.courtId } });
    }),
});
