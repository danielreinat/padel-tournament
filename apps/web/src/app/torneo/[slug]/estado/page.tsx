"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { trpc } from "@/lib/trpc";

export default function EstadoInscripcionPage() {
  const params = useParams();
  const slug = params.slug as string;

  const { data: tournament } = trpc.tournament.bySlug.useQuery(
    { slug },
    { enabled: !!slug }
  );

  const [email, setEmail] = useState("");
  const [searched, setSearched] = useState(false);

  const { data: team, isLoading, refetch } = trpc.registration.checkStatus.useQuery(
    { email, tournamentId: tournament?.id || "" },
    { enabled: false }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tournament) return;
    setSearched(true);
    refetch();
  };

  return (
    <div className="mx-auto max-w-lg">
      {/* Breadcrumb */}
      <a
        href={`/torneo/${slug}`}
        className="mb-6 inline-block text-sm text-gray-500 hover:text-gray-700"
      >
        ← {tournament?.name || "Torneo"}
      </a>

      <h1 className="mb-2 text-2xl font-bold">Consultar inscripcion</h1>
      <p className="mb-8 text-gray-500">
        Introduce el email de cualquiera de los dos jugadores.
      </p>

      <form onSubmit={handleSearch} className="mb-8 flex gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setSearched(false);
          }}
          placeholder="tu@email.com"
          className="flex-1 rounded-md border px-4 py-2 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          required
        />
        <button
          type="submit"
          disabled={isLoading || !tournament}
          className="rounded-md bg-green-600 px-6 py-2 font-medium text-white transition hover:bg-green-700 disabled:opacity-50"
        >
          {isLoading ? "Buscando..." : "Buscar"}
        </button>
      </form>

      {searched && !isLoading && (
        <>
          {!team ? (
            <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
              <p className="font-medium text-gray-600">
                No se encontro ninguna inscripcion
              </p>
              <p className="mt-2 text-sm text-gray-400">
                Verifica que el email es correcto o que te has inscrito en este torneo.
              </p>
            </div>
          ) : (
            <div className="rounded-lg border bg-white p-6">
              {/* Estado */}
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Tu inscripcion</h2>
                <span
                  className={`rounded-full px-3 py-1 text-sm font-medium ${
                    team.registration?.status === "CONFIRMED"
                      ? "bg-green-100 text-green-700"
                      : team.registration?.status === "PENDING"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-600"
                  }`}
                >
                  {team.registration?.status === "CONFIRMED"
                    ? "Confirmada"
                    : team.registration?.status === "PENDING"
                      ? "Pendiente de confirmacion"
                      : "Cancelada"}
                </span>
              </div>

              {/* Equipo */}
              {team.teamName && (
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Equipo</p>
                  <p className="font-medium">{team.teamName}</p>
                </div>
              )}

              {/* Jugadores */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-md border p-4">
                  <p className="mb-1 text-xs font-medium uppercase text-gray-400">
                    Jugador 1
                  </p>
                  <p className="font-medium">{team.player1.name}</p>
                  <p className="text-sm text-gray-500">{team.player1.email}</p>
                  <p className="mt-1 text-xs text-gray-400">
                    Nivel: {team.player1.skillLevel}/10
                  </p>
                </div>
                <div className="rounded-md border p-4">
                  <p className="mb-1 text-xs font-medium uppercase text-gray-400">
                    Jugador 2
                  </p>
                  <p className="font-medium">{team.player2.name}</p>
                  <p className="text-sm text-gray-500">{team.player2.email}</p>
                  <p className="mt-1 text-xs text-gray-400">
                    Nivel: {team.player2.skillLevel}/10
                  </p>
                </div>
              </div>

              {/* Info pago pendiente */}
              {team.registration?.status === "PENDING" && (
                <div className="mt-6 rounded-md border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
                  <p className="font-medium">Pendiente de confirmacion</p>
                  <p className="mt-1">
                    Tu inscripcion esta registrada. El organizador la confirmara
                    cuando verifique el pago. Contacta con la organizacion si tienes dudas.
                  </p>
                </div>
              )}

              {team.registration?.status === "CONFIRMED" && (
                <div className="mt-6 rounded-md border border-green-200 bg-green-50 p-4 text-sm text-green-800">
                  <p className="font-medium">Inscripcion confirmada</p>
                  <p className="mt-1">
                    Ya estas dentro del torneo. Consulta los grupos y horarios
                    cuando esten publicados.
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
