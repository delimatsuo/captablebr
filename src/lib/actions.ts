"use server";

import crypto from "crypto";
import { prisma } from "./db";
import { verifySession } from "./auth";
import { companySchema, grantSchema, accessRequestSchema } from "./validations";
import { redirect } from "next/navigation";

async function requireAuth() {
  const session = await verifySession();
  if (!session) redirect("/login");
  return session;
}

function generateCompanyHash(): string {
  return crypto.randomBytes(16).toString("hex");
}

// --- Company ---

export async function getCompany() {
  const session = await requireAuth();
  return prisma.company.findUnique({ where: { userId: session.uid } });
}

export async function upsertCompany(formData: unknown) {
  const session = await requireAuth();
  const data = companySchema.parse(formData);

  const existing = await prisma.company.findUnique({
    where: { userId: session.uid },
  });

  if (existing) {
    return prisma.company.update({
      where: { userId: session.uid },
      data,
    });
  }

  return prisma.company.create({
    data: {
      ...data,
      userId: session.uid,
      companyHash: generateCompanyHash(),
    },
  });
}

// --- Grants ---

export async function getGrants() {
  const session = await requireAuth();
  const company = await prisma.company.findUnique({
    where: { userId: session.uid },
  });
  if (!company) return [];
  return prisma.grant.findMany({
    where: { companyId: company.id },
    orderBy: { createdAt: "desc" },
  });
}

export async function createGrant(formData: unknown) {
  const session = await requireAuth();
  const company = await prisma.company.findUnique({
    where: { userId: session.uid },
  });
  if (!company) throw new Error("Empresa nao encontrada. Crie o perfil primeiro.");

  const data = grantSchema.parse(formData);

  // Compute equity percentage from shares if needed
  let equityPercentage = data.equityPercentage ?? null;
  if (data.equityUnit === "shares" && data.sharesGranted && company.totalSharesOutstanding) {
    equityPercentage = (data.sharesGranted / company.totalSharesOutstanding) * 100;
  }

  return prisma.grant.create({
    data: {
      executiveLabel: data.executiveLabel,
      role: data.role,
      instrumentType: data.instrumentType,
      equityUnit: data.equityUnit,
      equityPercentage,
      sharesGranted: data.sharesGranted,
      vestingTotalMonths: data.vestingTotalMonths,
      cliffMonths: data.cliffMonths,
      vestingSchedule: data.vestingSchedule,
      grantType: data.grantType,
      isFirstInRole: data.isFirstInRole,
      hireYear: data.hireYear,
      yearsExperience: data.yearsExperience,
      cashCompRange: data.cashCompRange,
      hasAnnualBonus: data.hasAnnualBonus,
      annualBonusRange: data.annualBonusRange,
      hasCommission: data.hasCommission,
      commissionRange: data.commissionRange,
      hasRetentionPlan: data.hasRetentionPlan,
      retentionRange: data.retentionRange,
      hasSignOn: data.hasSignOn,
      signOnRange: data.signOnRange,
      companyId: company.id,
      confirmedByUser: true,
    },
  });
}

export async function createGrantFromAi(
  extractedData: unknown,
  sourceDocumentUrl?: string
) {
  const session = await requireAuth();
  const company = await prisma.company.findUnique({
    where: { userId: session.uid },
  });
  if (!company) throw new Error("Empresa nao encontrada.");

  const data = grantSchema.parse(extractedData);

  let equityPercentage = data.equityPercentage ?? null;
  if (data.equityUnit === "shares" && data.sharesGranted && company.totalSharesOutstanding) {
    equityPercentage = (data.sharesGranted / company.totalSharesOutstanding) * 100;
  }

  return prisma.grant.create({
    data: {
      executiveLabel: data.executiveLabel,
      role: data.role,
      instrumentType: data.instrumentType,
      equityUnit: data.equityUnit,
      equityPercentage,
      sharesGranted: data.sharesGranted,
      vestingTotalMonths: data.vestingTotalMonths,
      cliffMonths: data.cliffMonths,
      vestingSchedule: data.vestingSchedule,
      grantType: data.grantType,
      isFirstInRole: data.isFirstInRole,
      hireYear: data.hireYear,
      yearsExperience: data.yearsExperience,
      cashCompRange: data.cashCompRange,
      hasAnnualBonus: data.hasAnnualBonus,
      annualBonusRange: data.annualBonusRange,
      hasCommission: data.hasCommission,
      commissionRange: data.commissionRange,
      hasRetentionPlan: data.hasRetentionPlan,
      retentionRange: data.retentionRange,
      hasSignOn: data.hasSignOn,
      signOnRange: data.signOnRange,
      companyId: company.id,
      sourceDocumentUrl,
      extractedByAi: true,
      confirmedByUser: true,
    },
  });
}

export async function updateGrant(grantId: string, formData: unknown) {
  const session = await requireAuth();
  const company = await prisma.company.findUnique({
    where: { userId: session.uid },
  });
  if (!company) throw new Error("Empresa nao encontrada.");

  const grant = await prisma.grant.findFirst({
    where: { id: grantId, companyId: company.id },
  });
  if (!grant) throw new Error("Grant nao encontrado.");

  const data = grantSchema.parse(formData);

  let equityPercentage = data.equityPercentage ?? null;
  if (data.equityUnit === "shares" && data.sharesGranted && company.totalSharesOutstanding) {
    equityPercentage = (data.sharesGranted / company.totalSharesOutstanding) * 100;
  }

  return prisma.grant.update({
    where: { id: grantId },
    data: {
      executiveLabel: data.executiveLabel,
      role: data.role,
      instrumentType: data.instrumentType,
      equityUnit: data.equityUnit,
      equityPercentage,
      sharesGranted: data.sharesGranted,
      vestingTotalMonths: data.vestingTotalMonths,
      cliffMonths: data.cliffMonths,
      vestingSchedule: data.vestingSchedule,
      grantType: data.grantType,
      isFirstInRole: data.isFirstInRole,
      hireYear: data.hireYear,
      yearsExperience: data.yearsExperience,
      cashCompRange: data.cashCompRange,
      hasAnnualBonus: data.hasAnnualBonus,
      annualBonusRange: data.annualBonusRange,
      hasCommission: data.hasCommission,
      commissionRange: data.commissionRange,
      hasRetentionPlan: data.hasRetentionPlan,
      retentionRange: data.retentionRange,
      hasSignOn: data.hasSignOn,
      signOnRange: data.signOnRange,
    },
  });
}

export async function deleteGrant(grantId: string) {
  const session = await requireAuth();
  const company = await prisma.company.findUnique({
    where: { userId: session.uid },
  });
  if (!company) throw new Error("Empresa nao encontrada.");

  const grant = await prisma.grant.findFirst({
    where: { id: grantId, companyId: company.id },
  });
  if (!grant) throw new Error("Grant nao encontrado.");

  return prisma.grant.delete({ where: { id: grantId } });
}

export async function hasGrants(): Promise<boolean> {
  const session = await verifySession();
  if (!session) return false;
  const company = await prisma.company.findUnique({
    where: { userId: session.uid },
    include: { _count: { select: { grants: true } } },
  });
  return (company?._count.grants ?? 0) > 0;
}

// --- Access Requests ---

export async function submitAccessRequest(formData: unknown) {
  const data = accessRequestSchema.parse(formData);

  // Check if already invited
  const existing = await prisma.invitation.findUnique({
    where: { email: data.email },
  });
  if (existing) {
    throw new Error("Este email ja possui um convite. Faca login.");
  }

  // Check if already requested
  const existingRequest = await prisma.accessRequest.findFirst({
    where: { email: data.email, status: "pending" },
  });
  if (existingRequest) {
    throw new Error("Voce ja enviou uma solicitacao. Aguarde a aprovacao.");
  }

  return prisma.accessRequest.create({ data });
}
