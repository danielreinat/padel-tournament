"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, removeToken } from "@/lib/auth";
import { trpc } from "@/lib/trpc";

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
    }
  }, [router]);

  const { data: tournaments, isLoading } = trpc.tournament.adminList.useQuery(
    undefined,
    { enabled: isAuthenticated() }
  );

  const handleLogout = () => {
    removeToken();
    router.replace("/login");
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <h1 className="text-xl font-bold text-green-700">Admin Panel</h1>
          <button
            onClick={handleLogout}
            className="rounded-md px-4 py-2 text-sm text-gray-600 transition hover:bg-gray-100"
          >
            Cerrar sesion
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Torneos</h2>
          <a
            href="/torneos/nuevo"
            className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700"
          >
            + Nuevo Torneo
          </a>
        </div>

        {isLoading ? (
          <p className="text-gray-500">Cargando...</p>
        ) : !tournaments || tournaments.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
            <p className="text-gray-500">No hay torneos creados.</p>
            <p className="mt-2 text-sm text-gray-400">
              Crea tu primer torneo para empezar.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                    Equipos
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {tournaments.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{t.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(t.dateStart).toLocaleDateString("es-ES")}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          t.status === "DRAFT"
                            ? "bg-gray-100 text-gray-600"
                            : t.status === "OPEN"
                              ? "bg-green-100 text-green-700"
                              : t.status === "IN_PROGRESS"
                                ? "bg-yellow-100 text-yellow-700"
                                : t.status === "FINISHED"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-red-100 text-red-600"
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {t._count.registrations}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <a
                        href={`/torneos/${t.id}`}
                        className="text-sm font-medium text-green-600 hover:text-green-700"
                      >
                        Gestionar
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
