import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ClientService } from "@/server/services/client.service";
import { ClientRepository } from "@/server/repositories/client.repository";
import { AppError } from "@/lib/errors";
import { ZodError } from "zod";

const clientService = new ClientService(new ClientRepository());

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const view = searchParams.get("view"); // "list" | "kanban"
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit = Math.min(Number(searchParams.get("limit") ?? 20), 100);
  const status = searchParams.get("status") || undefined;

  try {
    if (view === "kanban") {
      const kanban = await clientService.getKanban(session.user.id);
      return NextResponse.json({ data: kanban });
    }
    const clients = await clientService.list(session.user.id, {
      skip: (page - 1) * limit,
      take: limit,
      status,
    });
    return NextResponse.json({ data: clients, page, limit });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const client = await clientService.create(session.user.id, body);
    return NextResponse.json({ data: client }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}

function handleError(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json({ error: "Dados inválidos", details: error.flatten() }, { status: 422 });
  }
  if (error instanceof AppError) {
    return NextResponse.json({ error: error.message }, { status: error.statusCode });
  }
  console.error(error);
  return NextResponse.json({ error: "Erro interno" }, { status: 500 });
}