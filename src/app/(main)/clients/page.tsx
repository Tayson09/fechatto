import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ClientRepository } from "@/server/repositories/client.repository";
import { ClientService } from "@/server/services/client.service";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const service = new ClientService(new ClientRepository());

const statusLabel: Record<string, string> = {
  LEAD: "Lead",
  IN_PROGRESS: "Em atendimento",
  PROPOSAL: "Proposta",
  VISIT: "Visita",
  CLOSED: "Fechado",
  LOST: "Perdido",
};

const kanbanColumns = ["LEAD", "IN_PROGRESS", "PROPOSAL", "VISIT", "CLOSED", "LOST"] as const;

const demoClients = [
  {
    id: "demo-client-1",
    name: "Carlos Mendes",
    status: "IN_PROGRESS",
    profession: "Empresário",
    nextFollowUp: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "demo-client-2",
    name: "Ana Lima",
    status: "PROPOSAL",
    profession: "Médica",
    nextFollowUp: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "demo-client-3",
    name: "Pedro Santos",
    status: "VISIT",
    profession: "Engenheiro",
    nextFollowUp: null,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "demo-client-4",
    name: "Mariana Costa",
    status: "LEAD",
    profession: "Advogada",
    nextFollowUp: null,
    updatedAt: new Date().toISOString(),
  },
];

function fmt(date?: Date | string | null) {
  if (!date) return "Sem follow-up";
  const d = new Date(date);
  return d.toLocaleDateString("pt-BR");
}

function readSingle(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ClientsPage({
  searchParams,
}: {
  searchParams?: Promise<{ view?: string | string[] }> | { view?: string | string[] };
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const resolvedSearchParams = await Promise.resolve(searchParams);
  const view = readSingle(resolvedSearchParams?.view) === "kanban" ? "kanban" : "list";

  let clients = demoClients as any[];
  let demoMode = true;

  try {
    const realClients = await service.list(session.user.id, { take: 100 });
    if (realClients.length > 0) {
      clients = realClients as any[];
      demoMode = false;
    }
  } catch (error) {
    console.error(error);
  }

  const kanbanSource =
    clients.reduce<Record<string, any[]>>((acc, client) => {
      const statusKey = client.status ?? "LEAD";
      acc[statusKey] = acc[statusKey] ?? [];
      acc[statusKey].push(client);
      return acc;
    }, {});

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 rounded-[32px] border border-slate-200/80 bg-white p-6 shadow-sm xl:flex-row xl:items-center xl:justify-between">
        <div>
          <Badge className="rounded-full bg-slate-900 px-3 py-1 text-white hover:bg-slate-900">Clientes</Badge>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Gestão de clientes</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Lista operacional com status do funil, próximo contato e visão Kanban por etapa.
          </p>
        </div>
        <div className="inline-flex rounded-2xl border border-slate-200 bg-slate-50 p-1">
          <Link href="/clients" className={`rounded-xl px-4 py-2 text-sm font-medium ${view === "list" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500"}`}>Lista</Link>
          <Link href="/clients?view=kanban" className={`rounded-xl px-4 py-2 text-sm font-medium ${view === "kanban" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500"}`}>Kanban</Link>
        </div>
      </header>

      {view === "kanban" && kanbanSource ? (
        <section className="grid gap-4 xl:grid-cols-3 2xl:grid-cols-6">
          {kanbanColumns.map((status) => {
            const items = kanbanSource[status] ?? [];

            return (
              <Card key={status} className="rounded-[28px] border-slate-200/80 bg-white/90 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{statusLabel[status] ?? status}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {items.length === 0 ? (
                    <p className="text-sm text-slate-500">Nenhum cliente nesta etapa.</p>
                  ) : (
                    items.map((client: any) => (
                      <div key={client.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                        <p className="font-medium text-slate-950">{client.name}</p>
                        <p className="text-xs text-slate-500">Próximo contato: {fmt(client.nextFollowUp)}</p>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            );
          })}
        </section>
      ) : (
        <Card className="rounded-[28px] border-slate-200/80 bg-white/90 shadow-sm">
          <CardContent className="overflow-x-auto p-0">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-medium">Nome</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Profissão</th>
                  <th className="px-6 py-4 font-medium">Próximo follow-up</th>
                  <th className="px-6 py-4 font-medium">Atualizado</th>
                </tr>
              </thead>
              <tbody>
                {clients.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-slate-500">Nenhum cliente cadastrado.</td>
                  </tr>
                ) : clients.map((client: any) => (
                  <tr key={client.id} className="border-t border-slate-100">
                    <td className="px-6 py-4 font-medium text-slate-950">{client.name}</td>
                    <td className="px-6 py-4 text-slate-600">{statusLabel[client.status] ?? client.status}</td>
                    <td className="px-6 py-4 text-slate-600">{client.profession ?? "—"}</td>
                    <td className="px-6 py-4 text-slate-600">{fmt(client.nextFollowUp)}</td>
                    <td className="px-6 py-4 text-slate-600">{new Date(client.updatedAt).toLocaleDateString("pt-BR")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
