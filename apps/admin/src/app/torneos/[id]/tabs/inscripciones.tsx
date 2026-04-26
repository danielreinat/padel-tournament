"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";

const PAYMENT_METHODS = [
  { value: "BIZUM", label: "Bizum" },
  { value: "CASH", label: "Efectivo" },
  { value: "TRANSFER", label: "Transferencia" },
  { value: "FREE", label: "Gratis" },
] as const;

type PaymentMethod = (typeof PAYMENT_METHODS)[number]["value"];

export function InscripcionesTab({ tournamentId }: { tournamentId: string }) {
  const { data: registrations, isLoading, refetch } =
    trpc.registration.listByTournament.useQuery({ tournamentId });

  const confirmMutation = trpc.registration.confirm.useMutation({
    onSuccess: () => { refetch(); },
  });

  const cancelMutation = trpc.registration.cancel.useMutation({
    onSuccess: () => { refetch(); },
  });

  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("BIZUM");

  const handleConfirm = (registrationId: string) => {
    confirmMutation.mutate({ registrationId, paymentMethod });
    setConfirmingId(null);
  };

  if (isLoading) {
    return <p className="text-gray-500">Cargando inscripciones...</p>;
  }

  if (!registrations || registrations.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
        <p className="text-gray-500">No hay inscripciones todavia.</p>
        <p className="mt-2 text-sm text-gray-400">
          Las inscripciones apareceran cuando los jugadores se registren desde la web publica.
        </p>
      </div>
    );
  }

  const pending = registrations.filter((r) => r.status === "PENDING");
  const confirmed = registrations.filter((r) => r.status === "CONFIRMED");
  const cancelled = registrations.filter((r) => r.status === "CANCELLED");

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border bg-white p-4 text-center">
          <p className="text-2xl font-bold text-yellow-600">{pending.length}</p>
          <p className="text-sm text-gray-500">Pendientes</p>
        </div>
        <div className="rounded-lg border bg-white p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{confirmed.length}</p>
          <p className="text-sm text-gray-500">Confirmadas</p>
        </div>
        <div className="rounded-lg border bg-white p-4 text-center">
          <p className="text-2xl font-bold text-red-600">{cancelled.length}</p>
          <p className="text-sm text-gray-500">Canceladas</p>
        </div>
      </div>

      {/* Tabla */}
      <section className="overflow-hidden rounded-lg border bg-white shadow-sm">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Equipo</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Jugador 1</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Jugador 2</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Categoria</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Nivel</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Estado</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Pago</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {registrations.map((reg) => (
              <tr key={reg.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium">
                  {reg.team.teamName || `${reg.team.player1.name.split(" ")[0]} / ${reg.team.player2.name.split(" ")[0]}`}
                </td>
                <td className="px-4 py-3 text-sm">
                  <div>{reg.team.player1.name}</div>
                  <div className="text-xs text-gray-400">{reg.team.player1.email}</div>
                </td>
                <td className="px-4 py-3 text-sm">
                  <div>{reg.team.player2.name}</div>
                  <div className="text-xs text-gray-400">{reg.team.player2.email}</div>
                </td>
                <td className="px-4 py-3 text-sm">{reg.team.category.name}</td>
                <td className="px-4 py-3 text-sm">
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs">
                    {reg.team.avgLevel.toFixed(1)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      reg.status === "PENDING"
                        ? "bg-yellow-100 text-yellow-700"
                        : reg.status === "CONFIRMED"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-600"
                    }`}
                  >
                    {reg.status === "PENDING"
                      ? "Pendiente"
                      : reg.status === "CONFIRMED"
                        ? "Confirmada"
                        : "Cancelada"}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {reg.paymentMethod || "-"}
                </td>
                <td className="px-4 py-3 text-right">
                  {reg.status === "PENDING" && (
                    <div className="flex items-center justify-end gap-2">
                      {confirmingId === reg.id ? (
                        <div className="flex items-center gap-2">
                          <select
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                            className="rounded-md border px-2 py-1 text-sm focus:border-green-500 focus:outline-none"
                          >
                            {PAYMENT_METHODS.map((pm) => (
                              <option key={pm.value} value={pm.value}>
                                {pm.label}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleConfirm(reg.id)}
                            disabled={confirmMutation.isPending}
                            className="rounded-md bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700 disabled:opacity-50"
                          >
                            OK
                          </button>
                          <button
                            onClick={() => setConfirmingId(null)}
                            className="text-sm text-gray-500 hover:text-gray-700"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => setConfirmingId(reg.id)}
                            className="rounded-md bg-green-50 px-3 py-1 text-sm font-medium text-green-700 hover:bg-green-100"
                          >
                            Confirmar
                          </button>
                          <button
                            onClick={() => cancelMutation.mutate({ registrationId: reg.id })}
                            disabled={cancelMutation.isPending}
                            className="rounded-md bg-red-50 px-3 py-1 text-sm font-medium text-red-600 hover:bg-red-100 disabled:opacity-50"
                          >
                            Cancelar
                          </button>
                        </>
                      )}
                    </div>
                  )}
                  {reg.status === "CONFIRMED" && (
                    <button
                      onClick={() => cancelMutation.mutate({ registrationId: reg.id })}
                      disabled={cancelMutation.isPending}
                      className="rounded-md bg-red-50 px-3 py-1 text-sm font-medium text-red-600 hover:bg-red-100 disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
