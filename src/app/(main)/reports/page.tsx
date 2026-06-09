import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { BarChart3 } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default async function Page() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div className="space-y-6">
      <header className="rounded-[32px] border border-slate-200/80 bg-white p-6 shadow-sm">
        <Badge className="rounded-full bg-slate-900 px-3 py-1 text-white hover:bg-slate-900">Relatórios gerenciais</Badge>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Relatórios</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-500">
          Esta seção está disponível no menu e pronta para evolução futura.
        </p>
      </header>

      <Card className="rounded-[28px] border-slate-200/80 bg-white/90 shadow-sm">
        <CardContent className="flex items-center gap-4 p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-base font-semibold text-slate-950">Área em estruturação</p>
            <p className="text-sm text-slate-500">
              O acesso funciona normalmente; esta tela foi criada para não quebrar a navegação.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
