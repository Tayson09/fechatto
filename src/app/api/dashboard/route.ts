import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { ZodError } from "zod";
import { authOptions } from "@/lib/auth";
import { AppError } from "@/lib/errors";
import { CommissionRepository } from "@/server/repositories/commission.repository";
import { CommissionService } from "@/server/services/commission.service";
import { CommissionQuerySchema } from "@/server/validators/commission.schema";

const service = new CommissionService(new CommissionRepository());

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const query = CommissionQuerySchema.parse({
      period: searchParams.get("period") ?? undefined,
    });
    const search = searchParams.get("search") ?? "";

    const data = await service.getDashboardMetrics(session.user.id, query.period, search);
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
