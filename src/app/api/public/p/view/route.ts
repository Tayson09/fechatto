import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError } from "@/lib/errors";
import { PropertyRepository } from "@/server/repositories/property.repository";
import { PropertyService } from "@/server/services/property.service";

const service = new PropertyService(new PropertyRepository());

export async function POST(_: NextRequest, { params }: { params: { token: string } }) {
  try {
    const { token } = params;
    const data = await service.incrementPublicView(token);
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}

function handleError(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 422 });
  }

  if (error instanceof AppError) {
    return NextResponse.json({ error: error.message }, { status: error.statusCode });
  }

  console.error(error);
  return NextResponse.json({ error: "Erro interno" }, { status: 500 });
}