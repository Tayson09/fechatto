import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z, ZodError } from "zod";
import { authOptions } from "@/lib/auth";
import { AppError } from "@/lib/errors";
import { NegotiationRepository } from "@/server/repositories/negotiation.repository";
import { NegotiationService } from "@/server/services/negotiation.service";

const service = new NegotiationService(new NegotiationRepository());

const CreateVisitSchema = z.object({
  negotiationId: z.string().min(1, "Selecione uma negociação"),
  date: z.string().datetime("Data inválida"),
  result: z.string().optional().nullable(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await service.listVisits(session.user.id);
    return NextResponse.json({ data });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = CreateVisitSchema.parse(body);

    const visit = await service.addVisit(
      session.user.id,
      data.negotiationId,
      new Date(data.date),
      data.result ?? null
    );

    return NextResponse.json({ data: visit }, { status: 201 });
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

  if (error instanceof Error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  console.error(error);
  return NextResponse.json({ error: "Erro interno" }, { status: 500 });
}
