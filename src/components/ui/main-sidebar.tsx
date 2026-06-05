"use client";

import Link from "next/link";
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
  User2,
  Users,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const items = [
  { label: "Visão geral", href: "/main", icon: LayoutDashboard, active: true },
  { label: "Clientes", href: "/main/clients", icon: Users },
  { label: "Imóveis", href: "/main/properties", icon: Home },
  { label: "Negociações", href: "/main/negotiations", icon: CircleDollarSign },
  { label: "Visitas", href: "/main/visits", icon: CalendarClock },
  { label: "Relatórios", href: "/main/reports", icon: BarChart3 },
  { label: "Documentos", href: "/main/documents", icon: FileText },
  { label: "Mensagens", href: "/main/messages", icon: MessageSquare },
  { label: "Configurações", href: "/main/settings", icon: Settings },
];

export function MainSidebar() {
  const [open, setOpen] = useState(false);

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-[#071b33] text-white">
      <div className="border-b border-white/10 px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/10">
            <ShieldCheck className="h-5 w-5 text-[#ba933a]" />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-[0.25em] text-white/90">FECHATTO</p>
            <p className="text-xs text-white/40">CRM Imobiliário</p>
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 py-5">
        <div className="mb-5 rounded-3xl border border-white/10 bg-white/5 p-4 shadow-lg shadow-black/10">
          <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/40">
            <Building2 className="h-3.5 w-3.5" />
            Painel operacional
          </div>
          <p className="text-sm leading-6 text-white/80">
            Monitore clientes, imóveis, visitas e negociações em um ambiente limpo e premium.
          </p>
          <div className="mt-4 flex gap-2">
            <Badge className="bg-[#ba933a] text-slate-950">Online</Badge>
            <Badge variant="outline" className="border-white/15 bg-transparent text-white/75">
              7 negociações
            </Badge>
          </div>
        </div>

        <nav className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition-all duration-200",
                  item.active
                    ? "bg-[#ba933a] text-slate-950 shadow-lg shadow-[#ba933a]/20"
                    : "text-white/70 hover:bg-white/8 hover:text-white"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex-1">{item.label}</span>
                <span className="opacity-0 transition group-hover:opacity-100">
                  →
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-white/10 p-4">
        <div className="rounded-3xl bg-white/5 p-4 ring-1 ring-white/10">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-800 ring-1 ring-white/10">
              <User2 className="h-5 w-5 text-[#ba933a]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">Tayson Silva</p>
              <p className="truncate text-xs text-white/40">Corretor · Premium</p>
            </div>
          </div>

          <Button
            variant="ghost"
            className="mt-4 w-full justify-start rounded-2xl bg-white/5 text-white hover:bg-white/10 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="lg:hidden">
        <Button
          variant="outline"
          size="icon"
          className="fixed left-4 top-4 z-50 rounded-2xl bg-white shadow-lg"
          onClick={() => setOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {open && (
          <div
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => setOpen(false)}
          >
            <div
              className="h-full w-[300px] shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <SidebarContent />
            </div>
          </div>
        )}
      </div>

      <aside className="hidden w-[300px] shrink-0 border-r border-slate-200/80 lg:block">
        <SidebarContent />
      </aside>
    </>
  );
}