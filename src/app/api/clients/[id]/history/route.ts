import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ClientService } from "@/server/services/client.service";
import { ClientRepository } from "@/server/repositories/client.repository";
import { AppError, NotFoundError } from "@/lib/errors";
import { ZodError } from "zod";

const clientService = new ClientService(new ClientRepository());

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const history = await clientService.getHistory(session.user.id, id);
    return NextResponse.json({ data: history });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const body = await req.json();
    const entry = await clientService.addHistory(session.user.id, id, body);
    return NextResponse.json({ data: entry }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}

function handleError(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: "Dados inválidos", details: error.flatten() },
      { status: 422 }
    );
  }
  if (error instanceof NotFoundError) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
  if (error instanceof AppError) {
    return NextResponse.json({ error: error.message }, { status: error.statusCode });
  }
  console.error(error);
  return NextResponse.json({ error: "Erro interno" }, { status: 500 });
}
