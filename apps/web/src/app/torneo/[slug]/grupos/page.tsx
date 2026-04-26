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
    return <p className="py-20 text-center text-gray-500">Cargando grupos...</p>;
  }

  return (
    <div className="mx-auto max-w-5xl">
      <a href={`/torneo/${slug}`} className="mb-6 inline-block text-sm text-gray-500 hover:text-gray-700">
        ← {tournament.name}
      </a>
      <h1 className="mb-8 text-2xl font-bold">Fase de Grupos</h1>

      {!groups || groups.length === 0 ? (
        <p className="text-center text-gray-500">Los grupos aun no han sido publicados.</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {groups.map((group) => (
            <div key={group.id} className="rounded-lg border bg-white p-4">
              <h2 className="mb-3 text-lg font-semibold">
                Grupo {group.name}
                <span className="ml-2 text-sm font-normal text-gray-400">
                  {group.category.name}
                </span>
              </h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-gray-500">
                    <th className="pb-2">#</th>
                    <th className="pb-2">Equipo</th>
                    <th className="pb-2 text-center">PJ</th>
                    <th className="pb-2 text-center">V</th>
                    <th className="pb-2 text-center">D</th>
                    <th className="pb-2 text-center">Sets</th>
                    <th className="pb-2 text-center">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {group.standings.map((s, i) => (
                    <tr key={s.id} className={`border-b last:border-0 ${i < 2 ? "bg-green-50" : ""}`}>
                      <td className="py-2 font-medium">{s.position || i + 1}</td>
                      <td className="py-2">
                        {s.team.teamName || `${s.team.player1.name.split(" ")[0]} / ${s.team.player2.name.split(" ")[0]}`}
                      </td>
                      <td className="py-2 text-center">{s.matchesPlayed}</td>
                      <td className="py-2 text-center">{s.wins}</td>
                      <td className="py-2 text-center">{s.losses}</td>
                      <td className="py-2 text-center">{s.setsWon}-{s.setsLost}</td>
                      <td className="py-2 text-center font-bold">{s.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
