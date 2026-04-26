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
      <a
        href={`/torneo/${slug}`}
        className="mb-8 inline-block text-sm font-medium text-white/50 transition hover:text-white"
      >
        ← {tournament?.name || "Torneo"}
      </a>

      <h1 className="mb-2 text-3xl font-black uppercase tracking-tight">Consultar inscripcion</h1>
      <p className="mb-10 text-white/60">
        Introduce el email de cualquiera de los dos jugadores.
      </p>

      <form onSubmit={handleSearch} className="mb-10 flex gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setSearched(false);
          }}
          placeholder="tu@email.com"
          className="flex-1 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-white/40 backdrop-blur-sm focus:border-cyan focus:outline-none focus:ring-1 focus:ring-cyan"
          required
        />
        <button
          type="submit"
          disabled={isLoading || !tournament}
          className="rounded-xl bg-black px-6 py-3 font-bold uppercase tracking-wide text-white transition hover:bg-cyan disabled:opacity-50"
        >
          {isLoading ? "..." : "Buscar"}
        </button>
      </form>

      {searched && !isLoading && (
        <>
          {!team ? (
            <div className="rounded-[22px] border-2 border-dashed border-white/20 p-10 text-center">
              <p className="font-bold text-white/70">No se encontro ninguna inscripcion</p>
              <p className="mt-2 text-sm text-white/40">
                Verifica que el email es correcto o que te has inscrito en este torneo.
              </p>
            </div>
          ) : (
            <div className="rounded-[22px] bg-white/10 p-6 backdrop-blur-sm">
              {/* Estado */}
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-bold uppercase tracking-wide">Tu inscripcion</h2>
                <span
                  className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wide ${
                    team.registration?.status === "CONFIRMED"
                      ? "bg-cyan/20 text-cyan-light"
                      : team.registration?.status === "PENDING"
                        ? "bg-yellow-400/20 text-yellow-300"
                        : "bg-red-500/20 text-red-300"
                  }`}
                >
                  {team.registration?.status === "CONFIRMED"
                    ? "Confirmada"
                    : team.registration?.status === "PENDING"
                      ? "Pendiente"
                      : "Cancelada"}
                </span>
              </div>

              {/* Equipo */}
              {team.teamName && (
                <div className="mb-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-white/40">Equipo</p>
                  <p className="mt-1 font-bold text-white">{team.teamName}</p>
                </div>
              )}

              {/* Jugadores */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-white/10 p-4">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-white/40">Jugador 1</p>
                  <p className="font-bold text-white">{team.player1.name}</p>
                  <p className="text-sm text-white/50">{team.player1.email}</p>
                  <p className="mt-1 text-xs text-white/30">Nivel: {team.player1.skillLevel}/10</p>
                </div>
                <div className="rounded-xl bg-white/10 p-4">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-white/40">Jugador 2</p>
                  <p className="font-bold text-white">{team.player2.name}</p>
                  <p className="text-sm text-white/50">{team.player2.email}</p>
                  <p className="mt-1 text-xs text-white/30">Nivel: {team.player2.skillLevel}/10</p>
                </div>
              </div>

              {/* Info mensajes */}
              {team.registration?.status === "PENDING" && (
                <div className="mt-6 rounded-xl border border-yellow-400/20 bg-yellow-400/10 p-4 text-sm text-yellow-200">
                  <p className="font-bold">Pendiente de confirmacion</p>
                  <p className="mt-1 text-yellow-200/70">
                    Tu inscripcion esta registrada. El organizador la confirmara
                    cuando verifique el pago.
                  </p>
                </div>
              )}

              {team.registration?.status === "CONFIRMED" && (
                <div className="mt-6 rounded-xl border border-cyan/20 bg-cyan/10 p-4 text-sm text-cyan-light">
                  <p className="font-bold">Inscripcion confirmada</p>
                  <p className="mt-1 text-cyan-light/70">
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
