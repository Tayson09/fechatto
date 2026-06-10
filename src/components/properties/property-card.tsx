'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PropertyStatusBadge } from './property-status-badge';
import { PropertyTypeBadge } from './property-type-badge';
import { formatCurrency } from '@/lib/format';
import type { PropertyDetail } from '@/types/property';

interface PropertyCardProps {
  property: PropertyDetail;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onShare: (id: string) => void;
}

export function PropertyCard({ property, onEdit, onDelete, onShare }: PropertyCardProps) {
  const firstPhoto = property.photos?.[0]?.url;

  return (
    <Card className="overflow-hidden rounded-[28px] border-slate-200/80 bg-white/90 shadow-sm hover:shadow-md transition-shadow">
      {firstPhoto && (
        <div className="h-48 w-full overflow-hidden bg-slate-100">
          <img
            src={firstPhoto}
            alt={property.address}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="text-base line-clamp-2">{property.address}</CardTitle>
            <CardDescription>{property.city}</CardDescription>
          </div>
          <PropertyTypeBadge type={property.type} />
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">Status</span>
          <PropertyStatusBadge status={property.status} />
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">Preço</span>
          <strong className="text-slate-950">{formatCurrency(property.price)}</strong>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">Comissão</span>
          <strong className="text-slate-950">{formatCurrency(property.commission)}</strong>
        </div>

        {property.area && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">Área</span>
            <strong className="text-slate-950">{property.area} m²</strong>
          </div>
        )}

        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">Fotos</span>
          <strong className="text-slate-950">
            {property.photos?.length ?? 0} {property.photos?.length === 1 ? 'foto' : 'fotos'}
          </strong>
        </div>

        <div className="flex gap-2 pt-2">
          <Link href={`/properties/${property.id}`} className="flex-1">
            <Button variant="secondary" size="sm" className="w-full">
              Ver
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(property.id)}
          >
            ✏️
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onShare(property.id)}
          >
            🔗
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(property.id)}
            className="text-red-600 hover:bg-red-50"
          >
            🗑️
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}