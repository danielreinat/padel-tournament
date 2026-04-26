"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";

function teamName(team: any): string {
  if (!team) return "TBD";
  return team.teamName || `${team.player1.name.split(" ")[0]} / ${team.player2.name.split(" ")[0]}`;
}

export function ResultadosTab({ tournamentId }: { tournamentId: string }) {
  const { data: matches, isLoading, refetch } = trpc.match.byTournament.useQuery({ tournamentId });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [sets, setSets] = useState<{ homeGames: number; awayGames: number }[]>([
    { homeGames: 0, awayGames: 0 },
    { homeGames: 0, awayGames: 0 },
    { homeGames: 0, awayGames: 0 },
  ]);

  const updateMutation = trpc.match.updateResult.useMutation({
    onSuccess: () => { setEditingId(null); refetch(); },
  });

  const setLiveMutation = trpc.match.setLive.useMutation({
    onSuccess: () => { refetch(); },
  });

  const startEditing = (match: any) => {
    setEditingId(match.id);
    const existing = match.sets || [];
    setSets([
      { homeGames: existing[0]?.homeGames || 0, awayGames: existing[0]?.awayGames || 0 },
      { homeGames: existing[1]?.homeGames || 0, awayGames: existing[1]?.awayGames || 0 },
      { homeGames: existing[2]?.homeGames || 0, awayGames: existing[2]?.awayGames || 0 },
    ]);
  };

  const saveResult = (match: any) => {
    // Count sets won
    let homeSets = 0, awaySets = 0;
    const validSets = sets.filter((s) => s.homeGames > 0 || s.awayGames > 0);
    for (const s of validSets) {
      if (s.homeGames > s.awayGames) homeSets++;
      else if (s.awayGames > s.homeGames) awaySets++;
    }
    const winnerId = homeSets > awaySets ? match.homeTeamId : match.awayTeamId;

    updateMutation.mutate({
      matchId: match.id,
      sets: validSets.map((s, i) => ({
        setNumber: i + 1,
        homeGames: s.homeGames,
        awayGames: s.awayGames,
      })),
      winnerId,
    });
  };

  if (isLoading) return <p className="text-gray-500">Cargando partidos...</p>;
  if (!matches || matches.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
        <p className="text-gray-500">No hay partidos generados.</p>
        <p className="mt-2 text-sm text-gray-400">Genera los grupos primero.</p>
      </div>
    );
  }

  const scheduled = matches.filter((m) => m.status === "SCHEDULED");
  const live = matches.filter((m) => m.status === "LIVE");
  const finished = matches.filter((m) => m.status === "FINISHED");

  const renderMatch = (match: any) => {
    const isEditing = editingId === match.id;

    return (
      <div key={match.id} className="rounded-md border bg-white p-4">
        <div className="mb-2 flex items-center justify-between text-xs text-gray-400">
          <span>
            {match.phase === "GROUP" ? `Grupo ${match.group?.name || ""}` : match.phase}
            {match.court && ` · ${match.court.name}`}
          </span>
          <span
            className={`rounded-full px-2 py-0.5 font-medium ${
              match.status === "LIVE"
                ? "bg-red-100 text-red-600"
                : match.status === "FINISHED"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-500"
            }`}
          >
            {match.status === "LIVE" ? "EN DIRECTO" : match.status}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className={`font-medium ${match.winnerId === match.homeTeamId ? "text-green-700" : ""}`}>
              {teamName(match.homeTeam)}
            </p>
            <p className={`font-medium ${match.winnerId === match.awayTeamId ? "text-green-700" : ""}`}>
              {teamName(match.awayTeam)}
            </p>
          </div>

          {match.status === "FINISHED" && match.sets.length > 0 && (
            <div className="flex gap-3 text-center">
              {match.sets.map((s: any) => (
                <div key={s.setNumber} className="min-w-[2rem]">
                  <p className={`font-mono font-bold ${s.homeGames > s.awayGames ? "text-green-700" : "text-gray-400"}`}>
                    {s.homeGames}
                  </p>
                  <p className={`font-mono font-bold ${s.awayGames > s.homeGames ? "text-green-700" : "text-gray-400"}`}>
                    {s.awayGames}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Edit form */}
        {isEditing && (
          <div className="mt-4 border-t pt-4">
            <div className="mb-3 flex items-center gap-4">
              {[0, 1, 2].map((i) => (
                <div key={i} className="text-center">
                  <p className="mb-1 text-xs text-gray-400">Set {i + 1}</p>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="0"
                      max="7"
                      value={sets[i].homeGames}
                      onChange={(e) => {
                        const v = [...sets];
                        v[i] = { ...v[i], homeGames: Number(e.target.value) };
                        setSets(v);
                      }}
                      className="w-12 rounded border px-2 py-1 text-center text-sm"
                    />
                    <span className="text-gray-400">-</span>
                    <input
                      type="number"
                      min="0"
                      max="7"
                      value={sets[i].awayGames}
                      onChange={(e) => {
                        const v = [...sets];
                        v[i] = { ...v[i], awayGames: Number(e.target.value) };
                        setSets(v);
                      }}
                      className="w-12 rounded border px-2 py-1 text-center text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => saveResult(match)}
                disabled={updateMutation.isPending}
                className="rounded-md bg-green-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
              >
                Guardar resultado
              </button>
              <button
                onClick={() => setEditingId(null)}
                className="rounded-md border px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
            {updateMutation.error && (
              <p className="mt-2 text-sm text-red-600">{updateMutation.error.message}</p>
            )}
          </div>
        )}

        {/* Action buttons */}
        {!isEditing && match.homeTeam && match.awayTeam && (
          <div className="mt-3 flex gap-2">
            {match.status === "SCHEDULED" && (
              <>
                <button
                  onClick={() => setLiveMutation.mutate({ matchId: match.id })}
                  className="rounded-md bg-red-50 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-100"
                >
                  Marcar EN DIRECTO
                </button>
                <button
                  onClick={() => startEditing(match)}
                  className="rounded-md bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100"
                >
                  Meter resultado
                </button>
              </>
            )}
            {match.status === "LIVE" && (
              <button
                onClick={() => startEditing(match)}
                className="rounded-md bg-green-50 px-3 py-1 text-xs font-medium text-green-700 hover:bg-green-100"
              >
                Meter resultado final
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {live.length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-semibold uppercase text-red-600">
            En directo ({live.length})
          </h3>
          <div className="grid gap-3 lg:grid-cols-2">{live.map(renderMatch)}</div>
        </section>
      )}
      {scheduled.length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-semibold uppercase text-gray-500">
            Programados ({scheduled.length})
          </h3>
          <div className="grid gap-3 lg:grid-cols-2">{scheduled.map(renderMatch)}</div>
        </section>
      )}
      {finished.length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-semibold uppercase text-green-600">
            Finalizados ({finished.length})
          </h3>
          <div className="grid gap-3 lg:grid-cols-2">{finished.map(renderMatch)}</div>
        </section>
      )}
    </div>
  );
}
