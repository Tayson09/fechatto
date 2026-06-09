"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Search, UserPlus, ChevronLeft, ChevronRight, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ClientTableRow } from "./client-table-row";
import { cn } from "@/lib/utils";
import type { ClientCard, ClientStatus } from "@/types/client";

const STATUS_FILTERS: { value: ClientStatus | ""; label: string }[] = [
  { value: "", label: "Todos" },
  { value: "LEAD", label: "Lead" },
  { value: "IN_PROGRESS", label: "Em Atendimento" },
  { value: "PROPOSAL", label: "Proposta" },
  { value: "VISIT", label: "Visita" },
  { value: "CLOSED", label: "Fechado" },
  { value: "LOST", label: "Perdido" },
];

const LIMIT = 20;

export function ClientListView() {
  const [clients, setClients] = useState<ClientCard[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState<ClientStatus | "">("");

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(LIMIT),
        ...(search ? { search } : {}),
        ...(statusFilter ? { status: statusFilter } : {}),
      });
      const res = await fetch(`/api/clients?${params}`);
      if (res.ok) {
        const { data, total: t } = await res.json();
        setClients(data);
        setTotal(t);
      }
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  }

  function handleStatusChange(value: ClientStatus | "") {
    setPage(1);
    setStatusFilter(value);
  }

  function handleArchive(id: string) {
    setClients((prev) => prev.filter((c) => c.id !== id));
    setTotal((t) => t - 1);
  }

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Buscar por nome..."
            className="pl-10"
          />
        </form>
        <Link href="/clients/new">
          <Button className="w-full bg-[#082a54] text-white hover:bg-[#0b3a6e] sm:w-auto">
            <UserPlus className="h-4 w-4" />
            Novo cliente
          </Button>
        </Link>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-1 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => handleStatusChange(f.value)}
            className={cn(
              "shrink-0 rounded-xl px-3 py-1.5 text-sm font-medium transition-colors",
              statusFilter === f.value
                ? "bg-slate-950 text-white shadow-sm"
                : "text-slate-500 hover:bg-slate-100"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table card */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <span className="h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-slate-700" />
          </div>
        ) : clients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Users className="mb-3 h-10 w-10 text-slate-200" />
            <p className="text-sm font-medium text-slate-500">Nenhum cliente encontrado</p>
            <p className="mt-1 text-xs text-slate-400">
              {search || statusFilter
                ? "Tente outros filtros ou limpe a busca"
                : "Cadastre seu primeiro cliente"}
            </p>
            {!search && !statusFilter && (
              <Link href="/clients/new" className="mt-4">
                <Button size="sm" className="bg-[#082a54] text-white hover:bg-[#0b3a6e]">
                  <UserPlus className="h-4 w-4" />
                  Novo cliente
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80">
                  <th className="py-3 pl-5 pr-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                    Cliente
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                    Status
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                    Localização
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                    Follow-up
                  </th>
                  <th className="py-3 pl-3 pr-5" />
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <ClientTableRow
                    key={client.id}
                    client={client}
                    onArchive={handleArchive}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {total > LIMIT && (
          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
            <p className="text-sm text-slate-500">
              {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} de {total}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="px-2 text-sm text-slate-600">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
