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
    return (
      <div className="flex items-center justify-center py-32">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/30 border-t-white" />
      </div>
    );
  }

  if (!matches || matches.length === 0) {
    return (
      <div className="mx-auto max-w-3xl">
        <a href={`/torneo/${slug}`} className="mb-8 inline-block text-sm font-medium text-white/50 transition hover:text-white">
          ← {tournament.name}
        </a>
        <h1 className="mb-4 text-3xl font-black uppercase tracking-tight">Partidos</h1>
        <div className="rounded-[22px] border-2 border-dashed border-white/20 py-20 text-center">
          <p className="text-lg text-white/60">Aun no hay partidos programados.</p>
        </div>
      </div>
    );
  }

  const live = matches.filter((m) => m.status === "LIVE");
  const scheduled = matches.filter((m) => m.status === "SCHEDULED");
  const finished = matches.filter((m) => m.status === "FINISHED");

  const renderMatch = (match: any) => (
    <div
      key={match.id}
      className={`overflow-hidden rounded-[18px] bg-white/10 backdrop-blur-sm ${
        match.status === "LIVE" ? "ring-2 ring-red-500" : ""
      }`}
    >
      {match.status === "LIVE" && (
        <div className="bg-red-500 py-1 text-center text-[10px] font-black uppercase tracking-widest text-white">
          En directo
        </div>
      )}
      <div className="p-5">
        <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-white/30">
          {match.phase === "GROUP" ? `Grupo ${match.group?.name || ""}` : match.phase.replace("_", " ")}
          {match.court && ` · ${match.court.name}`}
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className={`font-bold ${match.winnerId === match.homeTeamId ? "text-cyan-light" : "text-white/80"}`}>
              {teamName(match.homeTeam)}
            </p>
            <p className={`font-bold ${match.winnerId === match.awayTeamId ? "text-cyan-light" : "text-white/80"}`}>
              {teamName(match.awayTeam)}
            </p>
          </div>
          {match.sets.length > 0 && (
            <div className="flex gap-4">
              {match.sets.map((s: any) => (
                <div key={s.setNumber} className="text-center">
                  <p className={`font-mono text-sm font-black ${s.homeGames > s.awayGames ? "text-cyan-light" : "text-white/30"}`}>
                    {s.homeGames}
                  </p>
                  <p className={`font-mono text-sm font-black ${s.awayGames > s.homeGames ? "text-cyan-light" : "text-white/30"}`}>
                    {s.awayGames}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-3xl">
      <a href={`/torneo/${slug}`} className="mb-8 inline-block text-sm font-medium text-white/50 transition hover:text-white">
        ← {tournament.name}
      </a>
      <h1 className="mb-10 text-3xl font-black uppercase tracking-tight md:text-4xl">Partidos</h1>

      <div className="space-y-10">
        {live.length > 0 && (
          <section>
            <h2 className="mb-4 text-xs font-black uppercase tracking-widest text-red-400">En directo</h2>
            <div className="grid gap-4">{live.map(renderMatch)}</div>
          </section>
        )}
        {scheduled.length > 0 && (
          <section>
            <h2 className="mb-4 text-xs font-black uppercase tracking-widest text-white/40">Proximos</h2>
            <div className="grid gap-4">{scheduled.map(renderMatch)}</div>
          </section>
        )}
        {finished.length > 0 && (
          <section>
            <h2 className="mb-4 text-xs font-black uppercase tracking-widest text-cyan-light/60">Finalizados</h2>
            <div className="grid gap-4">{finished.map(renderMatch)}</div>
          </section>
        )}
      </div>
    </div>
  );
}
