"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Building2,
  CalendarClock,
  CircleDollarSign,
  FileText,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Settings,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const items = [
  { label: "Visão geral", href: "/", icon: LayoutDashboard },
  { label: "Dashboard analítico", href: "/dashboard", icon: TrendingUp },
  { label: "Clientes", href: "/clients", icon: Users },
  { label: "Imóveis", href: "/properties", icon: Home },
  { label: "Negociações", href: "/negotiations", icon: CircleDollarSign },
  { label: "Comissões", href: "/commissions", icon: CircleDollarSign },
  { label: "Visitas", href: "/visits", icon: CalendarClock },
  { label: "Relatórios", href: "/reports", icon: BarChart3 },
  { label: "Documentos", href: "/documents", icon: FileText },
  { label: "Mensagens", href: "/messages", icon: MessageSquare },
  { label: "Configurações", href: "/settings", icon: Settings },
];

export function MainSidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-[#071b33] text-white">
      <div className="border-b border-white/10 px-6 py-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/10">
            <ShieldCheck className="h-5 w-5 text-[#ba933a]" />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-[0.25em] text-white/90">FECHATTO</p>
            <p className="text-xs text-white/40">CRM Imobiliário</p>
          </div>
        </Link>
      </div>

      <div className="flex-1 px-4 py-5">
        <div className="mb-5 rounded-3xl border border-white/10 bg-white/5 p-4 shadow-lg shadow-black/10">
          <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/40">
            <Building2 className="h-3.5 w-3.5" />
            Painel analítico
          </div>
          <p className="text-sm leading-6 text-white/80">
            Monitore clientes, imóveis, visitas, negociações e comissões em um único ambiente.
          </p>
          <div className="mt-4 flex gap-2">
            <Badge className="bg-[#ba933a] text-slate-950">Online</Badge>
            <Badge variant="outline" className="border-white/15 bg-transparent text-white/75">
              Dashboard ativo
            </Badge>
          </div>
        </div>

        <nav className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition-all duration-200",
                  active
                    ? "bg-[#ba933a] text-slate-950 shadow-lg shadow-[#ba933a]/20"
                    : "text-white/70 hover:bg-white/8 hover:text-white"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex-1">{item.label}</span>
                <span className="opacity-0 transition group-hover:opacity-100">→</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-white/10 p-4">
        <div className="rounded-3xl bg-white/5 p-4 ring-1 ring-white/10">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-800 ring-1 ring-white/10">
              <ShieldCheck className="h-5 w-5 text-[#ba933a]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">Tayson Silva</p>
              <p className="truncate text-xs text-white/40">Corretor premium</p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <Button className="w-full rounded-2xl bg-white/10 text-white hover:bg-white/15">
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden w-80 shrink-0 lg:block">
        <SidebarContent />
      </aside>

      {open ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            aria-label="Fechar menu"
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-80 max-w-[85vw] shadow-2xl">
            <SidebarContent />
          </div>
        </div>
      ) : null}

      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 shadow-sm lg:hidden">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#071b33] text-white">
            <ShieldCheck className="h-5 w-5 text-[#ba933a]" />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-[0.2em] text-slate-900">FECHATTO</p>
            <p className="text-xs text-slate-500">CRM Imobiliário</p>
          </div>
        </div>
        <Button variant="outline" size="icon" onClick={() => setOpen(true)} className="rounded-2xl">
          <Menu className="h-5 w-5" />
        </Button>
      </div>
    </>
  );
}
