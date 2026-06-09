"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClientKanbanColumn } from "./client-kanban-column";
import { STATUS_ORDER, type ClientCard, type ClientStatus } from "@/types/client";

type KanbanData = Record<ClientStatus, ClientCard[]>;

function buildEmpty(): KanbanData {
  return STATUS_ORDER.reduce((acc, s) => ({ ...acc, [s]: [] }), {} as KanbanData);
}

export function ClientKanbanBoard() {
  const [columns, setColumns] = useState<KanbanData>(buildEmpty());
  const [loading, setLoading] = useState(true);

  const fetchKanban = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/clients?view=kanban");
      if (res.ok) {
        const { data } = await res.json();
        setColumns({ ...buildEmpty(), ...data });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKanban();
  }, [fetchKanban]);

  async function handleDragEnd(result: DropResult) {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const src = source.droppableId as ClientStatus;
    const dst = destination.droppableId as ClientStatus;

    // Optimistic update
    setColumns((prev) => {
      const next = { ...prev };
      const srcItems = [...next[src]];
      const [moved] = srcItems.splice(source.index, 1);
      const dstItems = src === dst ? srcItems : [...next[dst]];
      dstItems.splice(destination.index, 0, { ...moved, status: dst });
      next[src] = srcItems;
      if (src !== dst) next[dst] = dstItems;
      return next;
    });

    // Persist
    try {
      await fetch(`/api/clients/${draggableId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: dst }),
      });
    } catch {
      // Revert on error
      fetchKanban();
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-700" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <Link href="/clients/new">
          <Button className="bg-[#082a54] text-white hover:bg-[#0b3a6e]">
            <UserPlus className="h-4 w-4" />
            Novo cliente
          </Button>
        </Link>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-3 overflow-x-auto pb-4">
          {STATUS_ORDER.map((status) => (
            <ClientKanbanColumn
              key={status}
              status={status}
              clients={columns[status] ?? []}
            />
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
