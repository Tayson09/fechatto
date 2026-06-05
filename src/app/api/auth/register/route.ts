// src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { UserService } from "@/server/services/user.service";
import { UserRepository } from "@/server/repositories/user.repository";
import { AppError } from "@/lib/errors";

const userService = new UserService(new UserRepository());

const RegisterSchema = z.object({
  name: z.string().min(3, "Nome precisa ter pelo menos 3 caracteres"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "A senha precisa ter pelo menos 6 caracteres"),
  phone: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = RegisterSchema.parse(body);

    const user = await userService.register(data);

    return NextResponse.json(
      {
        message: "Usuário criado com sucesso",
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          createdAt: user.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: "Dados inválidos",
          details: error.flatten(),
        },
        { status: 422 }
      );
    }

    if (error instanceof AppError) {
      return NextResponse.json(
        {
          error: error.message,
        },
        { status: error.statusCode }
      );
    }

    console.error("REGISTER ERROR:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}