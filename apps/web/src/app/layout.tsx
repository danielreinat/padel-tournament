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
  themeColor: "#15803d",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="flex min-h-screen flex-col bg-gray-50 text-gray-900 antialiased">
        <TRPCProvider>
          <header className="border-b bg-white">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
              <a href="/" className="text-xl font-bold text-green-700">
                Torneos Padel
              </a>
            </div>
          </header>
          <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">{children}</main>
          <footer className="border-t bg-white py-6 text-center text-sm text-gray-400">
            Torneos de Padel
          </footer>
        </TRPCProvider>
      </body>
    </html>
  );
}
