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
    return <p className="py-20 text-center text-gray-500">Cargando cuadro...</p>;
  }

  const eliminationMatches = matches?.filter((m) => m.phase !== "GROUP") || [];

  if (eliminationMatches.length === 0) {
    return (
      <div className="mx-auto max-w-3xl">
        <a href={`/torneo/${slug}`} className="mb-6 inline-block text-sm text-gray-500 hover:text-gray-700">
          ← {tournament.name}
        </a>
        <h1 className="mb-4 text-2xl font-bold">Cuadro Eliminatorio</h1>
        <p className="text-gray-500">El cuadro eliminatorio aun no esta disponible.</p>
      </div>
    );
  }

  // Group by round
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
      <a href={`/torneo/${slug}`} className="mb-6 inline-block text-sm text-gray-500 hover:text-gray-700">
        ← {tournament.name}
      </a>
      <h1 className="mb-8 text-2xl font-bold">Cuadro Eliminatorio</h1>

      <div className="flex gap-6 overflow-x-auto pb-4">
        {sortedRounds.map(([round, roundMatches]) => (
          <div key={round} className="flex min-w-[240px] flex-col gap-4">
            <h3 className="text-center text-sm font-semibold uppercase text-gray-500">
              {roundMatches[0]?.phase.replace("_", " ") || `Ronda ${round + 1}`}
            </h3>
            <div className="flex flex-col justify-around gap-4" style={{ minHeight: `${roundMatches.length * 90}px` }}>
              {roundMatches
                .sort((a, b) => (a.bracketPosition ?? 0) - (b.bracketPosition ?? 0))
                .map((match) => (
                  <div
                    key={match.id}
                    className={`rounded-md border bg-white p-3 shadow-sm ${
                      match.status === "LIVE" ? "border-red-300 ring-2 ring-red-200" : ""
                    }`}
                  >
                    {match.status === "LIVE" && (
                      <div className="mb-1 text-center text-xs font-bold text-red-600">EN DIRECTO</div>
                    )}
                    <div className={`flex justify-between px-1 py-0.5 text-sm ${match.winnerId === match.homeTeamId ? "font-bold text-green-700" : ""}`}>
                      <span>{teamName(match.homeTeam)}</span>
                      {match.sets.length > 0 && (
                        <span className="text-xs text-gray-400">{match.sets.map((s) => s.homeGames).join(" ")}</span>
                      )}
                    </div>
                    <div className={`flex justify-between px-1 py-0.5 text-sm ${match.winnerId === match.awayTeamId ? "font-bold text-green-700" : ""}`}>
                      <span>{teamName(match.awayTeam)}</span>
                      {match.sets.length > 0 && (
                        <span className="text-xs text-gray-400">{match.sets.map((s) => s.awayGames).join(" ")}</span>
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
