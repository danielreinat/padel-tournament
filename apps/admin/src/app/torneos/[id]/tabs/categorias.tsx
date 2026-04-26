"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";

type Tournament = {
  id: string;
  categories: { id: string; name: string; level: string }[];
};

const PRESET_CATEGORIES = [
  { name: "Masculina", level: "Amateur" },
  { name: "Masculina", level: "Intermedio" },
  { name: "Masculina", level: "Avanzado" },
  { name: "Femenina", level: "Amateur" },
  { name: "Femenina", level: "Intermedio" },
  { name: "Mixta", level: "Amateur" },
  { name: "Mixta", level: "Intermedio" },
];

export function CategoriasTab({
  tournament,
  onUpdate,
}: {
  tournament: Tournament;
  onUpdate: () => void;
}) {
  const [name, setName] = useState("");
  const [level, setLevel] = useState("");
  const [showPresets, setShowPresets] = useState(false);

  const addMutation = trpc.tournament.addCategory.useMutation({
    onSuccess: () => {
      setName("");
      setLevel("");
      onUpdate();
    },
  });

  const deleteMutation = trpc.tournament.deleteCategory.useMutation({
    onSuccess: onUpdate,
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !level) return;
    addMutation.mutate({ tournamentId: tournament.id, name, level });
  };

  const handlePreset = (preset: { name: string; level: string }) => {
    addMutation.mutate({
      tournamentId: tournament.id,
      name: preset.name,
      level: preset.level,
    });
  };

  return (
    <div className="space-y-6">
      {/* Lista actual */}
      <section className="rounded-lg border bg-white p-6">
        <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
          Categorias ({tournament.categories.length})
        </h3>
        {tournament.categories.length === 0 ? (
          <p className="text-sm text-gray-400">No hay categorias. Anade una abajo.</p>
        ) : (
          <div className="space-y-2">
            {tournament.categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between rounded-md border px-4 py-3"
              >
                <div>
                  <span className="font-medium">{cat.name}</span>
                  <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                    {cat.level}
                  </span>
                </div>
                <button
                  onClick={() => deleteMutation.mutate({ categoryId: cat.id })}
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

      {/* Presets rapidos */}
      <section className="rounded-lg border bg-white p-6">
        <button
          onClick={() => setShowPresets(!showPresets)}
          className="mb-3 text-sm font-medium text-green-600 hover:text-green-700"
        >
          {showPresets ? "Ocultar" : "Mostrar"} categorias predefinidas
        </button>
        {showPresets && (
          <div className="flex flex-wrap gap-2">
            {PRESET_CATEGORIES.map((preset, i) => {
              const exists = tournament.categories.some(
                (c) => c.name === preset.name && c.level === preset.level
              );
              return (
                <button
                  key={i}
                  onClick={() => handlePreset(preset)}
                  disabled={exists || addMutation.isPending}
                  className={`rounded-full border px-3 py-1 text-sm transition ${
                    exists
                      ? "border-gray-200 bg-gray-50 text-gray-400"
                      : "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                  }`}
                >
                  {preset.name} - {preset.level}
                  {exists && " ✓"}
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* Formulario custom */}
      <section className="rounded-lg border bg-white p-6">
        <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
          Anadir categoria personalizada
        </h3>
        <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Nombre</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Masculina"
              className="rounded-md border px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Nivel</label>
            <input
              type="text"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              placeholder="Ej: Amateur"
              className="rounded-md border px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              required
            />
          </div>
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
