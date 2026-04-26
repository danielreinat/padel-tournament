"use client";

import { useParams } from "next/navigation";
import { trpc } from "@/lib/trpc";

export default function TorneoPage() {
  const params = useParams();
  const slug = params.slug as string;

  const { data: tournament, isLoading } = trpc.tournament.bySlug.useQuery(
    { slug },
    { enabled: !!slug }
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/30 border-t-white" />
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="py-32 text-center">
        <h1 className="text-3xl font-black uppercase text-white">Torneo no encontrado</h1>
        <a href="/" className="mt-6 inline-block text-cyan-light hover:text-white">
          ← Volver al inicio
        </a>
      </div>
    );
  }

  const isOpen = tournament.status === "OPEN";
  const isInProgress = tournament.status === "IN_PROGRESS";
  const isFinished = tournament.status === "FINISHED";

  return (
    <div className="mx-auto max-w-4xl">
      {/* Breadcrumb */}
      <a href="/" className="mb-8 inline-block text-sm font-medium text-white/50 transition hover:text-white">
        ← Todos los torneos
      </a>

      {/* Header */}
      <div className="mb-10">
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <h1 className="text-4xl font-black uppercase tracking-tight md:text-5xl">
            {tournament.name}
          </h1>
          <span
            className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wide ${
              isOpen
                ? "bg-cyan/20 text-cyan-light"
                : isInProgress
                  ? "bg-yellow-400/20 text-yellow-300"
                  : isFinished
                    ? "bg-white/20 text-white/70"
                    : "bg-white/10 text-white/50"
            }`}
          >
            {isOpen
              ? "Inscripciones abiertas"
              : isInProgress
                ? "En curso"
                : isFinished
                  ? "Finalizado"
                  : tournament.status}
          </span>
        </div>
        {tournament.description && (
          <p className="mt-3 text-lg text-white/70">{tournament.description}</p>
        )}
      </div>

      {/* Info cards */}
      <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-[18px] bg-white/10 p-5 backdrop-blur-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-white/40">Fecha</p>
          <p className="mt-1 font-bold text-white">
            {new Date(tournament.dateStart).toLocaleDateString("es-ES", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
            {tournament.dateStart !== tournament.dateEnd && (
              <>
                {" — "}
                {new Date(tournament.dateEnd).toLocaleDateString("es-ES", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </>
            )}
          </p>
        </div>

        {tournament.location && (
          <div className="rounded-[18px] bg-white/10 p-5 backdrop-blur-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-white/40">Ubicacion</p>
            <p className="mt-1 font-bold text-white">{tournament.location}</p>
          </div>
        )}

        <div className="rounded-[18px] bg-white/10 p-5 backdrop-blur-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-white/40">Equipos inscritos</p>
          <p className="mt-1 font-bold text-white">
            {tournament._count.registrations}
            {tournament.maxTeams && ` / ${tournament.maxTeams}`}
          </p>
        </div>

        {tournament.registrationDeadline && (
          <div className="rounded-[18px] bg-white/10 p-5 backdrop-blur-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-white/40">Limite inscripcion</p>
            <p className="mt-1 font-bold text-white">
              {new Date(tournament.registrationDeadline).toLocaleDateString("es-ES", {
                day: "numeric",
                month: "long",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        )}

        <div className="rounded-[18px] bg-white/10 p-5 backdrop-blur-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-white/40">Formato</p>
          <p className="mt-1 font-bold text-white">
            {tournament.numGroups} grupos de {tournament.teamsPerGroup} · Top {tournament.teamsAdvancingPerGroup}
          </p>
        </div>

        <div className="rounded-[18px] bg-white/10 p-5 backdrop-blur-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-white/40">Pistas</p>
          <p className="mt-1 font-bold text-white">
            {tournament.courts.length > 0
              ? tournament.courts.map((c) => c.name).join(", ")
              : `${tournament.numCourts} pistas`}
          </p>
        </div>
      </div>

      {/* Categorias */}
      {tournament.categories.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-white/50">Categorias</h2>
          <div className="flex flex-wrap gap-3">
            {tournament.categories.map((cat) => (
              <span
                key={cat.id}
                className="rounded-full bg-white/10 px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-white backdrop-blur-sm"
              >
                {cat.name} — {cat.level}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* CTA buttons */}
      <div className="flex flex-wrap gap-4">
        {isOpen && (
          <a
            href={`/torneo/${slug}/inscripcion`}
            className="rounded-full bg-black px-10 py-4 text-lg font-bold uppercase tracking-wide text-white transition hover:bg-cyan"
          >
            Inscribirse
          </a>
        )}
        <a
          href={`/torneo/${slug}/estado`}
          className="rounded-full border-2 border-white/30 px-10 py-4 text-lg font-bold uppercase tracking-wide text-white transition hover:border-white hover:bg-white/10"
        >
          Mi inscripcion
        </a>
      </div>

      {/* Section links */}
      {(isInProgress || isFinished) && (
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <a
            href={`/torneo/${slug}/grupos`}
            className="group rounded-[18px] bg-white/10 p-6 text-center backdrop-blur-sm transition hover:bg-white/20"
          >
            <p className="text-3xl">📊</p>
            <p className="mt-2 font-bold uppercase tracking-wide text-white group-hover:text-cyan-light">
              Grupos
            </p>
          </a>
          <a
            href={`/torneo/${slug}/cuadro`}
            className="group rounded-[18px] bg-white/10 p-6 text-center backdrop-blur-sm transition hover:bg-white/20"
          >
            <p className="text-3xl">🏆</p>
            <p className="mt-2 font-bold uppercase tracking-wide text-white group-hover:text-cyan-light">
              Cuadro
            </p>
          </a>
          <a
            href={`/torneo/${slug}/partidos`}
            className="group rounded-[18px] bg-white/10 p-6 text-center backdrop-blur-sm transition hover:bg-white/20"
          >
            <p className="text-3xl">🎾</p>
            <p className="mt-2 font-bold uppercase tracking-wide text-white group-hover:text-cyan-light">
              Partidos
            </p>
          </a>
          <a
            href={`/torneo/${slug}/directo`}
            className="group rounded-[18px] bg-red-500/20 p-6 text-center backdrop-blur-sm transition hover:bg-red-500/30"
          >
            <p className="text-3xl">📺</p>
            <p className="mt-2 font-bold uppercase tracking-wide text-white group-hover:text-red-300">
              En Directo
            </p>
          </a>
        </div>
      )}
    </div>
  );
}
