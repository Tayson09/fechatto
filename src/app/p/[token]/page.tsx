import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 2,
});

export default async function PublicPropertyPage({
  params,
}: {
  params?: Promise<{ token: string }> | { token: string };
}) {
  const resolvedParams = await Promise.resolve(params);
  const property = await prisma.property.findFirst({
    where: { shareToken: resolvedParams?.token, shareEnabled: true, deletedAt: null },
    include: {
      photos: { orderBy: { order: "asc" } },
      user: { select: { name: true, phone: true, email: true } },
    },
  });

  if (!property) notFound();

  await prisma.property
    .update({ where: { id: property.id }, data: { shareViews: { increment: 1 } } })
    .catch(() => undefined);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 px-4 py-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <Card className="rounded-[32px] border-slate-200/80 bg-white/90 shadow-sm">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <Badge className="rounded-full bg-slate-900 px-3 py-1 text-white hover:bg-slate-900">
                  Imóvel compartilhado
                </Badge>
                <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
                  {property.address}
                </h1>
                <p className="mt-2 text-slate-500">{property.city} · {property.type}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 px-5 py-4 text-right">
                <p className="text-sm text-slate-500">Valor</p>
                <p className="text-2xl font-semibold text-slate-950">{currency.format(Number(property.price))}</p>
                <p className="text-sm text-slate-500">Comissão: {currency.format(Number(property.commission))}</p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Área</p>
                <p className="mt-1 text-lg font-semibold text-slate-950">{property.area ? `${Number(property.area)} m²` : "Não informado"}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Contato do corretor</p>
                <p className="mt-1 text-lg font-semibold text-slate-950">{property.user.name}</p>
                <p className="text-sm text-slate-500">{property.user.phone ?? property.user.email}</p>
              </div>
            </div>

            {property.notes ? (
              <p className="mt-6 rounded-3xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-600">
                {property.notes}
              </p>
            ) : null}
          </CardContent>
        </Card>

        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {property.photos.length > 0 ? (
            property.photos.map((photo) => (
              <div key={photo.url} className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.url} alt={property.address} className="h-64 w-full object-cover" />
              </div>
            ))
          ) : (
            <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-500 md:col-span-2 lg:col-span-3">
              Nenhuma foto cadastrada para este imóvel.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
