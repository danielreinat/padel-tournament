"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";

const SKILL_LEVELS = [
  { value: 1, label: "1 — Principiante" },
  { value: 2, label: "2" },
  { value: 3, label: "3 — Basico" },
  { value: 4, label: "4" },
  { value: 5, label: "5 — Intermedio" },
  { value: 6, label: "6" },
  { value: 7, label: "7 — Avanzado" },
  { value: 8, label: "8" },
  { value: 9, label: "9 — Profesional" },
  { value: 10, label: "10 — Elite" },
];

export default function InscripcionPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const { data: tournament, isLoading } = trpc.tournament.bySlug.useQuery(
    { slug },
    { enabled: !!slug }
  );

  const [form, setForm] = useState({
    categoryId: "",
    teamName: "",
    player1Name: "",
    player1Email: "",
    player1Phone: "",
    player1Skill: "5",
    player2Name: "",
    player2Email: "",
    player2Phone: "",
    player2Skill: "5",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const registerMutation = trpc.registration.register.useMutation({
    onSuccess: () => {
      setSuccess(true);
    },
    onError: (err) => setError(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!tournament) return;

    if (form.player1Email === form.player2Email) {
      setError("Los dos jugadores deben tener emails diferentes.");
      return;
    }

    registerMutation.mutate({
      tournamentId: tournament.id,
      categoryId: form.categoryId,
      teamName: form.teamName || undefined,
      player1: {
        name: form.player1Name,
        email: form.player1Email,
        phone: form.player1Phone || undefined,
        skillLevel: Number(form.player1Skill),
      },
      player2: {
        name: form.player2Name,
        email: form.player2Email,
        phone: form.player2Phone || undefined,
        skillLevel: Number(form.player2Skill),
      },
    });
  };

  const set =
    (field: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-500">Cargando...</p>
      </div>
    );
  }

  if (!tournament || tournament.status !== "OPEN") {
    return (
      <div className="mx-auto max-w-lg py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-800">
          {!tournament ? "Torneo no encontrado" : "Inscripciones cerradas"}
        </h1>
        <p className="mt-2 text-gray-500">
          {tournament
            ? "Este torneo no acepta inscripciones en este momento."
            : "El torneo que buscas no existe."}
        </p>
        <a
          href={tournament ? `/torneo/${slug}` : "/"}
          className="mt-4 inline-block text-green-600 hover:text-green-700"
        >
          ← Volver
        </a>
      </div>
    );
  }

  if (success) {
    return (
      <div className="mx-auto max-w-lg py-20 text-center">
        <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-800">Inscripcion registrada</h1>
        <p className="mt-3 text-gray-600">
          Tu inscripcion ha sido enviada correctamente. El organizador la confirmara
          cuando verifique el pago.
        </p>
        <p className="mt-2 text-sm text-gray-500">
          Puedes consultar el estado de tu inscripcion en cualquier momento.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3">
          <a
            href={`/torneo/${slug}/estado`}
            className="rounded-md bg-green-600 px-6 py-2 font-medium text-white transition hover:bg-green-700"
          >
            Consultar estado
          </a>
          <a
            href={`/torneo/${slug}`}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Volver al torneo
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Breadcrumb */}
      <a
        href={`/torneo/${slug}`}
        className="mb-6 inline-block text-sm text-gray-500 hover:text-gray-700"
      >
        ← {tournament.name}
      </a>

      <h1 className="mb-2 text-2xl font-bold">Inscripcion</h1>
      <p className="mb-8 text-gray-500">
        Rellena los datos de los dos jugadores de la pareja.
      </p>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Categoria */}
        <section className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">Categoria</h2>
          <select
            value={form.categoryId}
            onChange={set("categoryId")}
            className="w-full rounded-md border px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            required
          >
            <option value="">Selecciona una categoria</option>
            {tournament.categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name} — {cat.level}
              </option>
            ))}
          </select>
        </section>

        {/* Nombre equipo */}
        <section className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">Nombre del equipo</h2>
          <input
            type="text"
            value={form.teamName}
            onChange={set("teamName")}
            placeholder="Opcional (ej: Los Invencibles)"
            className="w-full rounded-md border px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          />
          <p className="mt-1 text-xs text-gray-400">
            Si no pones nombre se usara el de los jugadores.
          </p>
        </section>

        {/* Jugador 1 */}
        <section className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">Jugador 1</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Nombre completo *
              </label>
              <input
                type="text"
                value={form.player1Name}
                onChange={set("player1Name")}
                className="w-full rounded-md border px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                required
                minLength={2}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Email *
              </label>
              <input
                type="email"
                value={form.player1Email}
                onChange={set("player1Email")}
                className="w-full rounded-md border px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Telefono
              </label>
              <input
                type="tel"
                value={form.player1Phone}
                onChange={set("player1Phone")}
                className="w-full rounded-md border px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Nivel *
              </label>
              <select
                value={form.player1Skill}
                onChange={set("player1Skill")}
                className="w-full rounded-md border px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                required
              >
                {SKILL_LEVELS.map((lvl) => (
                  <option key={lvl.value} value={lvl.value}>
                    {lvl.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Jugador 2 */}
        <section className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">Jugador 2</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Nombre completo *
              </label>
              <input
                type="text"
                value={form.player2Name}
                onChange={set("player2Name")}
                className="w-full rounded-md border px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                required
                minLength={2}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Email *
              </label>
              <input
                type="email"
                value={form.player2Email}
                onChange={set("player2Email")}
                className="w-full rounded-md border px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Telefono
              </label>
              <input
                type="tel"
                value={form.player2Phone}
                onChange={set("player2Phone")}
                className="w-full rounded-md border px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Nivel *
              </label>
              <select
                value={form.player2Skill}
                onChange={set("player2Skill")}
                className="w-full rounded-md border px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                required
              >
                {SKILL_LEVELS.map((lvl) => (
                  <option key={lvl.value} value={lvl.value}>
                    {lvl.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={registerMutation.isPending}
            className="rounded-lg bg-green-600 px-8 py-3 font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
          >
            {registerMutation.isPending ? "Enviando..." : "Enviar Inscripcion"}
          </button>
          <a
            href={`/torneo/${slug}`}
            className="flex items-center rounded-lg border px-6 py-3 font-medium text-gray-600 transition hover:bg-gray-50"
          >
            Cancelar
          </a>
        </div>
      </form>
    </div>
  );
}
