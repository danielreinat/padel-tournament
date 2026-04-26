"use client";

import { trpc } from "@/lib/trpc";

export default function HomePage() {
  const { data: tournaments, isLoading } = trpc.tournament.list.useQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/30 border-t-white" />
      </div>
    );
  }

  if (!tournaments || tournaments.length === 0) {
    return (
      <div className="py-32 text-center">
        <h1 className="text-5xl font-black uppercase tracking-tight md:text-7xl">
          Torneos de Padel
        </h1>
        <p className="mt-6 text-lg text-white/70">
          No hay torneos disponibles en este momento.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Hero */}
      <div className="py-16 text-center md:py-24">
        <h1 className="text-5xl font-black uppercase tracking-tight md:text-7xl">
          Todo por el Padel
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-white/70">
          Consulta torneos, inscribete, sigue los resultados y disfruta de los
          partidos en directo.
        </p>
      </div>

      {/* Tournament grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {tournaments.map((tournament) => (
          <a
            key={tournament.id}
            href={`/torneo/${tournament.slug}`}
            className="group overflow-hidden rounded-[22px] bg-white/10 backdrop-blur-sm transition hover:bg-white/20"
          >
            {/* Top accent */}
            <div className="h-2 bg-gradient-to-r from-cyan to-cyan-light" />

            <div className="p-6">
              <div className="mb-3 flex items-center justify-between">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
                    tournament.status === "OPEN"
                      ? "bg-cyan/20 text-cyan-light"
                      : tournament.status === "IN_PROGRESS"
                        ? "bg-yellow-400/20 text-yellow-300"
                        : tournament.status === "FINISHED"
                          ? "bg-white/20 text-white/70"
                          : "bg-white/10 text-white/50"
                  }`}
                >
                  {tournament.status === "OPEN"
                    ? "Inscripciones abiertas"
                    : tournament.status === "IN_PROGRESS"
                      ? "En curso"
                      : tournament.status === "FINISHED"
                        ? "Finalizado"
                        : tournament.status}
                </span>
              </div>

              <h2 className="text-xl font-bold uppercase tracking-tight text-white group-hover:text-cyan-light">
                {tournament.name}
              </h2>

              {tournament.location && (
                <p className="mt-1 text-sm text-white/60">{tournament.location}</p>
              )}

              <p className="mt-3 text-sm text-white/50">
                {new Date(tournament.dateStart).toLocaleDateString("es-ES", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>

              <div className="mt-4 flex items-center gap-2 text-sm text-white/40">
                <span>{tournament._count.registrations} equipos</span>
                {tournament.categories.length > 0 && (
                  <>
                    <span>·</span>
                    <span>{tournament.categories.map((c) => c.name).join(", ")}</span>
                  </>
                )}
              </div>

              <div className="mt-5">
                <span className="inline-block rounded-full bg-black px-6 py-2.5 text-sm font-bold uppercase tracking-wide text-white transition group-hover:bg-cyan">
                  Ver torneo
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
