"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";

type Tournament = {
  id: string;
  courts: { id: string; name: string; hasStreaming: boolean }[];
};

export function PistasTab({
  tournament,
  onUpdate,
}: {
  tournament: Tournament;
  onUpdate: () => void;
}) {
  const [name, setName] = useState("");
  const [hasStreaming, setHasStreaming] = useState(false);

  const addMutation = trpc.tournament.addCourt.useMutation({
    onSuccess: () => {
      setName("");
      setHasStreaming(false);
      onUpdate();
    },
  });

  const deleteMutation = trpc.tournament.deleteCourt.useMutation({
    onSuccess: onUpdate,
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    addMutation.mutate({ tournamentId: tournament.id, name, hasStreaming });
  };

  const handleQuickAdd = (count: number) => {
    const existing = tournament.courts.length;
    for (let i = 1; i <= count; i++) {
      addMutation.mutate({
        tournamentId: tournament.id,
        name: `Pista ${existing + i}`,
        hasStreaming: false,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Lista actual */}
      <section className="rounded-lg border bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase text-gray-500">
            Pistas ({tournament.courts.length})
          </h3>
          {tournament.courts.length === 0 && (
            <div className="flex gap-2">
              <button
                onClick={() => handleQuickAdd(2)}
                className="rounded-md border px-3 py-1 text-sm text-green-600 hover:bg-green-50"
              >
                + 2 pistas
              </button>
              <button
                onClick={() => handleQuickAdd(4)}
                className="rounded-md border px-3 py-1 text-sm text-green-600 hover:bg-green-50"
              >
                + 4 pistas
              </button>
            </div>
          )}
        </div>
        {tournament.courts.length === 0 ? (
          <p className="text-sm text-gray-400">No hay pistas. Anade una abajo o usa los botones rapidos.</p>
        ) : (
          <div className="space-y-2">
            {tournament.courts.map((court) => (
              <div
                key={court.id}
                className="flex items-center justify-between rounded-md border px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="font-medium">{court.name}</span>
                  {court.hasStreaming && (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600">
                      STREAMING
                    </span>
                  )}
                </div>
                <button
                  onClick={() => deleteMutation.mutate({ courtId: court.id })}
                  disabled={deleteMutation.isPending}
                  className="text-sm text-red-500 hover:text-red-700 disabled:opacity-50"
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Formulario */}
      <section className="rounded-lg border bg-white p-6">
        <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
          Anadir pista
        </h3>
        <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Nombre</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Pista Central"
              className="rounded-md border px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              required
            />
          </div>
          <label className="flex items-center gap-2 py-2">
            <input
              type="checkbox"
              checked={hasStreaming}
              onChange={(e) => setHasStreaming(e.target.checked)}
              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            <span className="text-sm text-gray-700">Con streaming</span>
          </label>
          <button
            type="submit"
            disabled={addMutation.isPending}
            className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700 disabled:opacity-50"
          >
            Anadir
          </button>
        </form>
      </section>
    </div>
  );
}
