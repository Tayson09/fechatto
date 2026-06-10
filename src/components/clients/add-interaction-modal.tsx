"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { INTERACTION_TYPE_LABELS, type InteractionType } from "@/types/client";

interface AddInteractionModalProps {
  clientId: string;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const TYPES: { value: InteractionType; emoji: string }[] = [
  { value: "CALL", emoji: "📞" },
  { value: "VISIT", emoji: "🏠" },
  { value: "RETURN", emoji: "🔁" },
  { value: "NOTE", emoji: "📝" },
];

export function AddInteractionModal({
  clientId,
  open,
  onClose,
  onSuccess,
}: AddInteractionModalProps) {
  const [type, setType] = useState<InteractionType>("NOTE");
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setType("NOTE");
    setTitle("");
    setNote("");
    setError(null);
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!note.trim()) {
      setError("Anotação é obrigatória");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/clients/${clientId}/history`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          title: title.trim() || null,
          note: note.trim(),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao registrar interação");
      }
      reset();
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title="Registrar interação" size="md">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className={cn(
            "rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700",
            "dark:border-red-500/25 dark:bg-red-500/10 dark:text-red-400"
          )}>
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Tipo</label>
          <div className="grid grid-cols-4 gap-2">
            {TYPES.map(({ value, emoji }) => (
              <button
                key={value}
                type="button"
                onClick={() => setType(value)}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-2xl border py-3 text-xs font-medium transition-all",
                  type === value
                    ? "border-slate-800 bg-slate-950 text-white dark:border-white/20 dark:bg-white dark:text-slate-900"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-400 dark:border-white/10 dark:bg-white/8 dark:text-slate-400 dark:hover:border-white/20 dark:hover:bg-white/12"
                )}
              >
                <span className="text-lg">{emoji}</span>
                {INTERACTION_TYPE_LABELS[value]}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Título (opcional)</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Ligação de prospecção"
            maxLength={120}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Anotação <span className="text-red-500">*</span>
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Descreva o que aconteceu nesta interação..."
            rows={4}
            maxLength={2000}
            className={cn(
              "flex min-h-[100px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition",
              "placeholder:text-slate-400",
              "focus:border-slate-400 focus:ring-2 focus:ring-slate-200",
              "dark:border-white/10 dark:bg-[#16253a] dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-white/25 dark:focus:ring-white/8"
            )}
          />
          <p className="text-right text-xs text-slate-400 dark:text-slate-500">{note.length}/2000</p>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Salvando...
              </span>
            ) : (
              "Registrar"
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
