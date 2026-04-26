"use client";

import { trpc } from "@/lib/trpc";

function teamName(team: any): string {
  if (!team) return "—";
  return team.teamName || `${team.player1.name.split(" ")[0]} / ${team.player2.name.split(" ")[0]}`;
}

export function BracketTab({ tournamentId }: { tournamentId: string }) {
  const { data: matches, isLoading, refetch } = trpc.match.byTournament.useQuery({
    tournamentId,
  });

  const generateMutation = trpc.match.generateBracket.useMutation({
    onSuccess: () => { refetch(); },
  });

  if (isLoading) return <p className="text-gray-500">Cargando...</p>;

  const eliminationMatches = matches?.filter((m) => m.phase !== "GROUP") || [];

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Cuadro Eliminatorio</h3>
        <button
          onClick={() => generateMutation.mutate({ tournamentId })}
          disabled={generateMutation.isPending}
          className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700 disabled:opacity-50"
        >
          {generateMutation.isPending ? "Generando..." : "Generar / Regenerar Bracket"}
        </button>
      </div>
      {generateMutation.error && (
        <p className="text-sm text-red-600">{generateMutation.error.message}</p>
      )}

      {eliminationMatches.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500">No hay cuadro eliminatorio.</p>
          <p className="mt-2 text-sm text-gray-400">
            Termina la fase de grupos y pulsa "Generar Bracket".
          </p>
        </div>
      ) : (
        <div className="flex gap-8 overflow-x-auto pb-4">
          {sortedRounds.map(([round, roundMatches]) => (
            <div key={round} className="flex min-w-[250px] flex-col gap-4">
              <h4 className="text-center text-sm font-semibold uppercase text-gray-500">
                {roundMatches[0]?.phase.replace("_", " ") || `Ronda ${round + 1}`}
              </h4>
              <div className="flex flex-col justify-around gap-4" style={{ minHeight: `${roundMatches.length * 100}px` }}>
                {roundMatches
                  .sort((a, b) => (a.bracketPosition ?? 0) - (b.bracketPosition ?? 0))
                  .map((match) => (
                    <div
                      key={match.id}
                      className={`rounded-md border bg-white p-3 ${
                        match.status === "LIVE" ? "border-red-300 ring-1 ring-red-200" : ""
                      }`}
                    >
                      {match.status === "LIVE" && (
                        <div className="mb-1 text-center text-xs font-bold text-red-600">EN DIRECTO</div>
                      )}
                      <div
                        className={`flex items-center justify-between rounded px-2 py-1 ${
                          match.winnerId === match.homeTeamId ? "bg-green-50 font-bold text-green-700" : ""
                        }`}
                      >
                        <span className="text-sm">{teamName(match.homeTeam)}</span>
                        {match.sets.length > 0 && (
                          <span className="text-xs text-gray-500">
                            {match.sets.map((s) => s.homeGames).join(" ")}
                          </span>
                        )}
                      </div>
                      <div
                        className={`flex items-center justify-between rounded px-2 py-1 ${
                          match.winnerId === match.awayTeamId ? "bg-green-50 font-bold text-green-700" : ""
                        }`}
                      >
                        <span className="text-sm">{teamName(match.awayTeam)}</span>
                        {match.sets.length > 0 && (
                          <span className="text-xs text-gray-500">
                            {match.sets.map((s) => s.awayGames).join(" ")}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
