import { verifySession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const submission = await prisma.submission.findFirst({
    where: { userId: session.uid, status: "active" },
    orderBy: { createdAt: "desc" },
    include: { grant: true },
  });

  if (!submission) {
    return NextResponse.json(null, { status: 404 });
  }

  return NextResponse.json({
    stage: submission.stage,
    businessModel: submission.businessModel,
    sector: submission.sector,
    subSector: submission.subSector,
    headcountRange: submission.headcountRange,
    role: submission.role,
    instrumentType: submission.instrumentType,
    equityPercentage: Number(submission.equityPercentage),
    vestingTotalMonths: submission.vestingTotalMonths,
    cliffMonths: submission.cliffMonths,
    vestingSchedule: submission.vestingSchedule,
    grantType: submission.grantType,
    isFirstInRole: submission.isFirstInRole,
    hireYear: submission.hireYear,
    yearsExperience: submission.yearsExperience,
    cashCompRange: submission.cashCompRange,
    hasAnnualBonus: submission.hasAnnualBonus,
    annualBonusRange: submission.annualBonusRange,
    hasCommission: submission.hasCommission,
    commissionRange: submission.commissionRange,
    hasRetentionPlan: submission.hasRetentionPlan,
    retentionRange: submission.retentionRange,
    hasSignOn: submission.hasSignOn,
    signOnRange: submission.signOnRange,
    notifyEmail: submission.notifyEmail,
    // Grant-specific fields
    grant: submission.grant ? {
      inputMode: submission.grant.inputMode,
      numberOfShares: submission.grant.numberOfShares,
      totalSharesOutstanding: submission.grant.totalSharesOutstanding,
      strikePrice: submission.grant.strikePrice ? Number(submission.grant.strikePrice) : null,
      strikeCurrency: submission.grant.strikeCurrency,
      grantDate: submission.grant.grantDate,
      grantLabel: submission.grant.grantLabel,
      vestingStartDate: submission.grant.vestingStartDate,
    } : null,
  });
}
