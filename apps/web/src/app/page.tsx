"use client";

import { trpc } from "@/lib/trpc";

export default function HomePage() {
  const { data: tournaments, isLoading } = trpc.tournament.list.useQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-lg text-gray-500">Cargando torneos...</p>
      </div>
    );
  }

  if (!tournaments || tournaments.length === 0) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-3xl font-bold">Torneos de Padel</h1>
        <p className="mt-4 text-gray-500">No hay torneos disponibles en este momento.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold">Torneos Disponibles</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {tournaments.map((tournament) => (
          <a
            key={tournament.id}
            href={`/torneo/${tournament.slug}`}
            className="rounded-lg border bg-white p-6 shadow-sm transition hover:shadow-md"
          >
            <div className="mb-2 flex items-center justify-between">
              <span
                className={`rounded-full px-2 py-1 text-xs font-medium ${
                  tournament.status === "OPEN"
                    ? "bg-green-100 text-green-700"
                    : tournament.status === "IN_PROGRESS"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-gray-100 text-gray-600"
                }`}
              >
                {tournament.status === "OPEN"
                  ? "Inscripciones abiertas"
                  : tournament.status === "IN_PROGRESS"
                    ? "En curso"
                    : "Finalizado"}
              </span>
            </div>
            <h2 className="text-xl font-semibold">{tournament.name}</h2>
            {tournament.location && (
              <p className="mt-1 text-sm text-gray-500">{tournament.location}</p>
            )}
            <p className="mt-2 text-sm text-gray-600">
              {new Date(tournament.dateStart).toLocaleDateString("es-ES", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
            <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
              <span>{tournament._count.registrations} equipos inscritos</span>
              {tournament.categories.length > 0 && (
                <>
                  <span>·</span>
                  <span>
                    {tournament.categories.map((c) => c.name).join(", ")}
                  </span>
                </>
              )}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
