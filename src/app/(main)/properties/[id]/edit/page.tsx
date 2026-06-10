import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PropertyRepository } from '@/server/repositories/property.repository';
import { PropertyService } from '@/server/services/property.service';
import { PropertyForm } from '@/components/properties/property-form';

const service = new PropertyService(new PropertyRepository());

export default async function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const resolvedParams = await Promise.resolve(params);

  try {
    const property = await service.getById(session.user.id, resolvedParams.id);

    const defaultValues = {
      ...property,
      // Convert Prisma Decimal (or similar) to number for the form
      area: property.area ? ((property.area as any)?.toNumber?.() ?? Number(property.area)) : null,
      // price may be a Decimal from Prisma - convert to number
      price: property.price ? ((property.price as any)?.toNumber?.() ?? Number(property.price)) : null,
      // commission may be a Decimal from Prisma - convert to number
      commission: property.commission ? ((property.commission as any)?.toNumber?.() ?? Number(property.commission)) : null,
    };

    return (
      <div className="space-y-6">
        <header className="rounded-[32px] border border-slate-200/80 bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Editar Imóvel</h1>
          <p className="mt-2 text-sm text-slate-500">{property.address}</p>
        </header>

        <PropertyForm
          mode="edit"
          propertyId={property.id}
          defaultValues={defaultValues}
        />
      </div>
    );
  } catch {
    redirect('/properties');
  }
}