import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { ZodError } from "zod";
import { authOptions } from "@/lib/auth";
import { AppError } from "@/lib/errors";
import { NegotiationRepository } from "@/server/repositories/negotiation.repository";
import { NegotiationService } from "@/server/services/negotiation.service";

const service = new NegotiationService(new NegotiationRepository());

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const data = await service.getById(session.user.id, id);
    return NextResponse.json({ data });
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const data = await service.update(session.user.id, id, body);
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
