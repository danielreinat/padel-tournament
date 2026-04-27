import type { Metadata, Viewport } from "next";
import "./globals.css";
import { TRPCProvider } from "@/lib/trpc-provider";

export const metadata: Metadata = {
  title: {
    default: "Torneos de Padel",
    template: "%s | Torneos de Padel",
  },
  description:
    "Plataforma de gestion de torneos de padel. Inscribete, consulta grupos, cuadros, resultados y sigue los partidos en directo.",
  openGraph: {
    type: "website",
    locale: "es_ES",
    siteName: "Torneos de Padel",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#00243a",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen text-white antialiased" style={{
        background: "linear-gradient(180deg, #00243a 0%, #003d5c 20%, #045a8d 45%, #0693e3 75%, #f0f4f8 100%)",
        backgroundAttachment: "fixed",
      }}>
        <TRPCProvider>
          <header className="border-b border-white/10">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5">
              <a href="/" className="text-2xl font-black uppercase tracking-tight text-white">
                Torneos Padel
              </a>
              <nav className="hidden items-center gap-6 text-sm font-semibold uppercase tracking-wide text-white/80 sm:flex">
                <a href="/" className="transition hover:text-white">Inicio</a>
              </nav>
            </div>
          </header>
          <main className="mx-auto w-full max-w-7xl px-4 py-8">{children}</main>
          <footer className="mt-auto border-t border-black/5 bg-white py-8 text-center text-sm text-gray-400">
            Torneos de Padel
          </footer>
        </TRPCProvider>
      </body>
    </html>
  );
}
