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
    return (
      <div className="flex items-center justify-center py-32">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/30 border-t-white" />
      </div>
    );
  }

  const liveStreams = streams?.filter((s) => s.status === "LIVE") || [];
  const inactiveStreams = streams?.filter((s) => s.status === "INACTIVE") || [];

  return (
    <div className="mx-auto max-w-5xl">
      <a href={`/torneo/${slug}`} className="mb-8 inline-block text-sm font-medium text-white/50 transition hover:text-white">
        ← {tournament.name}
      </a>
      <h1 className="mb-10 text-3xl font-black uppercase tracking-tight md:text-4xl">En Directo</h1>

      {liveStreams.length === 0 && inactiveStreams.length === 0 ? (
        <div className="rounded-[22px] border-2 border-dashed border-white/20 py-20 text-center">
          <p className="text-lg text-white/60">No hay retransmisiones en este momento.</p>
          <p className="mt-2 text-sm text-white/30">Vuelve mas tarde para ver los partidos en directo.</p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {liveStreams.map((stream) => (
            <a
              key={stream.id}
              href={`/torneo/${slug}/directo/${stream.streamKey}`}
              className="group overflow-hidden rounded-[22px] bg-white/10 backdrop-blur-sm transition hover:bg-white/20"
            >
              <div className="flex aspect-video items-center justify-center bg-black/40">
                <div className="text-center">
                  <span className="mb-3 inline-block rounded-full bg-red-500 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-white">
                    En directo
                  </span>
                  <p className="text-sm text-white/50">Pulsa para ver</p>
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-bold uppercase tracking-wide text-white group-hover:text-cyan-light">
                  {stream.title || "Retransmision en vivo"}
                </h3>
                {stream.match && (
                  <p className="mt-2 text-sm text-white/50">
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
