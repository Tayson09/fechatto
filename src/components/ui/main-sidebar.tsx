"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Building2,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  FileText,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Moon,
  Settings,
  ShieldCheck,
  Sun,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
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
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("sidebar-collapsed");
    if (stored === "true") setCollapsed(true);
  }, []);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("sidebar-collapsed", String(next));
      return next;
    });
  }

  function toggleTheme() {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }

  function renderContent(isMobile = false) {
    const mini = collapsed && !isMobile;
    return (
      <div className="flex h-full flex-col bg-[#071b33] text-white">
        {/* Header */}
        <div className={cn("border-b border-white/10", mini ? "px-3 py-5" : "px-6 py-6")}>
          <div className={cn("flex items-center", mini ? "justify-center" : "justify-between")}>
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/10">
                <ShieldCheck className="h-5 w-5 text-[#ba933a]" />
              </div>
              {!mini && (
                <div>
                  <p className="text-sm font-semibold tracking-[0.25em] text-white/90">FECHATTO</p>
                  <p className="text-xs text-white/40">CRM Imobiliário</p>
                </div>
              )}
            </Link>
            {!isMobile && (
              <button
                onClick={toggleCollapsed}
                title={mini ? "Expandir menu" : "Recolher menu"}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-white/40 transition hover:bg-white/10 hover:text-white"
              >
                {mini ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className={cn("flex-1 py-5", mini ? "px-2" : "px-4")}>
          {!mini && (
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
          )}

          <nav className="space-y-1">
            {items.map((item) => {
              const Icon = item.icon;
              const active =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  title={mini ? item.label : undefined}
                  className={cn(
                    "group flex items-center gap-3 rounded-2xl py-3 text-sm transition-all duration-200",
                    mini ? "justify-center px-2" : "px-4",
                    active
                      ? "bg-[#ba933a] text-slate-950 shadow-lg shadow-[#ba933a]/20"
                      : "text-white/70 hover:bg-white/8 hover:text-white"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!mini && (
                    <>
                      <span className="flex-1">{item.label}</span>
                      <span className="opacity-0 transition group-hover:opacity-100">→</span>
                    </>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 p-4">
          <div className={cn("rounded-3xl bg-white/5 ring-1 ring-white/10", mini ? "p-2" : "p-4")}>
            <div className={cn("flex items-center gap-3", mini && "justify-center")}>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-800 ring-1 ring-white/10">
                <ShieldCheck className="h-5 w-5 text-[#ba933a]" />
              </div>
              {!mini && (
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">Tayson Silva</p>
                  <p className="truncate text-xs text-white/40">Corretor premium</p>
                </div>
              )}
            </div>

            <div className={cn("mt-3 flex items-center gap-2", mini && "mt-2 flex-col")}>
              {mini ? (
                <button className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/10 text-white transition hover:bg-white/15">
                  <LogOut className="h-4 w-4" />
                </button>
              ) : (
                <Button className="flex-1 rounded-2xl bg-white/10 text-white hover:bg-white/15">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </Button>
              )}
              {mounted && (
                <button
                  onClick={toggleTheme}
                  title={resolvedTheme === "dark" ? "Modo claro" : "Modo escuro"}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white transition hover:bg-white/20"
                >
                  {resolvedTheme === "dark" ? (
                    <Sun className="h-4 w-4" />
                  ) : (
                    <Moon className="h-4 w-4" />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden shrink-0 transition-all duration-300 lg:block",
          collapsed ? "w-[72px]" : "w-80"
        )}
      >
        {renderContent(false)}
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            aria-label="Fechar menu"
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-80 max-w-[85vw] shadow-2xl">
            {renderContent(true)}
          </div>
        </div>
      )}

      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 shadow-sm lg:hidden dark:border-white/10 dark:bg-[#071b33]">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#071b33] text-white dark:bg-white/10">
            <ShieldCheck className="h-5 w-5 text-[#ba933a]" />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-[0.2em] text-slate-900 dark:!text-white">FECHATTO</p>
            <p className="text-xs text-slate-500 dark:text-white/40">CRM Imobiliário</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {mounted && (
            <button
              onClick={toggleTheme}
              title={resolvedTheme === "dark" ? "Modo claro" : "Modo escuro"}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 dark:border-white/10 dark:text-white/70 dark:hover:bg-white/10"
            >
              {resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          )}
          <Button variant="outline" size="icon" onClick={() => setOpen(true)} className="rounded-2xl">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </>
  );
}
