"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import {
  LayoutDashboard,
  Users,
  KanbanSquare,
  BellRing,
  Home,
  Link2,
  Handshake,
  CalendarDays,
  DollarSign,
  Settings,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  LogOut,
  UserCircle2,
} from "lucide-react";

import { cn } from "@/lib/utils";

type MenuItem = {
  title: string;
  href?: string;
  icon: React.ElementType;
  badge?: number;
  children?: {
    title: string;
    href: string;
  }[];
};

const menu: MenuItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },

  {
    title: "Clientes",
    icon: Users,
    children: [
      {
        title: "Lista de clientes",
        href: "/clients",
      },
      {
        title: "Kanban",
        href: "/clients/kanban",
      },
      {
        title: "Follow-ups",
        href: "/clients/followups",
      },
    ],
  },

  {
    title: "Imóveis",
    icon: Home,
    children: [
      {
        title: "Todos os imóveis",
        href: "/properties",
      },
      {
        title: "Links públicos",
        href: "/properties/public-links",
      },
    ],
  },

  {
    title: "Negociações",
    icon: Handshake,
    children: [
      {
        title: "Negociações",
        href: "/negotiations",
      },
      {
        title: "Visitas",
        href: "/visits",
      },
    ],
  },

  {
    title: "Comissões",
    href: "/commissions",
    icon: DollarSign,
  },

  {
    title: "Configurações",
    href: "/settings",
    icon: Settings,
  },
];

export function MainSidebar() {
  const pathname = usePathname();

  const [openMenus, setOpenMenus] = useState<string[]>([
    "Clientes",
    "Imóveis",
  ]);

  function toggleMenu(title: string) {
    setOpenMenus((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title]
    );
  }

  return (
    <aside className="w-[290px] bg-[#07142A] text-white flex flex-col border-r border-white/10">
      {/* Header */}

      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center">
            <ShieldCheck className="h-6 w-6 text-yellow-400" />
          </div>

          <div>
            <h2 className="font-bold tracking-[0.25em]">
              FECHATTO
            </h2>

            <p className="text-xs text-white/50">
              CRM Imobiliário
            </p>
          </div>
        </div>
      </div>

      {/* Menu */}

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">

          {menu.map((item) => {

            const Icon = item.icon;

            if (!item.children) {
              const active = pathname === item.href;

              return (
                <Link
                  key={item.title}
                  href={item.href!}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-4 py-3 transition-all",
                    active
                      ? "bg-yellow-400 text-slate-950 font-medium"
                      : "hover:bg-white/10 text-white/80"
                  )}
                >
                  <Icon className="h-5 w-5" />

                  <span>{item.title}</span>
                </Link>
              );
            }

            const opened = openMenus.includes(item.title);

            const hasActiveChild = item.children.some(
              (child) => pathname === child.href
            );

            return (
              <div key={item.title}>
                <button
                  onClick={() => toggleMenu(item.title)}
                  className={cn(
                    "w-full flex items-center justify-between rounded-2xl px-4 py-3 transition-all",
                    hasActiveChild
                      ? "bg-white/10"
                      : "hover:bg-white/10"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5" />
                    <span>{item.title}</span>
                  </div>

                  {opened ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>

                {opened && (
                  <div className="mt-2 ml-5 border-l border-white/10 pl-4 space-y-1">
                    {item.children.map((child) => {
                      const active =
                        pathname === child.href;

                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={cn(
                            "block rounded-xl px-3 py-2 text-sm transition-all",
                            active
                              ? "bg-yellow-400 text-slate-950 font-medium"
                              : "text-white/70 hover:bg-white/10"
                          )}
                        >
                          {child.title}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}

      <div className="border-t border-white/10 p-4">
        <div className="rounded-3xl bg-white/5 p-4">

          <div className="flex items-center gap-3">
            <UserCircle2 className="h-10 w-10 text-yellow-400" />

            <div>
              <p className="font-medium">
                Tayson Silva
              </p>

              <p className="text-xs text-white/50">
                Corretor Premium
              </p>
            </div>
          </div>

          <button
            className="mt-4 flex w-full items-center gap-2 rounded-xl bg-white/5 px-4 py-3 hover:bg-white/10"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
      </div>
    </aside>
  );
}