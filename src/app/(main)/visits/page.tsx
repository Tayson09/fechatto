// src/app/(dashboard)/visitas/page.tsx
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { VisitRepository } from "@/server/repositories/visit.repository";
import { VisitService } from "@/server/services/visit.service";
import { VisitsClient } from "./visits-client";

const service = new VisitService(new VisitRepository());

export default async function VisitsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const [visits, negotiations] = await Promise.all([
    service.listVisits(session.user.id),
    service.listNegotiationsForVisit(session.user.id),
  ]);

  return (
    <VisitsClient
      initialVisits={visits}
      negotiations={negotiations}
    />
  );
}