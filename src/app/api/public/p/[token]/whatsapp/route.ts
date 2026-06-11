import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError } from "@/lib/errors";
import { PropertyRepository } from "@/server/repositories/property.repository";
import { PropertyService } from "@/server/services/property.service";

const service = new PropertyService(new PropertyRepository());

function buildWhatsAppUrl(phone: string, message: string) {
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/55${digits}?text=${encodeURIComponent(message)}`;
}

export async function POST(_: NextRequest, { params }: { params: { token: string } }) {
  try {
    const { token } = params;
    const property = await service.getPublicByToken(token);

    const phone = property.user?.phone;
    if (!phone) {
      return NextResponse.json(
        { error: "Corretor sem telefone cadastrado" },
        { status: 400 }
      );
    }

    const message = `Olá! Tenho interesse no imóvel ${property.address}, em ${property.city}.`;
    const url = buildWhatsAppUrl(phone, message);

    return NextResponse.json({ data: { url } });
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