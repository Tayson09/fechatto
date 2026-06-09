"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ClientForm } from "@/components/clients/client-form";
import type { ClientDetail } from "@/types/client";

export default function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [client, setClient] = useState<ClientDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchClient = useCallback(async () => {
    try {
      const res = await fetch(`/api/clients/${id}`);
      if (res.ok) {
        const { data } = await res.json();
        setClient(data);
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchClient();
  }, [fetchClient]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="space-y-1">
        <Link
          href={`/clients/${id}`}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition hover:text-slate-900"
        >
          <ChevronLeft className="h-4 w-4" />
          Voltar para ficha
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
          {loading ? "Carregando..." : `Editar — ${client?.name}`}
        </h1>
        <p className="text-sm text-slate-500">
          Atualize os dados do cliente.
        </p>
      </header>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <span className="h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-slate-700" />
          </div>
        ) : client ? (
          <ClientForm
            mode="edit"
            clientId={id}
            defaultValues={client}
          />
        ) : (
          <p className="text-center text-sm text-slate-500">Cliente não encontrado.</p>
        )}
      </div>
    </div>
  );
}
