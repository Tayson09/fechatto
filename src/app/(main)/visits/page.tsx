import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { CalendarClock, MapPin } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { NegotiationRepository } from "@/server/repositories/negotiation.repository";
import { NegotiationService } from "@/server/services/negotiation.service";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const service = new NegotiationService(new NegotiationRepository());

const demoVisits = [
  { id: "v1", date: new Date().toISOString(), result: "Cliente gostou do imóvel e pediu proposta.", negotiation: { client: { name: "Carlos Mendes" }, property: { address: "Rua das Acácias, 120", city: "Fortaleza" }, status: "IN_PROGRESS" } },
  { id: "v2", date: new Date().toISOString(), result: "Solicitou retorno em 48h.", negotiation: { client: { name: "Ana Lima" }, property: { address: "Av. Beira Mar, 845", city: "Fortaleza" }, status: "CLOSED_WON" } },
  { id: "v3", date: new Date().toISOString(), result: "Não compareceu.", negotiation: { client: { name: "Pedro Santos" }, property: { address: "Condomínio Vila Azul", city: "Eusébio" }, status: "CLOSED_LOST" } },
];

export default async function VisitsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  let visits: any[] = [];
  try {
    visits = await service.listVisits(session.user.id);
  } catch (error) {
    console.error(error);
  }

  if (visits.length === 0) visits = demoVisits;

  return (
    <div className="space-y-6">
      <header className="rounded-[32px] border border-slate-200/80 bg-white p-6 shadow-sm">
        <Badge className="rounded-full bg-slate-900 px-3 py-1 text-white hover:bg-slate-900">Visitas</Badge>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Agenda de visitas</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-500">
          Registro das visitas vinculadas às negociações, com data, resultado e contexto.
        </p>
      </header>

      <div className="grid gap-4 xl:grid-cols-3">
        {visits.map((visit) => (
          <Card key={visit.id} className="rounded-[28px] border-slate-200/80 bg-white/90 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                {visit.negotiation?.client?.name ?? "Cliente"}
              </CardTitle>
              <p className="text-sm text-slate-500">
                {visit.negotiation?.property?.address ?? "Imóvel"} · {visit.negotiation?.property?.city ?? "—"}
              </p>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <CalendarClock className="h-4 w-4" />
                <span>{visit.date ? new Date(visit.date).toLocaleString("pt-BR") : "—"}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{visit.result ?? "Sem observações"}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
