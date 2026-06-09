import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { ZodError } from "zod";
import { authOptions } from "@/lib/auth";
import { AppError } from "@/lib/errors";
import { PropertyRepository } from "@/server/repositories/property.repository";
import { PropertyService } from "@/server/services/property.service";

const service = new PropertyService(new PropertyRepository());

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const data = await service.getById(session.user.id, params.id);
    return NextResponse.json({ data });
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const data = await service.update(session.user.id, params.id, body);
    return NextResponse.json({ data });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const data = await service.softDelete(session.user.id, params.id);
    return NextResponse.json({ data });
  } catch (error) {
    return handleError(error);
  }
}

function handleError(error: unknown) {
  if (error instanceof ZodError) return NextResponse.json({ error: "Dados inválidos", details: error.flatten() }, { status: 422 });
  if (error instanceof AppError) return NextResponse.json({ error: error.message }, { status: error.statusCode });
  console.error(error);
  return NextResponse.json({ error: "Erro interno" }, { status: 500 });
}
