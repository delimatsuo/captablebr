"use server";

import { prisma } from "./db";
import { verifySession } from "./auth";
import { submissionSchema, accessRequestSchema } from "./validations";
import { redirect } from "next/navigation";

async function requireAuth() {
  const session = await verifySession();
  if (!session) redirect("/login");
  return session;
}

function splitFormData(data: ReturnType<typeof submissionSchema.parse>) {
  const {
    instrumentType, equityPercentage, vestingTotalMonths, cliffMonths,
    vestingSchedule, grantType, isFirstInRole, inputMode, numberOfShares,
    totalSharesOutstanding, strikePrice, currentSharePrice, lastValuation,
    grantDate, grantLabel, vestingStartDate, ...submissionFields
  } = data;

  const grantFields = {
    instrumentType, equityPercentage, vestingTotalMonths, cliffMonths,
    vestingSchedule, grantType, inputMode: inputMode ?? "percentage",
    numberOfShares, totalSharesOutstanding, strikePrice,
    currentSharePrice, lastValuation,
    grantDate, grantLabel, vestingStartDate,
  };

  // Denormalized fields kept on Submission for benchmark queries
  const grantDenormFields = {
    instrumentType, equityPercentage, vestingTotalMonths, cliffMonths,
    vestingSchedule, grantType, isFirstInRole,
  };

  return { submissionFields, grantFields, grantDenormFields, isFirstInRole };
}

/**
 * Compute equity percentage from available data:
 * 1. shares + total outstanding → direct computation
 * 2. shares + lastValuation + currentSharePrice → derive total, then compute
 * 3. explicit equityPercentage (from percentage mode or manual entry)
 */
function computeEquityPercentage(data: {
  inputMode?: string;
  numberOfShares?: number;
  totalSharesOutstanding?: number;
  currentSharePrice?: number;
  lastValuation?: number;
  equityPercentage?: number;
}): number | undefined {
  if (data.inputMode === "shares" && data.numberOfShares) {
    // Path 1: shares + total outstanding
    if (data.totalSharesOutstanding && data.totalSharesOutstanding > 0) {
      const pct = (data.numberOfShares / data.totalSharesOutstanding) * 100;
      return pct >= 0.001 && pct <= 30 ? pct : undefined;
    }
    // Path 2: shares + valuation + share price → derive total outstanding
    if (data.lastValuation && data.currentSharePrice && data.currentSharePrice > 0) {
      const derivedTotal = data.lastValuation / data.currentSharePrice;
      const pct = (data.numberOfShares / derivedTotal) * 100;
      return pct >= 0.001 && pct <= 30 ? pct : undefined;
    }
  }
  // Path 3: explicit percentage
  const pct = data.equityPercentage;
  if (pct != null && (pct < 0.001 || pct > 30)) return undefined;
  return pct;
}

// --- Submissions ---

export async function getSubmission() {
  const session = await requireAuth();
  return prisma.submission.findFirst({
    where: { userId: session.uid, status: "active" },
    orderBy: { createdAt: "desc" },
    include: { grant: true },
  });
}

export async function getSubmissions() {
  const session = await requireAuth();
  return prisma.submission.findMany({
    where: { userId: session.uid },
    orderBy: { createdAt: "desc" },
    include: { grant: true },
  });
}

export async function upsertSubmission(formData: unknown) {
  const session = await requireAuth();

  // Pre-compute equityPercentage from shares before validation
  const raw = formData as Record<string, unknown>;
  if (raw?.inputMode === "shares" && raw?.numberOfShares) {
    const computed = computeEquityPercentage({
      inputMode: "shares",
      numberOfShares: Number(raw.numberOfShares),
      totalSharesOutstanding: raw.totalSharesOutstanding ? Number(raw.totalSharesOutstanding) : undefined,
      currentSharePrice: raw.currentSharePrice ? Number(raw.currentSharePrice) : undefined,
      lastValuation: raw.lastValuation ? Number(raw.lastValuation) : undefined,
      equityPercentage: raw.equityPercentage ? Number(raw.equityPercentage) : undefined,
    });
    if (computed != null) {
      raw.equityPercentage = computed;
    }
  }

  const data = submissionSchema.parse(raw);

  // Server-side recomputation (never trust client math)
  const computed = computeEquityPercentage(data);
  if (computed != null) {
    data.equityPercentage = computed;
  }

  const { submissionFields, grantFields, grantDenormFields, isFirstInRole } = splitFormData(data);

  return prisma.$transaction(async (tx) => {
    const existing = await tx.submission.findFirst({
      where: { userId: session.uid, status: "active" },
    });

    if (existing) {
      await tx.submission.update({
        where: { id: existing.id },
        data: {
          ...submissionFields,
          ...grantDenormFields,
          isFirstInRole,
          notifyEmail: submissionFields.notifyEmail || null,
          confirmedByUser: true,
        },
      });
      await tx.grant.upsert({
        where: { submissionId: existing.id },
        create: { submissionId: existing.id, ...grantFields },
        update: { ...grantFields },
      });
      return tx.submission.findUnique({ where: { id: existing.id }, include: { grant: true } });
    } else {
      return tx.submission.create({
        data: {
          ...submissionFields,
          ...grantDenormFields,
          isFirstInRole,
          notifyEmail: submissionFields.notifyEmail || null,
          userId: session.uid,
          confirmedByUser: true,
          grant: { create: grantFields },
        },
        include: { grant: true },
      });
    }
  });
}

export async function upsertSubmissionFromAi(
  extractedData: unknown,
  sourceDocumentUrl?: string
) {
  const session = await requireAuth();

  const raw = extractedData as Record<string, unknown>;
  if (raw?.inputMode === "shares" && raw?.numberOfShares) {
    const computed = computeEquityPercentage({
      inputMode: "shares",
      numberOfShares: Number(raw.numberOfShares),
      totalSharesOutstanding: raw.totalSharesOutstanding ? Number(raw.totalSharesOutstanding) : undefined,
      currentSharePrice: raw.currentSharePrice ? Number(raw.currentSharePrice) : undefined,
      lastValuation: raw.lastValuation ? Number(raw.lastValuation) : undefined,
      equityPercentage: raw.equityPercentage ? Number(raw.equityPercentage) : undefined,
    });
    if (computed != null) {
      raw.equityPercentage = computed;
    }
  }

  const data = submissionSchema.parse(raw);

  const computed = computeEquityPercentage(data);
  if (computed != null) {
    data.equityPercentage = computed;
  }

  const { submissionFields, grantFields, grantDenormFields, isFirstInRole } = splitFormData(data);

  return prisma.$transaction(async (tx) => {
    const existing = await tx.submission.findFirst({
      where: { userId: session.uid, status: "active" },
    });

    if (existing) {
      await tx.submission.update({
        where: { id: existing.id },
        data: {
          ...submissionFields,
          ...grantDenormFields,
          isFirstInRole,
          notifyEmail: submissionFields.notifyEmail || null,
          sourceDocumentUrl,
          extractedByAi: true,
          confirmedByUser: false,
        },
      });
      await tx.grant.upsert({
        where: { submissionId: existing.id },
        create: { submissionId: existing.id, ...grantFields },
        update: { ...grantFields },
      });
      return tx.submission.findUnique({ where: { id: existing.id }, include: { grant: true } });
    } else {
      return tx.submission.create({
        data: {
          ...submissionFields,
          ...grantDenormFields,
          isFirstInRole,
          notifyEmail: submissionFields.notifyEmail || null,
          userId: session.uid,
          sourceDocumentUrl,
          extractedByAi: true,
          confirmedByUser: false,
          grant: { create: grantFields },
        },
        include: { grant: true },
      });
    }
  });
}

export async function deleteSubmission(submissionId: string) {
  const session = await requireAuth();

  const { count } = await prisma.submission.deleteMany({
    where: { id: submissionId, userId: session.uid },
  });
  if (count === 0) throw new Error("Registro não encontrado.");
}

export async function hasSubmission(): Promise<boolean> {
  const session = await verifySession();
  if (!session) return false;
  const count = await prisma.submission.count({
    where: { userId: session.uid, status: "active", confirmedByUser: true },
  });
  return count > 0;
}

// --- LGPD Data Deletion ---

export async function deleteMyData() {
  const session = await requireAuth();
  // Grants cascade via onDelete: Cascade on the Grant model
  await prisma.submission.deleteMany({ where: { userId: session.uid } });
}

// --- Access Requests ---

export async function submitAccessRequest(formData: unknown) {
  const data = accessRequestSchema.parse(formData);

  const existing = await prisma.invitation.findUnique({
    where: { email: data.email },
  });
  if (existing) {
    throw new Error("Este email já possui um convite. Faça login.");
  }

  const existingRequest = await prisma.accessRequest.findFirst({
    where: { email: data.email, status: "pending" },
  });
  if (existingRequest) {
    throw new Error("Você já enviou uma solicitação. Aguarde a aprovação.");
  }

  return prisma.accessRequest.create({ data });
}
