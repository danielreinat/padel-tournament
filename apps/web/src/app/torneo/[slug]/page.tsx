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
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-500">Cargando torneo...</p>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-800">Torneo no encontrado</h1>
        <a href="/" className="mt-4 inline-block text-green-600 hover:text-green-700">
          ← Volver al inicio
        </a>
      </div>
    );
  }

  const isOpen = tournament.status === "OPEN";
  const isInProgress = tournament.status === "IN_PROGRESS";
  const isFinished = tournament.status === "FINISHED";

  return (
    <div className="mx-auto max-w-3xl">
      {/* Breadcrumb */}
      <a href="/" className="mb-6 inline-block text-sm text-gray-500 hover:text-gray-700">
        ← Todos los torneos
      </a>

      {/* Header */}
      <div className="mb-8">
        <div className="mb-2 flex items-center gap-3">
          <h1 className="text-3xl font-bold">{tournament.name}</h1>
          <span
            className={`rounded-full px-3 py-1 text-sm font-medium ${
              isOpen
                ? "bg-green-100 text-green-700"
                : isInProgress
                  ? "bg-yellow-100 text-yellow-700"
                  : isFinished
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-600"
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
          <p className="mt-2 text-gray-600">{tournament.description}</p>
        )}
      </div>

      {/* Info cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-gray-500">Fecha</p>
          <p className="font-medium">
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
          <div className="rounded-lg border bg-white p-4">
            <p className="text-sm text-gray-500">Ubicacion</p>
            <p className="font-medium">{tournament.location}</p>
          </div>
        )}

        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-gray-500">Equipos inscritos</p>
          <p className="font-medium">
            {tournament._count.registrations}
            {tournament.maxTeams && ` / ${tournament.maxTeams}`}
          </p>
        </div>

        {tournament.registrationDeadline && (
          <div className="rounded-lg border bg-white p-4">
            <p className="text-sm text-gray-500">Limite de inscripcion</p>
            <p className="font-medium">
              {new Date(tournament.registrationDeadline).toLocaleDateString("es-ES", {
                day: "numeric",
                month: "long",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        )}

        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-gray-500">Formato</p>
          <p className="font-medium">
            {tournament.numGroups} grupos de {tournament.teamsPerGroup} · Top {tournament.teamsAdvancingPerGroup} clasifican
          </p>
        </div>

        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-gray-500">Pistas</p>
          <p className="font-medium">
            {tournament.courts.length > 0
              ? tournament.courts.map((c) => c.name).join(", ")
              : `${tournament.numCourts} pistas`}
          </p>
        </div>
      </div>

      {/* Categorias */}
      {tournament.categories.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-lg font-semibold">Categorias</h2>
          <div className="flex flex-wrap gap-2">
            {tournament.categories.map((cat) => (
              <span
                key={cat.id}
                className="rounded-full border border-green-200 bg-green-50 px-4 py-2 text-sm font-medium text-green-700"
              >
                {cat.name} — {cat.level}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-4">
        {isOpen && (
          <a
            href={`/torneo/${slug}/inscripcion`}
            className="rounded-lg bg-green-600 px-8 py-3 text-lg font-semibold text-white transition hover:bg-green-700"
          >
            Inscribirse
          </a>
        )}
        <a
          href={`/torneo/${slug}/estado`}
          className="rounded-lg border border-gray-300 px-8 py-3 text-lg font-medium text-gray-700 transition hover:bg-gray-50"
        >
          Consultar mi inscripcion
        </a>
      </div>

      {/* Links a secciones futuras */}
      {(isInProgress || isFinished) && (
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href={`/torneo/${slug}/grupos`}
            className="rounded-md border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Ver Grupos
          </a>
          <a
            href={`/torneo/${slug}/cuadro`}
            className="rounded-md border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Ver Cuadro
          </a>
          <a
            href={`/torneo/${slug}/partidos`}
            className="rounded-md border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Ver Partidos
          </a>
          <a
            href={`/torneo/${slug}/directo`}
            className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
          >
            En Directo
          </a>
        </div>
      )}
    </div>
  );
}
