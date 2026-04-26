"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { isAuthenticated } from "@/lib/auth";
import { useEffect } from "react";

export default function NuevoTorneoPage() {
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) router.replace("/login");
  }, [router]);

  const [form, setForm] = useState({
    name: "",
    description: "",
    location: "",
    dateStart: "",
    dateEnd: "",
    registrationDeadline: "",
    maxTeams: "",
    numGroups: "4",
    teamsPerGroup: "4",
    teamsAdvancingPerGroup: "2",
    numCourts: "2",
  });

  const [error, setError] = useState("");

  const createMutation = trpc.tournament.create.useMutation({
    onSuccess: (tournament) => {
      router.push(`/torneos/${tournament.id}`);
    },
    onError: (err) => setError(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    createMutation.mutate({
      name: form.name,
      description: form.description || undefined,
      location: form.location || undefined,
      dateStart: form.dateStart,
      dateEnd: form.dateEnd,
      registrationDeadline: form.registrationDeadline
        ? new Date(form.registrationDeadline).toISOString()
        : undefined,
      maxTeams: form.maxTeams ? Number(form.maxTeams) : undefined,
      numGroups: Number(form.numGroups),
      teamsPerGroup: Number(form.teamsPerGroup),
      teamsAdvancingPerGroup: Number(form.teamsAdvancingPerGroup),
      numCourts: Number(form.numCourts),
    });
  };

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <div className="min-h-screen">
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto flex max-w-4xl items-center gap-4 px-6 py-4">
          <a href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">
            ← Dashboard
          </a>
          <h1 className="text-xl font-bold text-green-700">Nuevo Torneo</h1>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Info basica */}
          <section className="rounded-lg border bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold">Informacion General</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Nombre del torneo *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={set("name")}
                  className="w-full rounded-md border px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                  required
                  minLength={3}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Descripcion
                </label>
                <textarea
                  value={form.description}
                  onChange={set("description")}
                  rows={3}
                  className="w-full rounded-md border px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Ubicacion
                </label>
                <input
                  type="text"
                  value={form.location}
                  onChange={set("location")}
                  className="w-full rounded-md border px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                />
              </div>
            </div>
          </section>

          {/* Fechas */}
          <section className="rounded-lg border bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold">Fechas</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Fecha inicio *
                </label>
                <input
                  type="date"
                  value={form.dateStart}
                  onChange={set("dateStart")}
                  className="w-full rounded-md border px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Fecha fin *
                </label>
                <input
                  type="date"
                  value={form.dateEnd}
                  onChange={set("dateEnd")}
                  className="w-full rounded-md border px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Limite inscripciones
                </label>
                <input
                  type="datetime-local"
                  value={form.registrationDeadline}
                  onChange={set("registrationDeadline")}
                  className="w-full rounded-md border px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                />
              </div>
            </div>
          </section>

          {/* Configuracion torneo */}
          <section className="rounded-lg border bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold">Configuracion del Torneo</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Max. equipos
                </label>
                <input
                  type="number"
                  value={form.maxTeams}
                  onChange={set("maxTeams")}
                  min="2"
                  className="w-full rounded-md border px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                  placeholder="Sin limite"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Numero de grupos
                </label>
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
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Equipos por grupo
                </label>
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
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Clasificados por grupo
                </label>
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
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Numero de pistas
                </label>
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

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="rounded-md bg-green-600 px-6 py-2 font-medium text-white transition hover:bg-green-700 disabled:opacity-50"
            >
              {createMutation.isPending ? "Creando..." : "Crear Torneo"}
            </button>
            <a
              href="/dashboard"
              className="rounded-md border px-6 py-2 font-medium text-gray-600 transition hover:bg-gray-50"
            >
              Cancelar
            </a>
          </div>
        </form>
      </main>
    </div>
  );
}
