import { z } from "zod";

export const createTeamSchema = z.object({
  categoryId: z.string().uuid(),
  player1Id: z.string().uuid(),
  player2Id: z.string().uuid(),
  teamName: z.string().max(100).optional(),
});
export type CreateTeamInput = z.infer<typeof createTeamSchema>;
