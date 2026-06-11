// src/app/api/visits/[id]/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { VisitRepository } from "@/server/repositories/visit.repository";
import { VisitService } from "@/server/services/visit.service";
import { updateVisitSchema } from "@/server/validators/visit.schema";

const service = new VisitService(new VisitRepository());

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  const parsed = updateVisitSchema.safeParse({
    id,
    ...body,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Dados inválidos", errors: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const visit = await service.updateVisit(session.user.id, parsed.data);
  return NextResponse.json(visit);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  }

  const { id } = await params;
  await service.deleteVisit(session.user.id, id);

  return NextResponse.json({ ok: true });
}