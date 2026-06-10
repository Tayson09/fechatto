'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { toNum } from '@/lib/format';
import type { PropertyDetail } from '@/types/property';
import type { PropertyType, PropertyStatus } from '@prisma/client';

interface PropertyFormProps {
  mode: 'create' | 'edit';
  defaultValues?: Partial<PropertyDetail>;
  propertyId?: string;
}

const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: 'HOUSE', label: 'Casa' },
  { value: 'APARTMENT', label: 'Apartamento' },
  { value: 'LAND', label: 'Terreno' },
  { value: 'COMMERCIAL', label: 'Comercial' },
];

const STATUS_OPTIONS: { value: PropertyStatus; label: string }[] = [
  { value: 'AVAILABLE', label: 'Disponível' },
  { value: 'RESERVED', label: 'Reservado' },
  { value: 'SOLD', label: 'Vendido' },
];

export function PropertyForm({ mode, defaultValues, propertyId }: PropertyFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [type, setType] = useState<PropertyType>(defaultValues?.type ?? 'APARTMENT');
  const [address, setAddress] = useState(defaultValues?.address ?? '');
  const [city, setCity] = useState(defaultValues?.city ?? '');
  const [area, setArea] = useState(toNum(defaultValues?.area));
  const [price, setPrice] = useState(toNum(defaultValues?.price));
  const [commission, setCommission] = useState(toNum(defaultValues?.commission ?? 0));
  const [notes, setNotes] = useState(defaultValues?.notes ?? '');
  const [status, setStatus] = useState<PropertyStatus>(
    defaultValues?.status ?? 'AVAILABLE'
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!address.trim()) throw new Error('Endereço é obrigatório');
      if (!city.trim()) throw new Error('Cidade é obrigatória');
      if (!price || parseFloat(price) <= 0) throw new Error('Preço deve ser maior que zero');

      const payload = {
        type,
        address: address.trim(),
        city: city.trim(),
        area: area ? parseFloat(area) : null,
        price: parseFloat(price),
        commission: commission ? parseFloat(commission) : 0,
        notes: notes.trim() || null,
        status,
      };

      const endpoint = mode === 'create'
        ? '/api/properties'
        : `/api/properties/${propertyId}`;

      const method = mode === 'create' ? 'POST' : 'PUT';

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erro ao salvar imóvel');
      }

      router.push('/properties');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-[32px] border border-slate-200/80 bg-white p-6 shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {/* Tipo */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Tipo de Imóvel *
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as PropertyType)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {PROPERTY_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as PropertyStatus)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Endereço */}
          <div className="md:col-span-2 space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Endereço *
            </label>
            <Input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Rua das Acácias, 120"
              className="rounded-xl"
            />
          </div>

          {/* Cidade */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Cidade *
            </label>
            <Input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Fortaleza"
              className="rounded-xl"
            />
          </div>

          {/* Área */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Área (m²)
            </label>
            <Input
              type="number"
              step="0.01"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="120.50"
              className="rounded-xl"
            />
          </div>

          {/* Preço */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Preço (R$) *
            </label>
            <Input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="450000.00"
              className="rounded-xl"
            />
          </div>

          {/* Comissão */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Comissão (R$)
            </label>
            <Input
              type="number"
              step="0.01"
              value={commission}
              onChange={(e) => setCommission(e.target.value)}
              placeholder="13500.00"
              className="rounded-xl"
            />
          </div>
        </div>

        {/* Notas */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">
            Observações / Descrição
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Detalhes sobre o imóvel, características especiais, etc..."
            rows={5}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {/* Botões */}
        <div className="flex gap-3 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="flex-1"
          >
            {loading ? 'Salvando...' : mode === 'create' ? 'Criar Imóvel' : 'Atualizar Imóvel'}
          </Button>
        </div>
      </form>
    </div>
  );
}