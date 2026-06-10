import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PropertyRepository } from "@/server/repositories/property.repository";
import { PropertyService } from "@/server/services/property.service";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const service = new PropertyService(new PropertyRepository());
const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 2 });

const typeLabel: Record<string, string> = {
  HOUSE: "Casa",
  APARTMENT: "Apartamento",
  LAND: "Terreno",
  COMMERCIAL: "Comercial",
};

const statusLabel: Record<string, string> = {
  AVAILABLE: "Disponível",
  RESERVED: "Reservado",
  SOLD: "Vendido",
};


function readSingle(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams?: Promise<{ status?: string | string[]; type?: string | string[] }> | { status?: string | string[]; type?: string | string[] };
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const resolvedSearchParams = await Promise.resolve(searchParams);
  const status = readSingle(resolvedSearchParams?.status);
  const type = readSingle(resolvedSearchParams?.type);

  let properties: any[] = [];

  try {
    properties = await service.list(session.user.id, {
      take: 100,
      status,
      type,
    });
  } catch (error) {
    console.error(error);
  }

  return (
    <div className="space-y-6">
      <header className="rounded-[32px] border border-slate-200/80 bg-white p-6 shadow-sm">
        <Badge className="rounded-full bg-slate-900 px-3 py-1 text-white hover:bg-slate-900">Imóveis</Badge>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Gestão de imóveis</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-500">Cadastro de imóveis, status operacional e link público compartilhável.</p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {properties.length === 0 ? (
          <Card className="rounded-[28px] border-slate-200/80 bg-white/90 shadow-sm md:col-span-2 xl:col-span-3">
            <CardContent className="p-6 text-sm text-slate-500">Nenhum imóvel cadastrado.</CardContent>
          </Card>
        ) : properties.map((property: any) => {
          const photos = Array.isArray(property.photos) ? property.photos : [];

          return (
            <Card key={property.id} className="overflow-hidden rounded-[28px] border-slate-200/80 bg-white/90 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{property.address}</CardTitle>
                <CardDescription>
                  {property.city} · {typeLabel[property.type] ?? property.type}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3 text-sm text-slate-600">
                <div className="flex items-center justify-between">
                  <span>Status</span>
                  <strong className="text-slate-950">{statusLabel[property.status] ?? "Sem status"}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Preço</span>
                  <strong className="text-slate-950">{currency.format(Number(property.price ?? 0))}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Comissão</span>
                  <strong className="text-slate-950">{currency.format(Number(property.commission ?? 0))}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Visualizações</span>
                  <strong className="text-slate-950">{property.shareViews ?? 0}</strong>
                </div>

                {property.shareEnabled && property.shareToken ? (
                  <div className="space-y-2 rounded-2xl bg-slate-50 p-3">
                    <p className="break-all text-xs text-slate-500">
                      <span className="font-medium text-slate-700">Link público:</span> /p/{property.shareToken}
                    </p>
                    <Link
                      href={`/p/${property.shareToken}`}
                      className="inline-flex rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Abrir link público
                    </Link>
                  </div>
                ) : (
                  <p className="rounded-2xl bg-slate-50 p-3 text-xs text-slate-500">Nenhum link cadastrado</p>
                )}

                <div className="rounded-2xl bg-slate-50 p-3 text-xs text-slate-500">
                  {photos.length > 0 ? (
                    <div className="space-y-3">
                      <p className="font-medium text-slate-700">{photos.length} foto(s) cadastrada(s)</p>
                      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                        <img
                          src={String(photos[0]?.url ?? "")}
                          alt={property.address}
                          className="h-44 w-full object-cover"
                        />
                      </div>
                    </div>
                  ) : (
                    <p>Nenhuma foto cadastrada</p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
