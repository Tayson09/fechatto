import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { ZodError } from "zod";
import { authOptions } from "@/lib/auth";
import { AppError } from "@/lib/errors";
import { NegotiationRepository } from "@/server/repositories/negotiation.repository";
import { NegotiationService } from "@/server/services/negotiation.service";

const service = new NegotiationService(new NegotiationRepository());

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const limit = Math.min(Number(searchParams.get("limit") ?? 20), 100);
    const status = searchParams.get("status") || undefined;
    const data = await service.list(session.user.id, { skip: (page - 1) * limit, take: limit, status });
    return NextResponse.json({ data, page, limit });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const data = await service.create(session.user.id, body);
    return NextResponse.json({ data }, { status: 201 });
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
