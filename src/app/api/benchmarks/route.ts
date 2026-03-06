import { verifySession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getBenchmarks } from "@/lib/benchmarks";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }

  // Check give-to-get gate
  const submission = await prisma.submission.findFirst({
    where: { userId: session.uid, status: "active", confirmedByUser: true },
  });

  if (!submission) {
    return NextResponse.json(
      { error: "Submeta sua compensacao para acessar os benchmarks" },
      { status: 403 }
    );
  }

  const { searchParams } = request.nextUrl;
  const role = searchParams.get("role");
  if (!role) {
    return NextResponse.json({ error: "Parametro 'role' obrigatorio" }, { status: 400 });
  }

  const stage = searchParams.get("stage") || undefined;
  const businessModel = searchParams.get("businessModel") || undefined;
  const sector = searchParams.get("sector") || undefined;

  const result = await getBenchmarks(role, stage, businessModel, sector);

  if (!result) {
    return NextResponse.json(
      { error: "Dados insuficientes para este segmento" },
      { status: 404 }
    );
  }

  return NextResponse.json(result);
}
