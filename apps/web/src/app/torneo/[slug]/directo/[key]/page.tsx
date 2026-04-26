"use client";

import { useParams } from "next/navigation";
import { useEffect, useRef } from "react";

const STREAM_URL = process.env.NEXT_PUBLIC_STREAM_URL || "http://localhost:8889";

export default function StreamPlayerPage() {
  const params = useParams();
  const slug = params.slug as string;
  const streamKey = params.key as string;
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const hlsUrl = `${STREAM_URL}/${streamKey}/index.m3u8`;

    async function initPlayer() {
      const video = videoRef.current;
      if (!video) return;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = hlsUrl;
        video.play().catch(() => {});
        return;
      }

      try {
        const Hls = (await import("hls.js")).default;
        if (Hls.isSupported()) {
          const hls = new Hls({
            lowLatencyMode: true,
            liveSyncDurationCount: 3,
          });
          hls.loadSource(hlsUrl);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            video.play().catch(() => {});
          });
          return () => hls.destroy();
        }
      } catch {
        console.error("hls.js not available");
      }
    }

    initPlayer();
  }, [streamKey]);

  return (
    <div className="mx-auto max-w-4xl">
      <a
        href={`/torneo/${slug}/directo`}
        className="mb-6 inline-block text-sm font-medium text-white/50 transition hover:text-white"
      >
        ← Volver a directos
      </a>

      <div className="overflow-hidden rounded-[22px] bg-black shadow-2xl">
        <video
          ref={videoRef}
          controls
          autoPlay
          muted
          playsInline
          className="aspect-video w-full"
        >
          Tu navegador no soporta video HTML5.
        </video>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <span className="rounded-full bg-red-500 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-white">
          En directo
        </span>
      </div>
    </div>
  );
}
