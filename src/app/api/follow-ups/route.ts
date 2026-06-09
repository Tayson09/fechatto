import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AppError } from "@/lib/errors";
import { ClientRepository } from "@/server/repositories/client.repository";
import { ClientService } from "@/server/services/client.service";

const service = new ClientService(new ClientRepository());

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { overdue } = await service.getFollowUps(session.user.id);
    return NextResponse.json({ data: overdue });
  } catch (error) {
    if (error instanceof AppError) return NextResponse.json({ error: error.message }, { status: error.statusCode });
    console.error(error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
