"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { ClientDetail, ClientStatus, PropertyType } from "@/types/client";

interface ClientFormProps {
  mode: "create" | "edit";
  defaultValues?: Partial<ClientDetail>;
  clientId?: string;
}

const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: "HOUSE", label: "Casa" },
  { value: "APARTMENT", label: "Apartamento" },
  { value: "LAND", label: "Terreno" },
  { value: "COMMERCIAL", label: "Comercial" },
];

const STATUS_OPTIONS: { value: ClientStatus; label: string }[] = [
  { value: "LEAD", label: "Lead" },
  { value: "IN_PROGRESS", label: "Em Atendimento" },
  { value: "PROPOSAL", label: "Proposta" },
  { value: "VISIT", label: "Visita" },
  { value: "CLOSED", label: "Fechado" },
  { value: "LOST", label: "Perdido" },
];

function toDatetimeLocal(iso?: string | null) {
  if (!iso) return "";
  return new Date(iso).toISOString().slice(0, 16);
}

function toNum(v: number | string | null | undefined) {
  if (v == null || v === "") return "";
  return parseFloat(String(v)).toString();
}

export function ClientForm({ mode, defaultValues, clientId }: ClientFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(defaultValues?.name ?? "");
  const [profile, setProfile] = useState(defaultValues?.profile ?? "");
  const [age, setAge] = useState(defaultValues?.age?.toString() ?? "");
  const [profession, setProfession] = useState(defaultValues?.profession ?? "");
  const [income, setIncome] = useState(toNum(defaultValues?.income));
  const [propertyType, setPropertyType] = useState<PropertyType[]>(
    defaultValues?.propertyType ?? []
  );
  const [location, setLocation] = useState(defaultValues?.location ?? "");
  const [priceMin, setPriceMin] = useState(toNum(defaultValues?.priceMin));
  const [priceMax, setPriceMax] = useState(toNum(defaultValues?.priceMax));
  const [notes, setNotes] = useState(defaultValues?.notes ?? "");
  const [status, setStatus] = useState<ClientStatus>(defaultValues?.status ?? "LEAD");
  const [nextFollowUp, setNextFollowUp] = useState(
    toDatetimeLocal(defaultValues?.nextFollowUp)
  );
  const [nextFollowUpNote, setNextFollowUpNote] = useState(
    defaultValues?.nextFollowUpNote ?? ""
  );

  function togglePropertyType(type: PropertyType) {
    setPropertyType((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Nome é obrigatório");
      return;
    }

    setLoading(true);
    setError(null);

    const body = {
      name: name.trim(),
      profile: profile.trim() || null,
      age: age ? parseInt(age, 10) : null,
      profession: profession.trim() || null,
      income: income ? parseFloat(income) : null,
      propertyType,
      location: location.trim() || null,
      priceMin: priceMin ? parseFloat(priceMin) : null,
      priceMax: priceMax ? parseFloat(priceMax) : null,
      notes: notes.trim() || null,
      ...(mode === "edit" ? { status } : {}),
      nextFollowUp: nextFollowUp ? new Date(nextFollowUp).toISOString() : null,
      nextFollowUpNote: nextFollowUpNote.trim() || null,
    };

    try {
      const url = mode === "create" ? "/api/clients" : `/api/clients/${clientId}`;
      const method = mode === "create" ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao salvar cliente");
      }

      const { data } = await res.json();
      router.push(`/clients/${data.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className={cn(
          "rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700",
          "dark:border-red-500/25 dark:bg-red-500/10 dark:text-red-400"
        )}>
          {error}
        </div>
      )}

      {/* Identificação */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Identificação
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Nome <span className="text-red-500">*</span>
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome completo"
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Perfil</label>
            <Input
              value={profile}
              onChange={(e) => setProfile(e.target.value)}
              placeholder="Ex: Investidor, Primeiro imóvel..."
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Profissão</label>
            <Input
              value={profession}
              onChange={(e) => setProfession(e.target.value)}
              placeholder="Profissão"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Idade</label>
            <Input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Idade"
              min={1}
              max={120}
            />
          </div>
        </div>
      </section>

      {/* Financeiro */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Financeiro
        </h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Renda mensal (R$)
            </label>
            <Input
              type="number"
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              placeholder="0,00"
              min={0}
              step={0.01}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Orçamento mínimo (R$)
            </label>
            <Input
              type="number"
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
              placeholder="0,00"
              min={0}
              step={0.01}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Orçamento máximo (R$)
            </label>
            <Input
              type="number"
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
              placeholder="0,00"
              min={0}
              step={0.01}
            />
          </div>
        </div>
      </section>

      {/* Preferências */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Preferências de imóvel
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Tipos de imóvel</label>
            <div className="flex flex-wrap gap-2">
              {PROPERTY_TYPES.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => togglePropertyType(value)}
                  className={cn(
                    "rounded-xl border px-3 py-1.5 text-sm font-medium transition-all",
                    propertyType.includes(value)
                      ? "border-slate-800 bg-slate-950 text-white dark:border-white/20 dark:bg-white dark:text-slate-900"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-400 dark:border-white/10 dark:bg-white/8 dark:text-slate-400 dark:hover:border-white/20 dark:hover:bg-white/12"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Localização desejada</label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Bairro, cidade..."
            />
          </div>
        </div>
      </section>

      {/* Status (somente edição) */}
      {mode === "edit" && (
        <section className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Funil comercial
          </h3>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Etapa atual</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ClientStatus)}
              className={cn(
                "flex h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm outline-none transition",
                "focus:border-slate-400 focus:ring-2 focus:ring-slate-200",
                "dark:border-white/10 dark:bg-[#16253a] dark:text-slate-100 dark:focus:border-white/25 dark:focus:ring-white/8"
              )}
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </section>
      )}

      {/* Follow-up */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Próximo follow-up
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Data e hora</label>
            <Input
              type="datetime-local"
              value={nextFollowUp}
              onChange={(e) => setNextFollowUp(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Ação planejada</label>
            <Input
              value={nextFollowUpNote}
              onChange={(e) => setNextFollowUpNote(e.target.value)}
              placeholder="O que fazer neste contato?"
            />
          </div>
        </div>
      </section>

      {/* Observações */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Observações
        </h3>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Observações gerais sobre o cliente..."
          rows={4}
          className={cn(
            "flex min-h-[100px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition",
            "placeholder:text-slate-400",
            "focus:border-slate-400 focus:ring-2 focus:ring-slate-200",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "dark:border-white/10 dark:bg-[#16253a] dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-white/25 dark:focus:ring-white/8"
          )}
        />
      </section>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-6 dark:border-white/8">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={loading} className="min-w-[120px]">
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Salvando...
            </span>
          ) : mode === "create" ? (
            "Cadastrar cliente"
          ) : (
            "Salvar alterações"
          )}
        </Button>
      </div>
    </form>
  );
}
