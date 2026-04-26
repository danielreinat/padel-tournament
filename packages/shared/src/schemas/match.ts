import { z } from "zod";

export const MatchPhase = z.enum([
  "GROUP",
  "ROUND_OF_32",
  "ROUND_OF_16",
  "QUARTER",
  "SEMI",
  "THIRD_PLACE",
  "FINAL",
]);
export type MatchPhase = z.infer<typeof MatchPhase>;

export const MatchStatus = z.enum(["SCHEDULED", "LIVE", "FINISHED", "CANCELLED"]);
export type MatchStatus = z.infer<typeof MatchStatus>;

export const setScoreSchema = z.object({
  setNumber: z.number().int().min(1).max(3),
  homeGames: z.number().int().min(0).max(7),
  awayGames: z.number().int().min(0).max(7),
  tiebreakHome: z.number().int().min(0).optional(),
  tiebreakAway: z.number().int().min(0).optional(),
});
export type SetScoreInput = z.infer<typeof setScoreSchema>;

export const updateMatchResultSchema = z.object({
  matchId: z.string().uuid(),
  sets: z.array(setScoreSchema).min(1).max(3),
  winnerId: z.string().uuid(),
});
export type UpdateMatchResultInput = z.infer<typeof updateMatchResultSchema>;
