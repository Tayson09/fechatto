import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PropertyForm } from '@/components/properties/property-form';

export default async function NewPropertyPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  return (
    <div className="space-y-6">
      <header className="rounded-[32px] border border-slate-200/80 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Novo Imóvel</h1>
        <p className="mt-2 text-sm text-slate-500">Cadastre um novo imóvel em seu portfólio</p>
      </header>

      <PropertyForm mode="create" />
    </div>
  );
}