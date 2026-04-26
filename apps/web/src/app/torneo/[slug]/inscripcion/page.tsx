"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
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
      <div className="flex items-center justify-center py-32">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/30 border-t-white" />
      </div>
    );
  }

  if (!tournament || tournament.status !== "OPEN") {
    return (
      <div className="mx-auto max-w-lg py-32 text-center">
        <h1 className="text-3xl font-black uppercase text-white">
          {!tournament ? "Torneo no encontrado" : "Inscripciones cerradas"}
        </h1>
        <p className="mt-3 text-white/60">
          {tournament
            ? "Este torneo no acepta inscripciones en este momento."
            : "El torneo que buscas no existe."}
        </p>
        <a
          href={tournament ? `/torneo/${slug}` : "/"}
          className="mt-6 inline-block text-cyan-light hover:text-white"
        >
          ← Volver
        </a>
      </div>
    );
  }

  if (success) {
    return (
      <div className="mx-auto max-w-lg py-32 text-center">
        <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-cyan/20">
          <svg className="h-10 w-10 text-cyan-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-black uppercase text-white">Inscripcion registrada</h1>
        <p className="mt-4 text-white/70">
          Tu inscripcion ha sido enviada correctamente. El organizador la confirmara
          cuando verifique el pago.
        </p>
        <div className="mt-8 flex flex-col items-center gap-4">
          <a
            href={`/torneo/${slug}/estado`}
            className="rounded-full bg-black px-8 py-3 font-bold uppercase tracking-wide text-white transition hover:bg-cyan"
          >
            Consultar estado
          </a>
          <a
            href={`/torneo/${slug}`}
            className="text-sm text-white/50 hover:text-white"
          >
            Volver al torneo
          </a>
        </div>
      </div>
    );
  }

  const inputClasses =
    "w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-white/40 backdrop-blur-sm focus:border-cyan focus:outline-none focus:ring-1 focus:ring-cyan";
  const labelClasses = "mb-1.5 block text-sm font-semibold uppercase tracking-wide text-white/60";

  return (
    <div className="mx-auto max-w-2xl">
      <a
        href={`/torneo/${slug}`}
        className="mb-8 inline-block text-sm font-medium text-white/50 transition hover:text-white"
      >
        ← {tournament.name}
      </a>

      <h1 className="mb-2 text-3xl font-black uppercase tracking-tight">Inscripcion</h1>
      <p className="mb-10 text-white/60">
        Rellena los datos de los dos jugadores de la pareja.
      </p>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Categoria */}
        <section className="rounded-[22px] bg-white/10 p-6 backdrop-blur-sm">
          <h2 className="mb-4 text-lg font-bold uppercase tracking-wide">Categoria</h2>
          <select
            value={form.categoryId}
            onChange={set("categoryId")}
            className={inputClasses}
            required
          >
            <option value="" className="text-gray-900">Selecciona una categoria</option>
            {tournament.categories.map((cat) => (
              <option key={cat.id} value={cat.id} className="text-gray-900">
                {cat.name} — {cat.level}
              </option>
            ))}
          </select>
        </section>

        {/* Nombre equipo */}
        <section className="rounded-[22px] bg-white/10 p-6 backdrop-blur-sm">
          <h2 className="mb-4 text-lg font-bold uppercase tracking-wide">Nombre del equipo</h2>
          <input
            type="text"
            value={form.teamName}
            onChange={set("teamName")}
            placeholder="Opcional (ej: Los Invencibles)"
            className={inputClasses}
          />
          <p className="mt-2 text-xs text-white/30">
            Si no pones nombre se usara el de los jugadores.
          </p>
        </section>

        {/* Jugador 1 */}
        <section className="rounded-[22px] bg-white/10 p-6 backdrop-blur-sm">
          <h2 className="mb-4 text-lg font-bold uppercase tracking-wide">Jugador 1</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelClasses}>Nombre completo *</label>
              <input type="text" value={form.player1Name} onChange={set("player1Name")} className={inputClasses} required minLength={2} />
            </div>
            <div>
              <label className={labelClasses}>Email *</label>
              <input type="email" value={form.player1Email} onChange={set("player1Email")} className={inputClasses} required />
            </div>
            <div>
              <label className={labelClasses}>Telefono</label>
              <input type="tel" value={form.player1Phone} onChange={set("player1Phone")} className={inputClasses} />
            </div>
            <div>
              <label className={labelClasses}>Nivel *</label>
              <select value={form.player1Skill} onChange={set("player1Skill")} className={inputClasses} required>
                {SKILL_LEVELS.map((lvl) => (
                  <option key={lvl.value} value={lvl.value} className="text-gray-900">{lvl.label}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Jugador 2 */}
        <section className="rounded-[22px] bg-white/10 p-6 backdrop-blur-sm">
          <h2 className="mb-4 text-lg font-bold uppercase tracking-wide">Jugador 2</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelClasses}>Nombre completo *</label>
              <input type="text" value={form.player2Name} onChange={set("player2Name")} className={inputClasses} required minLength={2} />
            </div>
            <div>
              <label className={labelClasses}>Email *</label>
              <input type="email" value={form.player2Email} onChange={set("player2Email")} className={inputClasses} required />
            </div>
            <div>
              <label className={labelClasses}>Telefono</label>
              <input type="tel" value={form.player2Phone} onChange={set("player2Phone")} className={inputClasses} />
            </div>
            <div>
              <label className={labelClasses}>Nivel *</label>
              <select value={form.player2Skill} onChange={set("player2Skill")} className={inputClasses} required>
                {SKILL_LEVELS.map((lvl) => (
                  <option key={lvl.value} value={lvl.value} className="text-gray-900">{lvl.label}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {error && (
          <div className="rounded-xl border border-red-400/30 bg-red-500/20 p-4 text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={registerMutation.isPending}
            className="rounded-full bg-black px-10 py-4 font-bold uppercase tracking-wide text-white transition hover:bg-cyan disabled:opacity-50"
          >
            {registerMutation.isPending ? "Enviando..." : "Enviar Inscripcion"}
          </button>
          <a
            href={`/torneo/${slug}`}
            className="flex items-center rounded-full border-2 border-white/30 px-8 py-4 font-bold uppercase tracking-wide text-white transition hover:border-white hover:bg-white/10"
          >
            Cancelar
          </a>
        </div>
      </form>
    </div>
  );
}
