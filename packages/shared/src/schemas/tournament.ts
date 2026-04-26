import { z } from "zod";

export const TournamentStatus = z.enum([
  "DRAFT",
  "OPEN",
  "CLOSED",
  "IN_PROGRESS",
  "FINISHED",
]);
export type TournamentStatus = z.infer<typeof TournamentStatus>;

export const createTournamentSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().max(1000).optional(),
  location: z.string().max(200).optional(),
  dateStart: z.string().date(),
  dateEnd: z.string().date(),
  registrationDeadline: z.string().datetime().optional(),
  maxTeams: z.number().int().positive().optional(),
  numGroups: z.number().int().min(2).max(16).default(4),
  teamsPerGroup: z.number().int().min(2).max(8).default(4),
  teamsAdvancingPerGroup: z.number().int().min(1).max(4).default(2),
  numCourts: z.number().int().min(1).max(20).default(2),
});
export type CreateTournamentInput = z.infer<typeof createTournamentSchema>;

export const updateTournamentSchema = createTournamentSchema.partial().extend({
  id: z.string().uuid(),
  status: TournamentStatus.optional(),
});
export type UpdateTournamentInput = z.infer<typeof updateTournamentSchema>;

export const categorySchema = z.object({
  name: z.string().min(1).max(50),
  level: z.string().min(1).max(50),
});
export type CategoryInput = z.infer<typeof categorySchema>;

export const courtSchema = z.object({
  name: z.string().min(1).max(50),
  hasStreaming: z.boolean().default(false),
});
export type CourtInput = z.infer<typeof courtSchema>;
