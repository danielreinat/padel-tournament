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

      // Check if native HLS is supported (Safari)
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = hlsUrl;
        video.play().catch(() => {});
        return;
      }

      // Use hls.js for other browsers
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
        className="mb-4 inline-block text-sm text-gray-500 hover:text-gray-700"
      >
        ← Volver a directos
      </a>

      <div className="overflow-hidden rounded-lg bg-black">
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

      <div className="mt-4 flex items-center gap-3">
        <span className="rounded-full bg-red-600 px-3 py-1 text-sm font-bold text-white">
          EN DIRECTO
        </span>
      </div>
    </div>
  );
}
