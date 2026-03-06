import { verifySession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }

  const company = await prisma.company.findUnique({
    where: { userId: session.uid },
    select: { totalSharesOutstanding: true },
  });

  return NextResponse.json({
    totalSharesOutstanding: company?.totalSharesOutstanding ?? null,
  });
}
