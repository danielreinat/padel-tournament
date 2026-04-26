"use client";

import { useParams } from "next/navigation";
import { trpc } from "@/lib/trpc";

export default function DirectoPage() {
  const params = useParams();
  const slug = params.slug as string;

  const { data: tournament } = trpc.tournament.bySlug.useQuery({ slug }, { enabled: !!slug });
  const { data: streams, isLoading } = trpc.stream.byTournament.useQuery(
    { tournamentId: tournament?.id || "" },
    { enabled: !!tournament?.id }
  );

  if (isLoading || !tournament) {
    return <p className="py-20 text-center text-gray-500">Cargando...</p>;
  }

  const liveStreams = streams?.filter((s) => s.status === "LIVE") || [];
  const inactiveStreams = streams?.filter((s) => s.status === "INACTIVE") || [];

  return (
    <div className="mx-auto max-w-5xl">
      <a href={`/torneo/${slug}`} className="mb-6 inline-block text-sm text-gray-500 hover:text-gray-700">
        ← {tournament.name}
      </a>
      <h1 className="mb-8 text-2xl font-bold">En Directo</h1>

      {liveStreams.length === 0 && inactiveStreams.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 py-20 text-center">
          <p className="text-lg text-gray-500">No hay retransmisiones en este momento.</p>
          <p className="mt-2 text-sm text-gray-400">Vuelve mas tarde para ver los partidos en directo.</p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {liveStreams.map((stream) => (
            <a
              key={stream.id}
              href={`/torneo/${slug}/directo/${stream.streamKey}`}
              className="group rounded-lg border bg-white shadow-sm transition hover:shadow-md"
            >
              <div className="flex aspect-video items-center justify-center rounded-t-lg bg-gray-900">
                <div className="text-center">
                  <span className="mb-2 inline-block rounded-full bg-red-600 px-3 py-1 text-sm font-bold text-white">
                    EN DIRECTO
                  </span>
                  <p className="text-white/70">Pulsa para ver</p>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold group-hover:text-green-700">
                  {stream.title || "Retransmision en vivo"}
                </h3>
                {stream.match && (
                  <p className="mt-1 text-sm text-gray-500">
                    {stream.match.homeTeam?.player1.name.split(" ")[0]} / {stream.match.homeTeam?.player2.name.split(" ")[0]}
                    {" vs "}
                    {stream.match.awayTeam?.player1.name.split(" ")[0]} / {stream.match.awayTeam?.player2.name.split(" ")[0]}
                    {stream.match.court && ` · ${stream.match.court.name}`}
                  </p>
                )}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
