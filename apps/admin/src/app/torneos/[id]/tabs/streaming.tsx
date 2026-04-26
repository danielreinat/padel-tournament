"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";

export function StreamingTab({ tournamentId }: { tournamentId: string }) {
  const { data: streams, isLoading, refetch } = trpc.stream.adminList.useQuery({ tournamentId });
  const { data: matches } = trpc.match.byTournament.useQuery({ tournamentId });
  const [title, setTitle] = useState("");
  const [matchId, setMatchId] = useState("");

  const createMutation = trpc.stream.create.useMutation({
    onSuccess: () => { setTitle(""); setMatchId(""); refetch(); },
  });
  const updateStatusMutation = trpc.stream.updateStatus.useMutation({
    onSuccess: () => { refetch(); },
  });
  const deleteMutation = trpc.stream.delete.useMutation({
    onSuccess: () => { refetch(); },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      tournamentId,
      matchId: matchId || undefined,
      title: title || undefined,
    });
  };

  if (isLoading) return <p className="text-gray-500">Cargando...</p>;

  return (
    <div className="space-y-6">
      {/* Create stream */}
      <section className="rounded-lg border bg-white p-6">
        <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
          Crear nuevo stream
        </h3>
        <form onSubmit={handleCreate} className="flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Titulo</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Semifinal Pista Central"
              className="rounded-md border px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Vincular a partido (opcional)
            </label>
            <select
              value={matchId}
              onChange={(e) => setMatchId(e.target.value)}
              className="rounded-md border px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            >
              <option value="">Sin partido</option>
              {matches
                ?.filter((m) => m.homeTeam && m.awayTeam && m.status !== "FINISHED")
                .map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.homeTeam?.teamName || m.homeTeam?.player1.name.split(" ")[0]} vs{" "}
                    {m.awayTeam?.teamName || m.awayTeam?.player1.name.split(" ")[0]}
                  </option>
                ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            Crear Stream
          </button>
        </form>
      </section>

      {/* Stream list */}
      {!streams || streams.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500">No hay streams.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {streams.map((stream) => (
            <div key={stream.id} className="rounded-lg border bg-white p-5">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <span className="font-medium">{stream.title || "Sin titulo"}</span>
                  <span
                    className={`ml-2 rounded-full px-2 py-0.5 text-xs font-medium ${
                      stream.status === "LIVE"
                        ? "bg-red-100 text-red-600"
                        : stream.status === "ENDED"
                          ? "bg-gray-100 text-gray-500"
                          : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {stream.status}
                  </span>
                </div>
                <div className="flex gap-2">
                  {stream.status === "INACTIVE" && (
                    <button
                      onClick={() => updateStatusMutation.mutate({ streamId: stream.id, status: "LIVE" })}
                      className="rounded-md bg-red-50 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-100"
                    >
                      Marcar LIVE
                    </button>
                  )}
                  {stream.status === "LIVE" && (
                    <button
                      onClick={() => updateStatusMutation.mutate({ streamId: stream.id, status: "ENDED" })}
                      className="rounded-md bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100"
                    >
                      Finalizar
                    </button>
                  )}
                  <button
                    onClick={() => deleteMutation.mutate({ streamId: stream.id })}
                    className="rounded-md bg-red-50 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-100"
                  >
                    Eliminar
                  </button>
                </div>
              </div>

              {/* Connection info */}
              <div className="rounded-md bg-gray-50 p-3 text-sm">
                <p>
                  <span className="font-medium text-gray-500">RTMP (OBS):</span>{" "}
                  <code className="rounded bg-gray-200 px-1">{stream.rtmpUrl}</code>
                </p>
                <p className="mt-1">
                  <span className="font-medium text-gray-500">HLS (navegador):</span>{" "}
                  <code className="rounded bg-gray-200 px-1">{stream.hlsUrl}</code>
                </p>
                <p className="mt-1">
                  <span className="font-medium text-gray-500">Stream key:</span>{" "}
                  <code className="rounded bg-gray-200 px-1">{stream.streamKey}</code>
                </p>
              </div>

              {stream.match && (
                <p className="mt-2 text-sm text-gray-500">
                  Partido: {stream.match.homeTeam?.player1.name.split(" ")[0]} / {stream.match.homeTeam?.player2.name.split(" ")[0]} vs{" "}
                  {stream.match.awayTeam?.player1.name.split(" ")[0]} / {stream.match.awayTeam?.player2.name.split(" ")[0]}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
