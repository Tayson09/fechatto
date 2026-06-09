import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AppError } from "@/lib/errors";
import { PropertyRepository } from "@/server/repositories/property.repository";
import { PropertyService } from "@/server/services/property.service";

const service = new PropertyService(new PropertyRepository());

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json().catch(() => ({}));
    const action = body.action === "revoke" ? "revoke" : "enable";
    const data =
      action === "revoke"
        ? await service.revokeShareLink(session.user.id, params.id)
        : await service.enableShareLink(session.user.id, params.id);
    return NextResponse.json({ data });
  } catch (error) {
    if (error instanceof AppError) return NextResponse.json({ error: error.message }, { status: error.statusCode });
    console.error(error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
