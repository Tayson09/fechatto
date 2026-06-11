// src/app/(dashboard)/visitas/visits-client.tsx
"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import {
  CalendarClock,
  Plus,
  Search,
  MapPin,
  Pencil,
  Trash2,
  Loader2,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Visit = {
  id: string;
  date: Date;
  result: string | null;
  negotiationId: string;
  negotiation: {
    client: {
      name: string;
    };
    property: {
      address: string;
      city: string;
    };
    status: string;
  };
};

type NegotiationOption = {
  id: string;
  status: string;
  client: { name: string };
  property: { address: string; city: string };
};

type Props = {
  initialVisits: Visit[];
  negotiations: NegotiationOption[];
};

type FormState = {
  id?: string;
  negotiationId: string;
  date: string;
  result: string;
};

function toDatetimeLocal(value?: string | Date) {
  const date = value ? new Date(value) : new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

function statusLabel(status: string) {
  const map: Record<string, string> = {
    IN_PROGRESS: "Em andamento",
    CLOSED_WON: "Fechada",
    CLOSED_LOST: "Perdida",
  };
  return map[status] ?? status;
}

export function VisitsClient({ initialVisits, negotiations }: Props) {
  const [visits, setVisits] = useState(initialVisits);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    negotiationId: negotiations[0]?.id ?? "",
    date: toDatetimeLocal(),
    result: "",
  });

  const filteredVisits = useMemo(() => {
    const q = query.trim().toLowerCase();

    if (!q) return visits;

    return visits.filter((visit) => {
      const client = visit.negotiation.client.name.toLowerCase();
      const address = visit.negotiation.property.address.toLowerCase();
      const city = visit.negotiation.property.city.toLowerCase();
      const result = (visit.result ?? "").toLowerCase();
      return [client, address, city, result].some((field) => field.includes(q));
    });
  }, [visits, query]);

  const total = visits.length;
  const upcoming = visits.filter((v) => new Date(v.date).getTime() >= Date.now()).length;
  const completed = visits.filter((v) => (v.result ?? "").trim().length > 0).length;

  function openCreate() {
    setEditingId(null);
    setForm({
      negotiationId: negotiations[0]?.id ?? "",
      date: toDatetimeLocal(),
      result: "",
    });
    setOpen(true);
  }

  function openEdit(visit: Visit) {
    setEditingId(visit.id);
    setForm({
      id: visit.id,
      negotiationId: visit.negotiationId,
      date: toDatetimeLocal(visit.date),
      result: visit.result ?? "",
    });
    setOpen(true);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        negotiationId: form.negotiationId,
        date: new Date(form.date).toISOString(),
        result: form.result.trim() || null,
      };

      const url = editingId ? `/api/visits/${editingId}` : "/api/visits";
      const method = editingId ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message ?? "Erro ao salvar visita");
      }

      const saved = await response.json();

      if (editingId) {
        setVisits((current) =>
          current.map((item) => (item.id === saved.id ? saved : item))
        );
      } else {
        setVisits((current) => [saved, ...current]);
      }

      setOpen(false);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Erro inesperado");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    const ok = confirm("Deseja excluir esta visita?");
    if (!ok) return;

    const response = await fetch(`/api/visits/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      alert("Não foi possível excluir a visita");
      return;
    }

    setVisits((current) => current.filter((item) => item.id !== id));
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[32px] border border-slate-200/80 bg-gradient-to-br from-white to-slate-50 p-6 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <Badge className="rounded-full bg-slate-900 px-3 py-1 text-white hover:bg-slate-900">
              Visitas
            </Badge>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Gestão de visitas
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Controle visitas por negociação, acompanhe datas, resultados e mantenha a operação organizada.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={openCreate} className="rounded-2xl px-5">
              <Plus className="mr-2 h-4 w-4" />
              Nova visita
            </Button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Card className="rounded-[24px] border-slate-200/80 bg-white/80 shadow-sm">
            <CardContent className="p-5">
              <p className="text-sm text-slate-500">Total</p>
              <div className="mt-2 text-3xl font-semibold text-slate-950">{total}</div>
            </CardContent>
          </Card>

          <Card className="rounded-[24px] border-slate-200/80 bg-white/80 shadow-sm">
            <CardContent className="p-5">
              <p className="text-sm text-slate-500">Próximas</p>
              <div className="mt-2 text-3xl font-semibold text-slate-950">{upcoming}</div>
            </CardContent>
          </Card>

          <Card className="rounded-[24px] border-slate-200/80 bg-white/80 shadow-sm">
            <CardContent className="p-5">
              <p className="text-sm text-slate-500">Com resultado</p>
              <div className="mt-2 text-3xl font-semibold text-slate-950">{completed}</div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por cliente, imóvel, cidade ou resultado..."
            className="h-12 rounded-2xl pl-10"
          />
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          

          <DialogContent className="sm:max-w-[720px] rounded-[28px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Sparkles className="h-5 w-5" />
                {editingId ? "Editar visita" : "Nova visita"}
              </DialogTitle>
            </DialogHeader>

            <form className="grid gap-4" onSubmit={handleSubmit}>
              <div className="grid gap-2">
                <label className="text-sm font-medium text-slate-700">Negociação</label>
                <select
                  value={form.negotiationId}
                  onChange={(e) => setForm((s) => ({ ...s, negotiationId: e.target.value }))}
                  className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none ring-0"
                >
                  {negotiations.map((neg) => (
                    <option key={neg.id} value={neg.id}>
                      {neg.client.name} — {neg.property.address}, {neg.property.city} ({statusLabel(neg.status)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium text-slate-700">Data e hora</label>
                <Input
                  type="datetime-local"
                  value={form.date}
                  onChange={(e) => setForm((s) => ({ ...s, date: e.target.value }))}
                  className="h-12 rounded-2xl"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium text-slate-700">Resultado / observações</label>
                <Textarea
                  value={form.result}
                  onChange={(e: { target: { value: any; }; }) => setForm((s) => ({ ...s, result: e.target.value }))}
                  placeholder="Descreva o que aconteceu na visita..."
                  className="min-h-32 rounded-2xl"
                />
              </div>    

              <div className="flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-2xl"
                  onClick={() => setOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="rounded-2xl" disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Salvar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        {filteredVisits.length === 0 ? (
          <Card className="xl:col-span-3 rounded-[28px] border-dashed border-slate-300 bg-white shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <CalendarClock className="mb-4 h-10 w-10 text-slate-400" />
              <h2 className="text-lg font-semibold text-slate-900">Nenhuma visita encontrada</h2>
              <p className="mt-2 max-w-md text-sm text-slate-500">
                Crie a primeira visita ou ajuste sua busca para localizar registros.
              </p>
              <Button onClick={openCreate} className="mt-6 rounded-2xl">
                <Plus className="mr-2 h-4 w-4" />
                Criar visita
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredVisits.map((visit) => (
            <Card
              key={visit.id}
              className="group rounded-[28px] border-slate-200/80 bg-white/90 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <CardHeader className="space-y-3 pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-base text-slate-950">
                      {visit.negotiation.client.name}
                    </CardTitle>
                    <p className="mt-1 text-sm text-slate-500">
                      {visit.negotiation.property.address} · {visit.negotiation.property.city}
                    </p>
                  </div>

                  <Badge variant="secondary" className="rounded-full">
                    {statusLabel(visit.negotiation.status)}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <CalendarClock className="h-4 w-4" />
                  <span>{formatDate(visit.date)}</span>
                </div>

                <div className="flex items-start gap-2 text-sm text-slate-600">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                  <p className="line-clamp-3">
                    {visit.result?.trim() || "Sem observações registradas."}
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 opacity-100 md:opacity-0 md:transition md:group-hover:opacity-100">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-2xl"
                    onClick={() => openEdit(visit)}
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-2xl"
                    onClick={() => handleDelete(visit.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </section>
    </div>
  );
}