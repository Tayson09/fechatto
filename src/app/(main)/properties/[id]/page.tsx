import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PropertyRepository } from '@/server/repositories/property.repository';
import { PropertyService } from '@/server/services/property.service';
import { PropertyStatusBadge } from '@/components/properties/property-status-badge';
import { PropertyTypeBadge } from '@/components/properties/property-type-badge';
import { formatCurrency, formatArea } from '@/lib/format';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const service = new PropertyService(new PropertyRepository());

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const resolvedParams = await Promise.resolve(params);

  try {
    const property = await service.getById(session.user.id, resolvedParams.id);

    return (
      <div className="space-y-6">
        {/* Header */}
        <header className="rounded-[32px] border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
                {property.address}
              </h1>
              <p className="mt-2 text-sm text-slate-500">{property.city}</p>
            </div>
            <div className="flex gap-2">
              <PropertyTypeBadge type={property.type} />
              <PropertyStatusBadge status={property.status} />
            </div>
          </div>
        </header>

        {/* Galeria */}
        {property.photos && property.photos.length > 0 && (
          <div className="rounded-[28px] border border-slate-200/80 bg-white overflow-hidden shadow-sm">
            <div className="grid gap-1 md:grid-cols-2">
              {property.photos.map((photo) => (
                <img
                  key={photo.id}
                  src={photo.url}
                  alt={property.address}
                  className="w-full h-48 object-cover"
                />
              ))}
            </div>
          </div>
        )}

        {/* Informações */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-semibold text-slate-950">Informações</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Preço</span>
                <strong className="text-slate-950">{formatCurrency(Number(property.price))}</strong>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-600">Comissão</span>
                <strong className="text-slate-950">{formatCurrency(Number(property.commission))}</strong>
              </div>

              {property.area && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Área</span>
                  <strong className="text-slate-950">{formatArea(Number(property.area))}</strong>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-slate-600">Fotos</span>
                <strong className="text-slate-950">
                  {property.photos?.length ?? 0}
                </strong>
              </div>
            </div>
          </div>

          {/* Compartilhamento */}
          <div className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-semibold text-slate-950">Compartilhamento</h2>

            {property.shareEnabled && property.shareToken ? (
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Status</span>
                  <strong className="text-green-600">Ativo</strong>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-600">Visualizações</span>
                  <strong className="text-slate-950">{property.shareViews}</strong>
                </div>

                <p className="break-all text-xs text-slate-500 bg-slate-50 p-2 rounded">
                  /p/{property.shareToken}
                </p>
              </div>
            ) : (
              <p className="text-sm text-slate-500">Compartilhamento desativado</p>
            )}
          </div>
        </div>

        {/* Descrição */}
        {property.notes && (
          <div className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950 mb-4">Descrição</h2>
            <p className="text-sm text-slate-600 whitespace-pre-wrap">{property.notes}</p>
          </div>
        )}

        {/* Ações */}
        <div className="flex gap-2">
          <Link href={`/properties/${property.id}/edit`} className="flex-1">
            <Button className="w-full">✏️ Editar</Button>
          </Link>
          <Link href="/properties" className="flex-1">
            <Button variant="outline" className="w-full">← Voltar</Button>
          </Link>
        </div>
      </div>
    );
  } catch {
    redirect('/properties');
  }
}