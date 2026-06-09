"use client";

import { Droppable, Draggable } from "@hello-pangea/dnd";
import { ClientKanbanCard } from "./client-kanban-card";
import { STATUS_LABELS, STATUS_STYLES, type ClientCard, type ClientStatus } from "@/types/client";
import { cn } from "@/lib/utils";

interface ClientKanbanColumnProps {
  status: ClientStatus;
  clients: ClientCard[];
}

export function ClientKanbanColumn({ status, clients }: ClientKanbanColumnProps) {
  const styles = STATUS_STYLES[status];

  return (
    <div className="flex w-[272px] shrink-0 flex-col rounded-3xl border border-slate-200 bg-slate-50">
      {/* Column header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <span className={cn("h-2.5 w-2.5 rounded-full", styles.dot)} />
          <span className="text-sm font-semibold text-slate-700">
            {STATUS_LABELS[status]}
          </span>
        </div>
        <span
          className={cn(
            "flex h-6 min-w-[24px] items-center justify-center rounded-full border px-1.5 text-xs font-medium",
            styles.bg,
            styles.text,
            styles.border
          )}
        >
          {clients.length}
        </span>
      </div>

      {/* Cards */}
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              "flex-1 space-y-2 overflow-y-auto px-3 pb-3 transition-colors",
              snapshot.isDraggingOver && "bg-slate-100/80"
            )}
            style={{ minHeight: 80, maxHeight: "calc(100vh - 260px)" }}
          >
            {clients.map((client, index) => (
              <Draggable
                key={client.id}
                draggableId={client.id}
                index={index}
              >
                {(dragProvided, dragSnapshot) => (
                  <div
                    ref={dragProvided.innerRef}
                    {...dragProvided.draggableProps}
                    {...dragProvided.dragHandleProps}
                    className={cn(
                      "transition",
                      dragSnapshot.isDragging && "opacity-90 ring-2 ring-[#082a54]/20 rounded-2xl"
                    )}
                  >
                    <ClientKanbanCard client={client} />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
            {clients.length === 0 && !snapshot.isDraggingOver && (
              <div className="flex h-16 items-center justify-center rounded-2xl border border-dashed border-slate-200">
                <p className="text-xs text-slate-400">Sem clientes</p>
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}
