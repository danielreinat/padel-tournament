import { router } from "./trpc";
import { authRouter } from "../routers/auth.router";
import { tournamentRouter } from "../routers/tournament.router";
import { registrationRouter } from "../routers/registration.router";
import { groupRouter } from "../routers/group.router";
import { matchRouter } from "../routers/match.router";
import { streamRouter } from "../routers/stream.router";

export const appRouter = router({
  auth: authRouter,
  tournament: tournamentRouter,
  registration: registrationRouter,
  group: groupRouter,
  match: matchRouter,
  stream: streamRouter,
});

export type AppRouter = typeof appRouter;
