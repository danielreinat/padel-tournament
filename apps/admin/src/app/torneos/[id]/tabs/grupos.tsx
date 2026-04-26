"use client";

import { trpc } from "@/lib/trpc";

export function GruposTab({
  tournamentId,
  tournamentStatus,
}: {
  tournamentId: string;
  tournamentStatus: string;
}) {
  const { data: groups, isLoading, refetch } = trpc.group.byTournament.useQuery({ tournamentId });

  const generateMutation = trpc.group.generate.useMutation({
    onSuccess: () => { refetch(); },
  });

  const canGenerate = tournamentStatus === "CLOSED";

  return (
    <div className="space-y-6">
      {/* Generate button */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Grupos</h3>
        <div className="flex items-center gap-3">
          {generateMutation.error && (
            <span className="text-sm text-red-600">{generateMutation.error.message}</span>
          )}
          <button
            onClick={() => generateMutation.mutate({ tournamentId })}
            disabled={!canGenerate || generateMutation.isPending}
            className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700 disabled:opacity-50"
          >
            {generateMutation.isPending ? "Generando..." : "Generar Grupos (OR-Tools)"}
          </button>
          {!canGenerate && (
            <span className="text-xs text-gray-400">
              (El torneo debe estar en estado CLOSED)
            </span>
          )}
        </div>
      </div>

      {isLoading && <p className="text-gray-500">Cargando...</p>}

      {groups && groups.length === 0 && (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500">No hay grupos generados.</p>
          <p className="mt-2 text-sm text-gray-400">
            Cierra las inscripciones y pulsa "Generar Grupos" para crear los grupos automaticamente.
          </p>
        </div>
      )}

      {groups && groups.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-2">
          {groups.map((group) => (
            <div key={group.id} className="rounded-lg border bg-white p-4">
              <div className="mb-3 flex items-center justify-between">
                <h4 className="font-semibold">
                  Grupo {group.name}
                  <span className="ml-2 text-sm font-normal text-gray-400">
                    {group.category.name} — {group.category.level}
                  </span>
                </h4>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-gray-500">
                    <th className="pb-2">#</th>
                    <th className="pb-2">Equipo</th>
                    <th className="pb-2 text-center">PJ</th>
                    <th className="pb-2 text-center">V</th>
                    <th className="pb-2 text-center">D</th>
                    <th className="pb-2 text-center">Sets</th>
                    <th className="pb-2 text-center">Games</th>
                    <th className="pb-2 text-center">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {group.standings.map((s, i) => (
                    <tr key={s.id} className={`border-b last:border-0 ${i < 2 ? "bg-green-50" : ""}`}>
                      <td className="py-2 font-medium">{s.position || i + 1}</td>
                      <td className="py-2">
                        {s.team.teamName || `${s.team.player1.name.split(" ")[0]} / ${s.team.player2.name.split(" ")[0]}`}
                      </td>
                      <td className="py-2 text-center">{s.matchesPlayed}</td>
                      <td className="py-2 text-center">{s.wins}</td>
                      <td className="py-2 text-center">{s.losses}</td>
                      <td className="py-2 text-center">{s.setsWon}-{s.setsLost}</td>
                      <td className="py-2 text-center">{s.gamesWon}-{s.gamesLost}</td>
                      <td className="py-2 text-center font-bold">{s.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
