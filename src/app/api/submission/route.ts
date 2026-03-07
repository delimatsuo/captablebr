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
    equityPercentage: submission.equityPercentage ? Number(submission.equityPercentage) : undefined,
    vestingTotalMonths: submission.vestingTotalMonths,
    cliffMonths: submission.cliffMonths,
    vestingSchedule: submission.vestingSchedule,
    grantType: submission.grantType,
    isFirstInRole: submission.isFirstInRole,
    hireYear: submission.hireYear,
    yearsExperience: submission.yearsExperience,
    contractType: submission.contractType,
    monthlySalary: submission.monthlySalary ? Number(submission.monthlySalary) : undefined,
    hasAnnualBonus: submission.hasAnnualBonus,
    annualBonus: submission.annualBonus ? Number(submission.annualBonus) : undefined,
    hasCommission: submission.hasCommission,
    commission: submission.commission ? Number(submission.commission) : undefined,
    hasRetentionPlan: submission.hasRetentionPlan,
    retentionAmount: submission.retentionAmount ? Number(submission.retentionAmount) : undefined,
    hasSignOn: submission.hasSignOn,
    signOnAmount: submission.signOnAmount ? Number(submission.signOnAmount) : undefined,
    notifyEmail: submission.notifyEmail,
    // Grant-specific fields
    inputMode: submission.grant?.inputMode ?? "percentage",
    numberOfShares: submission.grant?.numberOfShares ? Number(submission.grant.numberOfShares) : undefined,
    totalSharesOutstanding: submission.grant?.totalSharesOutstanding ? Number(submission.grant.totalSharesOutstanding) : undefined,
    strikePrice: submission.grant?.strikePrice ? Number(submission.grant.strikePrice) : undefined,
    currentSharePrice: submission.grant?.currentSharePrice ? Number(submission.grant.currentSharePrice) : undefined,
    lastValuation: submission.grant?.lastValuation ? Number(submission.grant.lastValuation) : undefined,
    grantDate: submission.grant?.grantDate,
    grantLabel: submission.grant?.grantLabel,
    vestingStartDate: submission.grant?.vestingStartDate,
  });
}
