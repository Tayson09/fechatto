import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { VisitRepository } from "@/server/repositories/visit.repository";
import { VisitService } from "@/server/services/visit.service";
import { createVisitSchema } from "@/server/validators/visit.schema";

const service = new VisitService(new VisitRepository());

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  }

  const visits = await service.listVisits(session.user.id);
  return NextResponse.json(visits);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createVisitSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Dados inválidos", errors: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const visit = await service.createVisit(session.user.id, parsed.data);
  return NextResponse.json(visit, { status: 201 });
}