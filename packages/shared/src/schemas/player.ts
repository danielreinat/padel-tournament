import { z } from "zod";

export const createPlayerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().max(20).optional(),
  skillLevel: z.number().int().min(1).max(10).default(5),
});
export type CreatePlayerInput = z.infer<typeof createPlayerSchema>;
