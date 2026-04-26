"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";

type Tournament = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  location: string | null;
  dateStart: string | Date;
  dateEnd: string | Date;
  registrationDeadline: string | Date | null;
  maxTeams: number | null;
  numGroups: number;
  teamsPerGroup: number;
  teamsAdvancingPerGroup: number;
  numCourts: number;
  status: string;
};

const STATUS_TRANSITIONS: Record<string, { next: string; label: string; color: string }[]> = {
  DRAFT: [{ next: "OPEN", label: "Abrir inscripciones", color: "bg-green-600 hover:bg-green-700" }],
  OPEN: [{ next: "CLOSED", label: "Cerrar inscripciones", color: "bg-orange-600 hover:bg-orange-700" }],
  CLOSED: [
    { next: "IN_PROGRESS", label: "Iniciar torneo", color: "bg-yellow-600 hover:bg-yellow-700" },
    { next: "OPEN", label: "Reabrir inscripciones", color: "bg-green-600 hover:bg-green-700" },
  ],
  IN_PROGRESS: [{ next: "FINISHED", label: "Finalizar torneo", color: "bg-blue-600 hover:bg-blue-700" }],
  FINISHED: [],
};

export function GeneralTab({
  tournament,
  onUpdate,
}: {
  tournament: Tournament;
  onUpdate: () => void;
}) {
  const dateStart = typeof tournament.dateStart === "string"
    ? tournament.dateStart.split("T")[0]
    : new Date(tournament.dateStart).toISOString().split("T")[0];
  const dateEnd = typeof tournament.dateEnd === "string"
    ? tournament.dateEnd.split("T")[0]
    : new Date(tournament.dateEnd).toISOString().split("T")[0];

  const [form, setForm] = useState({
    name: tournament.name,
    description: tournament.description || "",
    location: tournament.location || "",
    dateStart,
    dateEnd,
    maxTeams: tournament.maxTeams?.toString() || "",
    numGroups: tournament.numGroups.toString(),
    teamsPerGroup: tournament.teamsPerGroup.toString(),
    teamsAdvancingPerGroup: tournament.teamsAdvancingPerGroup.toString(),
    numCourts: tournament.numCourts.toString(),
  });
  const [saved, setSaved] = useState(false);

  const updateMutation = trpc.tournament.update.useMutation({
    onSuccess: () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      onUpdate();
    },
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      id: tournament.id,
      name: form.name,
      description: form.description || undefined,
      location: form.location || undefined,
      dateStart: form.dateStart,
      dateEnd: form.dateEnd,
      maxTeams: form.maxTeams ? Number(form.maxTeams) : undefined,
      numGroups: Number(form.numGroups),
      teamsPerGroup: Number(form.teamsPerGroup),
      teamsAdvancingPerGroup: Number(form.teamsAdvancingPerGroup),
      numCourts: Number(form.numCourts),
    });
  };

  const handleStatusChange = (newStatus: string) => {
    updateMutation.mutate(
      { id: tournament.id, status: newStatus as "DRAFT" | "OPEN" | "CLOSED" | "IN_PROGRESS" | "FINISHED" },
      { onSuccess: onUpdate }
    );
  };

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const transitions = STATUS_TRANSITIONS[tournament.status] || [];

  return (
    <div className="space-y-8">
      {/* Status actions */}
      {transitions.length > 0 && (
        <section className="rounded-lg border bg-white p-6">
          <h3 className="mb-3 text-sm font-semibold uppercase text-gray-500">
            Cambiar Estado
          </h3>
          <div className="flex flex-wrap gap-3">
            {transitions.map((t) => (
              <button
                key={t.next}
                onClick={() => handleStatusChange(t.next)}
                disabled={updateMutation.isPending}
                className={`rounded-md px-4 py-2 text-sm font-medium text-white transition disabled:opacity-50 ${t.color}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Edit form */}
      <form onSubmit={handleSave} className="space-y-6">
        <section className="rounded-lg border bg-white p-6">
          <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
            Informacion General
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">Nombre</label>
              <input
                type="text"
                value={form.name}
                onChange={set("name")}
                className="w-full rounded-md border px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">Descripcion</label>
              <textarea
                value={form.description}
                onChange={set("description")}
                rows={3}
                className="w-full rounded-md border px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">Ubicacion</label>
              <input
                type="text"
                value={form.location}
                onChange={set("location")}
                className="w-full rounded-md border px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Fecha inicio</label>
              <input
                type="date"
                value={form.dateStart}
                onChange={set("dateStart")}
                className="w-full rounded-md border px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Fecha fin</label>
              <input
                type="date"
                value={form.dateEnd}
                onChange={set("dateEnd")}
                className="w-full rounded-md border px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                required
              />
            </div>
          </div>
        </section>

        <section className="rounded-lg border bg-white p-6">
          <h3 className="mb-4 text-sm font-semibold uppercase text-gray-500">
            Configuracion
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Max. equipos</label>
              <input
                type="number"
                value={form.maxTeams}
                onChange={set("maxTeams")}
                min="2"
                placeholder="Sin limite"
                className="w-full rounded-md border px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Grupos</label>
              <input
                type="number"
                value={form.numGroups}
                onChange={set("numGroups")}
                min="2"
                max="16"
                className="w-full rounded-md border px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Equipos/grupo</label>
              <input
                type="number"
                value={form.teamsPerGroup}
                onChange={set("teamsPerGroup")}
                min="2"
                max="8"
                className="w-full rounded-md border px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Clasificados/grupo</label>
              <input
                type="number"
                value={form.teamsAdvancingPerGroup}
                onChange={set("teamsAdvancingPerGroup")}
                min="1"
                max="4"
                className="w-full rounded-md border px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Pistas</label>
              <input
                type="number"
                value={form.numCourts}
                onChange={set("numCourts")}
                min="1"
                max="20"
                className="w-full rounded-md border px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                required
              />
            </div>
          </div>
        </section>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="rounded-md bg-green-600 px-6 py-2 font-medium text-white transition hover:bg-green-700 disabled:opacity-50"
          >
            {updateMutation.isPending ? "Guardando..." : "Guardar Cambios"}
          </button>
          {saved && <span className="text-sm text-green-600">Guardado correctamente</span>}
          {updateMutation.error && (
            <span className="text-sm text-red-600">{updateMutation.error.message}</span>
          )}
        </div>
      </form>

      {/* Info adicional */}
      <section className="rounded-lg border bg-gray-50 p-6 text-sm text-gray-500">
        <p><strong>Slug:</strong> {tournament.slug}</p>
        <p><strong>URL publica:</strong> /torneo/{tournament.slug}</p>
      </section>
    </div>
  );
}
