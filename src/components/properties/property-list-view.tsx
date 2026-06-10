'use client';

import { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PropertyCard } from './property-card';
import { ShareLinkModal } from './share-link-modal';
import { DeleteConfirmModal } from './delete-confirm-modal';
import Link from 'next/link';
import type { PropertyDetail } from '@/types/property';
import type { PropertyType, PropertyStatus } from '@prisma/client';

interface PropertyListViewProps {
  initialProperties: PropertyDetail[];
  initialPage?: number;
  initialTotal?: number;
}

export function PropertyListView({
  initialProperties,
  initialPage = 1,
  initialTotal = 0,
}: PropertyListViewProps) {
  const [properties, setProperties] = useState(initialProperties);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<PropertyType | ''>('');
  const [statusFilter, setStatusFilter] = useState<PropertyStatus | ''>('');
  const [page, setPage] = useState(initialPage);

  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
  const selectedProperty = properties.find((p) => p.id === selectedPropertyId);

  const loadProperties = useCallback(
    async (pageNum: number) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: pageNum.toString(),
          limit: '20',
          ...(search && { search }),
          ...(typeFilter && { type: typeFilter }),
          ...(statusFilter && { status: statusFilter }),
        });

        const response = await fetch(`/api/properties?${params}`);
        if (!response.ok) throw new Error('Erro ao carregar imóveis');

        const data = await response.json();
        setProperties(data.data);
        setPage(pageNum);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    },
    [search, typeFilter, statusFilter]
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleFilterChange = (newType?: PropertyType | '', newStatus?: PropertyStatus | '') => {
    if (newType !== undefined) setTypeFilter(newType);
    if (newStatus !== undefined) setStatusFilter(newStatus);
    setPage(1);
  };

  const handleEdit = (id: string) => {
    window.location.href = `/properties/${id}/edit`;
  };

  const handleDelete = (id: string) => {
    setSelectedPropertyId(id);
    setDeleteModalOpen(true);
  };

  const handleShare = (id: string) => {
    setSelectedPropertyId(id);
    setShareModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="rounded-[32px] border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Imóveis</h1>
            <p className="mt-1 text-sm text-slate-500">
              Gerencie seu portfólio de imóveis
            </p>
          </div>
          <Link href="/properties/new">
            <Button className="rounded-xl">+ Novo Imóvel</Button>
          </Link>
        </div>
      </header>

      {/* Filtros */}
      <div className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          {/* Busca */}
          <Input
            type="text"
            placeholder="Buscar por endereço ou cidade..."
            value={search}
            onChange={handleSearch}
            className="rounded-xl"
          />

          {/* Filtro de Tipo */}
          <select
            value={typeFilter}
            onChange={(e) => handleFilterChange(e.target.value as PropertyType | '')}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos os tipos</option>
            <option value="HOUSE">Casa</option>
            <option value="APARTMENT">Apartamento</option>
            <option value="LAND">Terreno</option>
            <option value="COMMERCIAL">Comercial</option>
          </select>

          {/* Filtro de Status */}
          <select
            value={statusFilter}
            onChange={(e) => handleFilterChange(undefined, e.target.value as PropertyStatus | '')}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos os status</option>
            <option value="AVAILABLE">Disponível</option>
            <option value="RESERVED">Reservado</option>
            <option value="SOLD">Vendido</option>
          </select>
        </div>

        <Button
          onClick={() => loadProperties(1)}
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Carregando...' : 'Aplicar Filtros'}
        </Button>
      </div>

      {/* Grid de Propriedades */}
      {properties.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {properties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onShare={handleShare}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-[28px] border border-slate-200/80 bg-white p-12 text-center">
          <p className="text-slate-600">Nenhum imóvel encontrado</p>
        </div>
      )}

      {/* Paginação */}
      {initialTotal > 20 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            disabled={page === 1 || loading}
            onClick={() => loadProperties(page - 1)}
          >
            ← Anterior
          </Button>
          <Button
            variant="outline"
            disabled={properties.length < 20 || loading}
            onClick={() => loadProperties(page + 1)}
          >
            Próxima →
          </Button>
        </div>
      )}

      {/* Modais */}
      {selectedProperty && (
        <>
          <ShareLinkModal
            propertyId={selectedPropertyId}
            isOpen={shareModalOpen}
            onClose={() => setShareModalOpen(false)}
            shareToken={selectedProperty.shareToken}
            shareEnabled={selectedProperty.shareEnabled}
            shareViews={selectedProperty.shareViews}
          />

          <DeleteConfirmModal
            propertyId={selectedPropertyId}
            address={selectedProperty.address}
            isOpen={deleteModalOpen}
            onClose={() => setDeleteModalOpen(false)}
          />
        </>
      )}
    </div>
  );
}