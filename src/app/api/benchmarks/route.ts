import { verifySession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getBenchmarks, getStageComparison } from "@/lib/benchmarks";
import { COUNTRY_CODES, ROLE_LEVELS, ROLE_FUNCTIONS } from "@/lib/types";
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
  const roleLevel = searchParams.get("roleLevel");
  if (!roleLevel) {
    return NextResponse.json({ error: "Parâmetro 'roleLevel' obrigatório" }, { status: 400 });
  }
  if (!(ROLE_LEVELS as readonly string[]).includes(roleLevel)) {
    return NextResponse.json({ error: "Nível de cargo inválido" }, { status: 400 });
  }

  const roleFunctionParam = searchParams.get("roleFunction") || null;
  if (roleLevel !== "CEO") {
    if (!roleFunctionParam || !(ROLE_FUNCTIONS as readonly string[]).includes(roleFunctionParam)) {
      return NextResponse.json({ error: "Função de cargo inválida" }, { status: 400 });
    }
  }
  const roleFunction = roleLevel === "CEO" ? null : roleFunctionParam;

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
    const comparison = getStageComparison(roleLevel, roleFunction);
    if (!comparison) {
      return NextResponse.json({ error: "Dados insuficientes" }, { status: 404 });
    }
    return NextResponse.json({ ...comparison, hasSubmission, mode: "comparison" });
  }

  const result = await getBenchmarks(roleLevel, roleFunction, stage, businessModel, sector, country);

  if (!result) {
    return NextResponse.json(
      { error: "Dados insuficientes para este segmento" },
      { status: 404 }
    );
  }

  return NextResponse.json({ ...result, hasSubmission, mode: "single" });
}
