"use client";

import { useParams } from "next/navigation";
import { trpc } from "@/lib/trpc";

function teamName(team: any): string {
  if (!team) return "—";
  return team.teamName || `${team.player1.name.split(" ")[0]} / ${team.player2.name.split(" ")[0]}`;
}

export default function CuadroPage() {
  const params = useParams();
  const slug = params.slug as string;

  const { data: tournament } = trpc.tournament.bySlug.useQuery({ slug }, { enabled: !!slug });
  const { data: matches, isLoading } = trpc.match.byTournament.useQuery(
    { tournamentId: tournament?.id || "" },
    { enabled: !!tournament?.id }
  );

  if (isLoading || !tournament) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/30 border-t-white" />
      </div>
    );
  }

  const eliminationMatches = matches?.filter((m) => m.phase !== "GROUP") || [];

  if (eliminationMatches.length === 0) {
    return (
      <div className="mx-auto max-w-3xl">
        <a href={`/torneo/${slug}`} className="mb-8 inline-block text-sm font-medium text-white/50 transition hover:text-white">
          ← {tournament.name}
        </a>
        <h1 className="mb-4 text-3xl font-black uppercase tracking-tight">Cuadro Eliminatorio</h1>
        <div className="rounded-[22px] border-2 border-dashed border-white/20 py-20 text-center">
          <p className="text-lg text-white/60">El cuadro eliminatorio aun no esta disponible.</p>
        </div>
      </div>
    );
  }

  const rounds = new Map<number, typeof eliminationMatches>();
  for (const m of eliminationMatches) {
    const round = m.bracketRound ?? 0;
    const list = rounds.get(round) || [];
    list.push(m);
    rounds.set(round, list);
  }
  const sortedRounds = [...rounds.entries()].sort(([a], [b]) => a - b);

  return (
    <div className="mx-auto max-w-7xl">
      <a href={`/torneo/${slug}`} className="mb-8 inline-block text-sm font-medium text-white/50 transition hover:text-white">
        ← {tournament.name}
      </a>
      <h1 className="mb-10 text-3xl font-black uppercase tracking-tight md:text-4xl">Cuadro Eliminatorio</h1>

      <div className="flex gap-6 overflow-x-auto pb-6">
        {sortedRounds.map(([round, roundMatches]) => (
          <div key={round} className="flex min-w-[260px] flex-col gap-4">
            <h3 className="text-center text-xs font-bold uppercase tracking-widest text-white/40">
              {roundMatches[0]?.phase.replace("_", " ") || `Ronda ${round + 1}`}
            </h3>
            <div className="flex flex-col justify-around gap-4" style={{ minHeight: `${roundMatches.length * 100}px` }}>
              {roundMatches
                .sort((a, b) => (a.bracketPosition ?? 0) - (b.bracketPosition ?? 0))
                .map((match) => (
                  <div
                    key={match.id}
                    className={`overflow-hidden rounded-[16px] bg-white/10 backdrop-blur-sm ${
                      match.status === "LIVE" ? "ring-2 ring-red-500" : ""
                    }`}
                  >
                    {match.status === "LIVE" && (
                      <div className="bg-red-500 py-1 text-center text-[10px] font-black uppercase tracking-widest text-white">
                        En directo
                      </div>
                    )}
                    <div className={`flex items-center justify-between px-4 py-2.5 ${match.winnerId === match.homeTeamId ? "bg-cyan/10 font-bold text-white" : "text-white/60"}`}>
                      <span className="text-sm">{teamName(match.homeTeam)}</span>
                      {match.sets.length > 0 && (
                        <span className="font-mono text-xs text-white/40">{match.sets.map((s) => s.homeGames).join("  ")}</span>
                      )}
                    </div>
                    <div className="h-px bg-white/5" />
                    <div className={`flex items-center justify-between px-4 py-2.5 ${match.winnerId === match.awayTeamId ? "bg-cyan/10 font-bold text-white" : "text-white/60"}`}>
                      <span className="text-sm">{teamName(match.awayTeam)}</span>
                      {match.sets.length > 0 && (
                        <span className="font-mono text-xs text-white/40">{match.sets.map((s) => s.awayGames).join("  ")}</span>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
