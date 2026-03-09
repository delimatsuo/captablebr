import { verifySession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getBenchmarks, getStageComparison } from "@/lib/benchmarks";
import { COUNTRY_CODES } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const submission = await prisma.submission.findUnique({
    where: { userId: session.uid },
    select: { confirmedByUser: true },
  });
  const hasSubmission = !!submission?.confirmedByUser;

  const { searchParams } = request.nextUrl;
  const role = searchParams.get("role");
  if (!role) {
    return NextResponse.json({ error: "Parâmetro 'role' obrigatório" }, { status: 400 });
  }

  const stage = searchParams.get("stage") || undefined;
  const businessModel = searchParams.get("businessModel") || undefined;
  const sector = searchParams.get("sector") || undefined;

  const countryParam = searchParams.get("country") || undefined;
  if (countryParam && !(COUNTRY_CODES as readonly string[]).includes(countryParam)) {
    return NextResponse.json({ error: "Código de país inválido" }, { status: 400 });
  }
  const country = countryParam;

  // No stage selected → return multi-stage comparison
  if (!stage) {
    const comparison = getStageComparison(role);
    if (!comparison) {
      return NextResponse.json({ error: "Dados insuficientes" }, { status: 404 });
    }
    return NextResponse.json({ ...comparison, hasSubmission, mode: "comparison" });
  }

  const result = await getBenchmarks(role, stage, businessModel, sector, country);

  if (!result) {
    return NextResponse.json(
      { error: "Dados insuficientes para este segmento" },
      { status: 404 }
    );
  }

  return NextResponse.json({ ...result, hasSubmission, mode: "single" });
}
