"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { trpc } from "@/lib/trpc";
import { GeneralTab } from "./tabs/general";
import { CategoriasTab } from "./tabs/categorias";
import { PistasTab } from "./tabs/pistas";
import { InscripcionesTab } from "./tabs/inscripciones";

const TABS = [
  { id: "general", label: "General" },
  { id: "categorias", label: "Categorias" },
  { id: "pistas", label: "Pistas" },
  { id: "inscripciones", label: "Inscripciones" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function TorneoDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [activeTab, setActiveTab] = useState<TabId>("general");

  useEffect(() => {
    if (!isAuthenticated()) router.replace("/login");
  }, [router]);

  const { data: tournament, isLoading, refetch } = trpc.tournament.byId.useQuery(
    { id },
    { enabled: !!id }
  );

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Cargando torneo...</p>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-red-500">Torneo no encontrado</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center gap-4">
            <a href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">
              ← Dashboard
            </a>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold">{tournament.name}</h1>
              <span
                className={`rounded-full px-2 py-1 text-xs font-medium ${
                  tournament.status === "DRAFT"
                    ? "bg-gray-100 text-gray-600"
                    : tournament.status === "OPEN"
                      ? "bg-green-100 text-green-700"
                      : tournament.status === "CLOSED"
                        ? "bg-orange-100 text-orange-700"
                        : tournament.status === "IN_PROGRESS"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-blue-100 text-blue-700"
                }`}
              >
                {tournament.status}
              </span>
            </div>
          </div>

          {/* Tabs */}
          <nav className="mt-4 flex gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-t-md px-4 py-2 text-sm font-medium transition ${
                  activeTab === tab.id
                    ? "bg-green-50 text-green-700 border-b-2 border-green-600"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                {tab.label}
                {tab.id === "inscripciones" && (
                  <span className="ml-1.5 rounded-full bg-gray-200 px-1.5 py-0.5 text-xs">
                    {tournament._count.registrations}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Tab content */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        {activeTab === "general" && (
          <GeneralTab tournament={tournament} onUpdate={refetch} />
        )}
        {activeTab === "categorias" && (
          <CategoriasTab tournament={tournament} onUpdate={refetch} />
        )}
        {activeTab === "pistas" && (
          <PistasTab tournament={tournament} onUpdate={refetch} />
        )}
        {activeTab === "inscripciones" && (
          <InscripcionesTab tournamentId={tournament.id} />
        )}
      </main>
    </div>
  );
}
