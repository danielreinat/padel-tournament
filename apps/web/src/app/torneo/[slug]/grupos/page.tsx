"use client";

import { useParams } from "next/navigation";
import { trpc } from "@/lib/trpc";

export default function GruposPage() {
  const params = useParams();
  const slug = params.slug as string;

  const { data: tournament } = trpc.tournament.bySlug.useQuery({ slug }, { enabled: !!slug });
  const { data: groups, isLoading } = trpc.group.byTournament.useQuery(
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

  return (
    <div className="mx-auto max-w-5xl">
      <a href={`/torneo/${slug}`} className="mb-8 inline-block text-sm font-medium text-white/50 transition hover:text-white">
        ← {tournament.name}
      </a>
      <h1 className="mb-10 text-3xl font-black uppercase tracking-tight md:text-4xl">Fase de Grupos</h1>

      {!groups || groups.length === 0 ? (
        <div className="rounded-[22px] border-2 border-dashed border-white/20 py-20 text-center">
          <p className="text-lg text-white/60">Los grupos aun no han sido publicados.</p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {groups.map((group) => (
            <div key={group.id} className="overflow-hidden rounded-[22px] bg-white/10 backdrop-blur-sm">
              <div className="bg-white/5 px-6 py-4">
                <h2 className="text-lg font-bold uppercase tracking-wide">
                  Grupo {group.name}
                  <span className="ml-2 text-sm font-normal text-white/40">
                    {group.category.name}
                  </span>
                </h2>
              </div>
              <div className="px-6 pb-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-left text-xs font-semibold uppercase tracking-wide text-white/40">
                      <th className="pb-3 pt-4">#</th>
                      <th className="pb-3 pt-4">Equipo</th>
                      <th className="pb-3 pt-4 text-center">PJ</th>
                      <th className="pb-3 pt-4 text-center">V</th>
                      <th className="pb-3 pt-4 text-center">D</th>
                      <th className="pb-3 pt-4 text-center">Sets</th>
                      <th className="pb-3 pt-4 text-center">Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.standings.map((s, i) => (
                      <tr
                        key={s.id}
                        className={`border-b border-white/5 last:border-0 ${i < 2 ? "bg-cyan/10" : ""}`}
                      >
                        <td className="py-3 font-bold text-white/70">{s.position || i + 1}</td>
                        <td className="py-3 font-medium text-white">
                          {s.team.teamName || `${s.team.player1.name.split(" ")[0]} / ${s.team.player2.name.split(" ")[0]}`}
                        </td>
                        <td className="py-3 text-center text-white/60">{s.matchesPlayed}</td>
                        <td className="py-3 text-center text-white/60">{s.wins}</td>
                        <td className="py-3 text-center text-white/60">{s.losses}</td>
                        <td className="py-3 text-center text-white/60">{s.setsWon}-{s.setsLost}</td>
                        <td className="py-3 text-center text-lg font-black text-white">{s.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
