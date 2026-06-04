import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ClientService } from "@/server/services/client.service";
import { ClientRepository } from "@/server/repositories/client.repository";
import { AppError, NotFoundError } from "@/lib/errors";
import { ZodError } from "zod";

const clientService = new ClientService(new ClientRepository());

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const client = await clientService.list(session.user.id, {});
    // Para pegar um único, usamos o repo diretamente ou adicionamos um método no service
    // Vou adicionar um método getById rapidamente:
    const repo = new ClientRepository();
    const singleClient = await repo.findOne(params.id, session.user.id);
    if (!singleClient) throw new NotFoundError("Cliente");
    return NextResponse.json({ data: singleClient });
  } catch (error) {
    return handleError(error);
  }
}

// PUT e DELETE similares...
// (implementar conforme necessidade)
function handleError(error: unknown) { /* mesmo código */ }