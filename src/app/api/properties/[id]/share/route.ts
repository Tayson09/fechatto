import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { ZodError } from "zod";
import { authOptions } from "@/lib/auth";
import { AppError } from "@/lib/errors";
import { PropertyRepository } from "@/server/repositories/property.repository";
import { PropertyService } from "@/server/services/property.service";

const service = new PropertyService(new PropertyRepository());

export async function POST(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = params;
    const data = await service.generateShareLink(session.user.id, id);
    return NextResponse.json({ data });
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = params;
    const body = await req.json();
    const data = await service.toggleShare(session.user.id, id, body);
    return NextResponse.json({ data });
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

  if (error instanceof AppError) {
    return NextResponse.json({ error: error.message }, { status: error.statusCode });
  }

  console.error(error);
  return NextResponse.json({ error: "Erro interno" }, { status: 500 });
}