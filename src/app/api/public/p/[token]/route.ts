import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { invalidateCache } from "@/lib/cache";

export async function GET(_: NextRequest, { params }: { params?: Promise<{ token: string }> | { token: string } }) {
  const resolvedParams = await Promise.resolve(params);
  const property = await prisma.property.findFirst({
    where: { shareToken: resolvedParams?.token, shareEnabled: true, deletedAt: null },
    select: {
      id: true,
      userId: true,
      type: true,
      address: true,
      city: true,
      area: true,
      price: true,
      commission: true,
      notes: true,
      shareViews: true,
      photos: { select: { url: true, order: true }, orderBy: { order: "asc" } },
      user: { select: { name: true, phone: true, email: true } },
    },
  });

  if (!property) return NextResponse.json({ error: "Link inválido ou expirado" }, { status: 404 });

  prisma.property
    .update({
      where: { id: property.id },
      data: { shareViews: { increment: 1 } },
    })
    .then(() => invalidateCache(`dashboard:${property.userId}:`))
    .catch(console.error);

  return NextResponse.json({ data: property });
}
