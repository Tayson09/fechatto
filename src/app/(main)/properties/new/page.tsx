"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BadgeDollarSign,
  Building2,
  CheckCircle2,
  Home,
  Loader2,
  MapPin,
  Paperclip,
  PenSquare,
  Sparkles,
  Upload,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const propertyTypes = [
  { value: "HOUSE", label: "Casa", icon: Home },
  { value: "APARTMENT", label: "Apartamento", icon: Building2 },
  { value: "LAND", label: "Terreno", icon: MapPin },
  { value: "COMMERCIAL", label: "Comercial", icon: Building2 },
] as const;

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function NewPropertyPage() {
  const router = useRouter();

  const [type, setType] = useState<"HOUSE" | "APARTMENT" | "LAND" | "COMMERCIAL">("HOUSE");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");
  const [price, setPrice] = useState("");
  const [commission, setCommission] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const previewType = propertyTypes.find((item) => item.value === type);
  const TypeIcon = previewType?.icon ?? Home;

  const canSubmit = address.trim().length >= 3 && city.trim().length >= 2 && price.trim().length > 0 && commission.trim().length >= 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        type,
        address: address.trim(),
        city: city.trim(),
        area: area.trim() ? Number(area) : null,
        price: Number(price),
        commission: Number(commission),
        notes: notes.trim() ? notes.trim() : null,
      };

      const res = await fetch("/api/properties", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok) {
        const message =
          json?.error ||
          (json?.details ? "Revise os campos do formulário." : "Não foi possível criar o imóvel.");
        throw new Error(message);
      }

      router.push("/properties");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.05),_transparent_35%),linear-gradient(to_bottom,_#f8fafc,_#fff)] text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm">
              <Sparkles className="h-3.5 w-3.5" />
              Cadastro de imóvel
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Crie um novo imóvel com acabamento premium
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500 sm:text-base">
              Registre os dados essenciais agora e complete a galeria e o link público na próxima etapa.
            </p>
          </div>

          <Button variant="outline" className="gap-2 self-start lg:self-auto" onClick={() => router.push("/properties")}>
            <ArrowLeft className="h-4 w-4" />
            Voltar para imóveis
          </Button>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <Card className="border-slate-200/70 shadow-sm">
            <CardHeader className="border-b border-slate-100 bg-white/70">
              <CardTitle className="text-xl">Dados do imóvel</CardTitle>
              <CardDescription>Preencha os campos abaixo para salvar o imóvel no banco.</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label>Tipo do imóvel</Label>
                  <Select value={type} onValueChange={(value) => setType(value as typeof type)}>
                    <SelectTrigger className="h-12 rounded-2xl">
                      <SelectValue placeholder="Escolha o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {propertyTypes.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <Label>Endereço</Label>
                    <Input
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Rua, número, complemento"
                      className="h-12 rounded-2xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Cidade</Label>
                    <Input
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Fortaleza"
                      className="h-12 rounded-2xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Área (m²)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      placeholder="Ex.: 120"
                      className="h-12 rounded-2xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Valor do imóvel</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="Ex.: 850000"
                      className="h-12 rounded-2xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Valor da comissão</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={commission}
                      onChange={(e) => setCommission(e.target.value)}
                      placeholder="Ex.: 42500"
                      className="h-12 rounded-2xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Observações</Label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Informações importantes sobre o imóvel, diferenciais, restrições, pontos fortes..."
                    rows={6}
                    className="rounded-2xl"
                  />
                </div>

                {error && (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {error}
                  </div>
                )}

                <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    className="gap-2 rounded-2xl"
                    onClick={() => router.push("/properties")}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" className="gap-2 rounded-2xl" disabled={!canSubmit || loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    Salvar imóvel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="overflow-hidden border-slate-200/70 shadow-sm">
              <div className="relative h-60 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-transparent" />
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1560448204-603b3fc33ddc?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center" />
                <div className="absolute left-4 top-4 flex items-center gap-2">
                  <BadgePreview label={previewType?.label ?? "Imóvel"} icon={<TypeIcon className="h-3.5 w-3.5" />} />
                </div>
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <div className="text-lg font-semibold">Pré-visualização</div>
                  <p className="text-sm text-white/80">
                    O imóvel aparecerá assim em uma versão mais refinada do cadastro.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="border-slate-200/70 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Próxima etapa</CardTitle>
                <CardDescription>Depois de salvar, você pode completar o imóvel com fotos e link público.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <FeatureRow icon={<Paperclip className="h-4 w-4" />} title="Upload de fotos" desc="Galeria simples e ordenada." />
                <FeatureRow icon={<Upload className="h-4 w-4" />} title="Link público" desc="Compartilhamento com um clique." />
                <FeatureRow icon={<PenSquare className="h-4 w-4" />} title="Observações" desc="Detalhes úteis para a operação." />
                <FeatureRow icon={<BadgeDollarSign className="h-4 w-4" />} title="Comissão" desc="Base para fechamento e dashboard." />
              </CardContent>
            </Card>

            <Card className="border-slate-200/70 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Checklist de qualidade</CardTitle>
                <CardDescription>Garanta uma criação clara e pronta para conversão.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <ChecklistItem text="Endereço claro e completo" />
                <ChecklistItem text="Valor e comissão preenchidos" />
                <ChecklistItem text="Tipo do imóvel bem definido" />
                <ChecklistItem text="Observações com diferenciais do imóvel" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureRow({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
      <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm">{icon}</div>
      <div>
        <div className="font-medium text-slate-950">{title}</div>
        <div className="text-sm text-slate-500">{desc}</div>
      </div>
    </div>
  );
}

function ChecklistItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
        <CheckCircle2 className="h-4 w-4" />
      </div>
      <span className="text-sm text-slate-700">{text}</span>
    </div>
  );
}

function BadgePreview({ label, icon }: { label: string; icon: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
      {icon}
      {label}
    </div>
  );
}
