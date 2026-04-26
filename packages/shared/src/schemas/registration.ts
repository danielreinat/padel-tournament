import { z } from "zod";
import { createPlayerSchema } from "./player";

export const RegistrationStatus = z.enum(["PENDING", "CONFIRMED", "CANCELLED"]);
export type RegistrationStatus = z.infer<typeof RegistrationStatus>;

export const PaymentMethod = z.enum(["BIZUM", "CASH", "TRANSFER", "FREE"]);
export type PaymentMethod = z.infer<typeof PaymentMethod>;

// Schema para inscripcion completa desde la web publica
// (crea 2 jugadores + equipo + inscripcion en un solo paso)
export const publicRegistrationSchema = z.object({
  tournamentId: z.string().uuid(),
  categoryId: z.string().uuid(),
  teamName: z.string().max(100).optional(),
  player1: createPlayerSchema,
  player2: createPlayerSchema,
});
export type PublicRegistrationInput = z.infer<typeof publicRegistrationSchema>;

export const confirmRegistrationSchema = z.object({
  registrationId: z.string().uuid(),
  paymentMethod: PaymentMethod,
});
export type ConfirmRegistrationInput = z.infer<typeof confirmRegistrationSchema>;
