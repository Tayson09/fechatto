import { ClientListView } from "@/components/clients/client-list-view";
import { ClientViewToggle } from "@/components/clients/client-view-toggle";

export default function ClientsPage() {
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">Clientes</p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Lista de clientes
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Gerencie sua carteira e acompanhe o progresso de cada cliente.
          </p>
        </div>
        <ClientViewToggle />
      </header>

      <ClientListView />
    </div>
  );
}
