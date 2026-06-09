import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ClientRepository } from "@/server/repositories/client.repository";
import { ClientService } from "@/server/services/client.service";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const service = new ClientService(new ClientRepository());

export default async function FollowUpsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const { overdue: clients } = await service.getFollowUps(session.user.id);

  return (
    <div className="space-y-6">
      <header className="rounded-[32px] border border-slate-200/80 bg-white p-6 shadow-sm">
        <Badge className="rounded-full bg-slate-900 px-3 py-1 text-white hover:bg-slate-900">Follow-ups</Badge>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Contatos pendentes</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-500">Clientes com follow-up vencido para evitar perda de oportunidades.</p>
      </header>

      <Card className="rounded-[28px] border-slate-200/80 bg-white/90 shadow-sm">
        <CardContent className="space-y-3 p-6">
          {clients.length === 0 ? (
            <p className="text-sm text-slate-500">Nenhum follow-up vencido no momento.</p>
          ) : clients.map((client: any) => (
            <div key={client.id} className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium text-slate-950">{client.name}</p>
                <p className="text-sm text-slate-500">Próximo contato: {new Date(client.nextFollowUp).toLocaleDateString("pt-BR")}</p>
              </div>
              <Badge className="w-fit rounded-full bg-amber-100 text-amber-900 hover:bg-amber-100">Atrasado</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
