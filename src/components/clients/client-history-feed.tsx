"use client";

import { useCallback, useEffect, useState } from "react";
import { Phone, Home, RefreshCw, StickyNote, Plus } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { AddInteractionModal } from "./add-interaction-modal";
import { INTERACTION_TYPE_LABELS, type HistoryEntry, type InteractionType } from "@/types/client";
import { cn } from "@/lib/utils";

interface ClientHistoryFeedProps {
  clientId: string;
  initialEntries?: HistoryEntry[];
}

const TYPE_ICONS: Record<InteractionType, React.ElementType> = {
  CALL: Phone,
  VISIT: Home,
  RETURN: RefreshCw,
  NOTE: StickyNote,
};

const TYPE_STYLES: Record<
  InteractionType,
  { bg: string; text: string; border: string }
> = {
  CALL: { bg: "bg-blue-50 dark:bg-blue-500/15", text: "text-blue-600 dark:text-blue-400", border: "border-blue-200 dark:border-blue-500/25" },
  VISIT: { bg: "bg-teal-50 dark:bg-teal-500/15", text: "text-teal-600 dark:text-teal-400", border: "border-teal-200 dark:border-teal-500/25" },
  RETURN: { bg: "bg-amber-50 dark:bg-amber-500/15", text: "text-amber-600 dark:text-amber-400", border: "border-amber-200 dark:border-amber-500/25" },
  NOTE: { bg: "bg-slate-50 dark:bg-white/8", text: "text-slate-600 dark:text-slate-400", border: "border-slate-200 dark:border-white/8" },
};

export function ClientHistoryFeed({
  clientId,
  initialEntries = [],
}: ClientHistoryFeedProps) {
  const [entries, setEntries] = useState<HistoryEntry[]>(initialEntries);
  const [loading, setLoading] = useState(initialEntries.length === 0);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/clients/${clientId}/history`);
      if (res.ok) {
        const { data } = await res.json();
        setEntries(data);
      }
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    if (initialEntries.length === 0) {
      fetchHistory();
    }
  }, [fetchHistory, initialEntries.length]);

  function handleSuccess() {
    setModalOpen(false);
    fetchHistory();
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-950 dark:text-slate-100">Histórico</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {entries.length} {entries.length === 1 ? "interação" : "interações"}
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => setModalOpen(true)}
            className="gap-1.5 bg-[#082a54] text-white hover:bg-[#0b3a6e]"
          >
            <Plus className="h-4 w-4" />
            Registrar
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700 dark:border-slate-700 dark:border-t-slate-300" />
          </div>
        ) : entries.length === 0 ? (
          <div className={cn(
            "rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center",
            "dark:border-white/8 dark:bg-white/5"
          )}>
            <StickyNote className="mx-auto mb-3 h-8 w-8 text-slate-300 dark:text-slate-700" />
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Nenhuma interação registrada</p>
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
              Registre ligações, visitas e anotações deste cliente.
            </p>
          </div>
        ) : (
          <div className="relative space-y-3 pl-6">
            <div className="absolute left-2 top-0 h-full w-px bg-slate-200 dark:bg-white/8" />
            {entries.map((entry) => {
              const Icon = TYPE_ICONS[entry.type];
              const styles = TYPE_STYLES[entry.type];
              return (
                <div key={entry.id} className="relative">
                  <div
                    className={cn(
                      "absolute -left-4 top-3 flex h-5 w-5 items-center justify-center rounded-full border",
                      styles.bg,
                      styles.border
                    )}
                  >
                    <Icon className={cn("h-2.5 w-2.5", styles.text)} />
                  </div>
                  <div className={cn(
                    "rounded-2xl border border-slate-200 bg-white p-4",
                    "dark:border-white/8 dark:bg-[#16253a]"
                  )}>
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <div>
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
                            styles.bg,
                            styles.text,
                            styles.border
                          )}
                        >
                          {INTERACTION_TYPE_LABELS[entry.type]}
                        </span>
                        {entry.title && (
                          <p className="mt-1 text-sm font-medium text-slate-950 dark:text-slate-100">
                            {entry.title}
                          </p>
                        )}
                      </div>
                      <time className="shrink-0 text-xs text-slate-400 dark:text-slate-500">
                        {format(new Date(entry.createdAt), "dd/MM/yyyy 'às' HH:mm", {
                          locale: ptBR,
                        })}
                      </time>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{entry.note}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <AddInteractionModal
        clientId={clientId}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </>
  );
}
