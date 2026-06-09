import { ClientKanbanBoard } from "@/components/clients/client-kanban-board";

export default function ClientsKanbanPage() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-medium text-slate-500">Clientes</p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
          Kanban do funil
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Visualize e mova clientes entre etapas arrastando os cards.
        </p>
      </header>

      <ClientKanbanBoard />
    </div>
  );
}
