import { verifySession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const submission = await prisma.submission.findUnique({
    where: { userId: session.uid },
    include: { grants: { orderBy: { createdAt: "asc" } } },
  });

  if (!submission) {
    return NextResponse.json(null, { status: 404 });
  }

  return NextResponse.json({
    id: submission.id,
    stage: submission.stage,
    businessModel: submission.businessModel,
    sector: submission.sector,
    subSector: submission.subSector,
    headcountRange: submission.headcountRange,
    country: submission.country,
    currency: submission.currency,
    fxRateUsed: submission.fxRateUsed ? Number(submission.fxRateUsed) : undefined,
    role: submission.role,
    roleLevel: submission.roleLevel,
    roleFunction: submission.roleFunction,
    equityPercentage: submission.equityPercentage ? Number(submission.equityPercentage) : undefined,
    isFirstInRole: submission.isFirstInRole,
    hireYear: submission.hireYear,
    yearsExperience: submission.yearsExperience,
    contractType: submission.contractType,
    annualSalary: submission.annualSalary ? Number(submission.annualSalary) : undefined,
    hasAnnualBonus: submission.hasAnnualBonus,
    annualBonus: submission.annualBonus ? Number(submission.annualBonus) : undefined,
    hasCommission: submission.hasCommission,
    commission: submission.commission ? Number(submission.commission) : undefined,
    hasRetentionPlan: submission.hasRetentionPlan,
    retentionAmount: submission.retentionAmount ? Number(submission.retentionAmount) : undefined,
    hasSignOn: submission.hasSignOn,
    signOnAmount: submission.signOnAmount ? Number(submission.signOnAmount) : undefined,
    notifyEmail: submission.notifyEmail,
    confirmedByUser: submission.confirmedByUser,
    grants: submission.grants.map((g) => ({
      id: g.id,
      instrumentType: g.instrumentType,
      equityPercentage: g.equityPercentage ? Number(g.equityPercentage) : undefined,
      vestingTotalMonths: g.vestingTotalMonths,
      cliffMonths: g.cliffMonths,
      vestingSchedule: g.vestingSchedule,
      grantType: g.grantType,
      isFirstInRole: g.isFirstInRole,
      inputMode: g.inputMode,
      numberOfShares: g.numberOfShares ? Number(g.numberOfShares) : undefined,
      totalSharesOutstanding: g.totalSharesOutstanding ? Number(g.totalSharesOutstanding) : undefined,
      strikePrice: g.strikePrice ? Number(g.strikePrice) : undefined,
      strikeCurrency: g.strikeCurrency,
      currentSharePrice: g.currentSharePrice ? Number(g.currentSharePrice) : undefined,
      lastValuation: g.lastValuation ? Number(g.lastValuation) : undefined,
      grantDate: g.grantDate?.toISOString() ?? null,
      grantLabel: g.grantLabel,
      vestingStartDate: g.vestingStartDate?.toISOString() ?? null,
      createdAt: g.createdAt.toISOString(),
    })),
  });
}
