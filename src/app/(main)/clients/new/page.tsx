import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ClientForm } from "@/components/clients/client-form";

export default function NewClientPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="space-y-1">
        <Link
          href="/clients"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition hover:text-slate-900"
        >
          <ChevronLeft className="h-4 w-4" />
          Voltar para clientes
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
          Novo cliente
        </h1>
        <p className="text-sm text-slate-500">
          Preencha os dados do cliente para adicioná-lo à sua carteira.
        </p>
      </header>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <ClientForm mode="create" />
      </div>
    </div>
  );
}
