import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { ZodError } from "zod";
import { authOptions } from "@/lib/auth";
import { AppError } from "@/lib/errors";
import { NegotiationRepository } from "@/server/repositories/negotiation.repository";
import { NegotiationService } from "@/server/services/negotiation.service";

const service = new NegotiationService(new NegotiationRepository());

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json().catch(() => ({}));
    const data = await service.close(session.user.id, params.id, body);
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
