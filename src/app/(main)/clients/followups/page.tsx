import { FollowUpList } from "@/components/clients/follow-up-list";

export default function FollowUpsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <p className="text-sm font-medium text-slate-500">Clientes</p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
          Follow-ups
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Clientes com contato atrasado e agendamentos para os próximos 7 dias.
        </p>
      </header>

      <FollowUpList />
    </div>
  );
}
