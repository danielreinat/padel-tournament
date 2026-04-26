"use client";

import { useParams } from "next/navigation";
import { trpc } from "@/lib/trpc";

function teamName(team: any): string {
  if (!team) return "TBD";
  return team.teamName || `${team.player1.name.split(" ")[0]} / ${team.player2.name.split(" ")[0]}`;
}

export default function PartidosPage() {
  const params = useParams();
  const slug = params.slug as string;

  const { data: tournament } = trpc.tournament.bySlug.useQuery({ slug }, { enabled: !!slug });
  const { data: matches, isLoading } = trpc.match.byTournament.useQuery(
    { tournamentId: tournament?.id || "" },
    { enabled: !!tournament?.id }
  );

  if (isLoading || !tournament) {
    return <p className="py-20 text-center text-gray-500">Cargando partidos...</p>;
  }

  if (!matches || matches.length === 0) {
    return (
      <div className="mx-auto max-w-3xl">
        <a href={`/torneo/${slug}`} className="mb-6 inline-block text-sm text-gray-500 hover:text-gray-700">
          ← {tournament.name}
        </a>
        <h1 className="mb-4 text-2xl font-bold">Partidos</h1>
        <p className="text-gray-500">Aun no hay partidos programados.</p>
      </div>
    );
  }

  const live = matches.filter((m) => m.status === "LIVE");
  const scheduled = matches.filter((m) => m.status === "SCHEDULED");
  const finished = matches.filter((m) => m.status === "FINISHED");

  const renderMatch = (match: any) => (
    <div
      key={match.id}
      className={`rounded-md border bg-white p-4 ${match.status === "LIVE" ? "border-red-300 ring-1 ring-red-200" : ""}`}
    >
      <div className="mb-2 flex items-center justify-between text-xs text-gray-400">
        <span>
          {match.phase === "GROUP" ? `Grupo ${match.group?.name || ""}` : match.phase.replace("_", " ")}
          {match.court && ` · ${match.court.name}`}
        </span>
        {match.status === "LIVE" && (
          <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-600">
            EN DIRECTO
          </span>
        )}
      </div>
      <div className="flex items-center justify-between">
        <div>
          <p className={`font-medium ${match.winnerId === match.homeTeamId ? "text-green-700" : ""}`}>
            {teamName(match.homeTeam)}
          </p>
          <p className={`font-medium ${match.winnerId === match.awayTeamId ? "text-green-700" : ""}`}>
            {teamName(match.awayTeam)}
          </p>
        </div>
        {match.sets.length > 0 && (
          <div className="flex gap-3">
            {match.sets.map((s: any) => (
              <div key={s.setNumber} className="text-center">
                <p className={`font-mono text-sm font-bold ${s.homeGames > s.awayGames ? "text-green-700" : "text-gray-400"}`}>
                  {s.homeGames}
                </p>
                <p className={`font-mono text-sm font-bold ${s.awayGames > s.homeGames ? "text-green-700" : "text-gray-400"}`}>
                  {s.awayGames}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-3xl">
      <a href={`/torneo/${slug}`} className="mb-6 inline-block text-sm text-gray-500 hover:text-gray-700">
        ← {tournament.name}
      </a>
      <h1 className="mb-8 text-2xl font-bold">Partidos</h1>

      <div className="space-y-8">
        {live.length > 0 && (
          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase text-red-600">En directo</h2>
            <div className="grid gap-3">{live.map(renderMatch)}</div>
          </section>
        )}
        {scheduled.length > 0 && (
          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase text-gray-500">Proximos</h2>
            <div className="grid gap-3">{scheduled.map(renderMatch)}</div>
          </section>
        )}
        {finished.length > 0 && (
          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase text-green-600">Finalizados</h2>
            <div className="grid gap-3">{finished.map(renderMatch)}</div>
          </section>
        )}
      </div>
    </div>
  );
}
