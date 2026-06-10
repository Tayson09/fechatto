import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PropertyRepository } from '@/server/repositories/property.repository';
import { PropertyService } from '@/server/services/property.service';
import { PropertyListView } from '@/components/properties/property-list-view';

const service = new PropertyService(new PropertyRepository());

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams?: Promise<{
    page?: string;
    type?: string;
    status?: string;
    search?: string;
  }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const params = (await searchParams) ?? {};
  const page = Math.max(1, Number(params.page ?? 1));
  const type = params.type || undefined;
  const status = params.status || undefined;
  const search = params.search || undefined;

  try {
    const rawProperties = await service.list(session.user.id, {
      skip: (page - 1) * 20,
      take: 20,
      type,
      status,
      search,
    });

    const properties = rawProperties.map((property) => ({
      ...property,
      area: property.area != null ? Number(property.area) : null,
      price: property.price != null ? Number(property.price) : 0,
      commission: property.commission != null ? Number(property.commission) : 0,
    }));

    return (
      <PropertyListView
        initialProperties={properties}
        initialPage={page}
        initialTotal={properties.length}
      />
    );
  } catch (error) {
    console.error(error);
    return (
      <PropertyListView
        initialProperties={[]}
        initialPage={1}
        initialTotal={0}
      />
    );
  }
}