import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NegotiationRepository } from "@/server/repositories/negotiation.repository";
import { NegotiationService } from "@/server/services/negotiation.service";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const service = new NegotiationService(new NegotiationRepository());
const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 2 });

const statusLabel: Record<string, string> = {
  IN_PROGRESS: "Em andamento",
  CLOSED_WON: "Fechado ganho",
  CLOSED_LOST: "Fechado perdido",
};


export default async function NegotiationsPage({
  searchParams,
}: {
  searchParams?: Promise<{ status?: string }> | { status?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const resolvedSearchParams = await Promise.resolve(searchParams);

  let negotiations: any[] = [];

  try {
    negotiations = await service.list(session.user.id, { take: 100, status: resolvedSearchParams?.status });
  } catch (error) {
    console.error(error);
  }

  return (
    <div className="space-y-6">
      <header className="rounded-[32px] border border-slate-200/80 bg-white p-6 shadow-sm">
        <Badge className="rounded-full bg-slate-900 px-3 py-1 text-white hover:bg-slate-900">Negociações</Badge>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Controle de negociações</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-500">Acompanhamento do pipeline, fechamento e comissão snapshot no momento da venda.</p>
        
      </header>

      <Card className="rounded-[28px] border-slate-200/80 bg-white/90 shadow-sm">
        <CardContent className="overflow-x-auto p-0">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-6 py-4 font-medium">Cliente</th>
                <th className="px-6 py-4 font-medium">Imóvel</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Comissão</th>
                <th className="px-6 py-4 font-medium">Fechamento</th>
              </tr>
            </thead>
            <tbody>
              {negotiations.length === 0 ? (
                <tr>
                  <td className="px-6 py-8 text-slate-500" colSpan={5}>Nenhuma negociação cadastrada.</td>
                </tr>
              ) : negotiations.map((item: any) => (
                <tr key={item.id} className="border-t border-slate-100">
                  <td className="px-6 py-4 font-medium text-slate-950">{item.client?.name ?? "—"}</td>
                  <td className="px-6 py-4 text-slate-600">{item.property?.address ?? "—"}</td>
                  <td className="px-6 py-4 text-slate-600">{statusLabel[item.status] ?? item.status}</td>
                  <td className="px-6 py-4 text-slate-600">{currency.format(Number(item.commission ?? 0))}</td>
                  <td className="px-6 py-4 text-slate-600">{item.closedAt ? new Date(item.closedAt).toLocaleDateString("pt-BR") : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
