import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ClientService } from "@/server/services/client.service";
import { ClientRepository } from "@/server/repositories/client.repository";
import { AppError } from "@/lib/errors";
import { ZodError } from "zod";

const clientService = new ClientService(new ClientRepository());

type RouteParams = Promise<{ id: string }> | { id: string };

async function getClientId(params: RouteParams) {
  const resolved = await Promise.resolve(params);
  return resolved?.id;
}

export async function GET(_: NextRequest, { params }: { params: RouteParams }) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const clientId = await getClientId(params);
    if (!clientId) {
      return NextResponse.json({ error: "ID do cliente inválido" }, { status: 400 });
    }

    const client = await clientService.getById(userId, clientId);
    return NextResponse.json({ data: client });
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(req: NextRequest, { params }: { params: RouteParams }) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const clientId = await getClientId(params);
    if (!clientId) {
      return NextResponse.json({ error: "ID do cliente inválido" }, { status: 400 });
    }

    const body = await req.json().catch(() => {
      throw new AppError("Corpo da requisição inválido", 400);
    });

    const client = await clientService.update(userId, clientId, body);
    return NextResponse.json({ data: client });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_: NextRequest, { params }: { params: RouteParams }) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const clientId = await getClientId(params);
    if (!clientId) {
      return NextResponse.json({ error: "ID do cliente inválido" }, { status: 400 });
    }

    const client = await clientService.softDelete(userId, clientId);
    return NextResponse.json({ data: client });
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
