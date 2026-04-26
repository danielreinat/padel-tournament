import { router } from "./trpc";
import { authRouter } from "../routers/auth.router";
import { tournamentRouter } from "../routers/tournament.router";
import { registrationRouter } from "../routers/registration.router";

export const appRouter = router({
  auth: authRouter,
  tournament: tournamentRouter,
  registration: registrationRouter,
});

export type AppRouter = typeof appRouter;
