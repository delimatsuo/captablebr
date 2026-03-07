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
    totalSharesOutstanding, strikePrice, grantDate, grantLabel,
    vestingStartDate, ...submissionFields
  } = data;

  const grantFields = {
    instrumentType, equityPercentage, vestingTotalMonths, cliffMonths,
    vestingSchedule, grantType, inputMode: inputMode ?? "percentage",
    numberOfShares, totalSharesOutstanding, strikePrice, grantDate,
    grantLabel, vestingStartDate,
  };

  // Denormalized fields kept on Submission for benchmark queries
  const grantDenormFields = {
    instrumentType, equityPercentage, vestingTotalMonths, cliffMonths,
    vestingSchedule, grantType, isFirstInRole,
  };

  return { submissionFields, grantFields, grantDenormFields, isFirstInRole };
}

function recalcSharesPercentage(data: { inputMode?: string; numberOfShares?: number; totalSharesOutstanding?: number; equityPercentage: number }) {
  if (data.inputMode === "shares" && data.numberOfShares && data.totalSharesOutstanding) {
    return (data.numberOfShares / data.totalSharesOutstanding) * 100;
  }
  return data.equityPercentage;
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
  const data = submissionSchema.parse(formData);

  // Server-side shares-to-% recalculation (never trust client math)
  data.equityPercentage = recalcSharesPercentage(data);

  const { submissionFields, grantFields, grantDenormFields, isFirstInRole } = splitFormData(data);

  return prisma.$transaction(async (tx) => {
    const existing = await tx.submission.findFirst({
      where: { userId: session.uid, status: "active" },
    });

    if (existing) {
      // In-place UPDATE (RA-3) — keeps the same ID, grant stays linked
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
      // Upsert the grant (create if missing, update if exists)
      await tx.grant.upsert({
        where: { submissionId: existing.id },
        create: { submissionId: existing.id, ...grantFields },
        update: { ...grantFields },
      });
      return tx.submission.findUnique({ where: { id: existing.id }, include: { grant: true } });
    } else {
      // First submission — create with nested grant
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
  const data = submissionSchema.parse(extractedData);

  // Server-side shares-to-% recalculation
  data.equityPercentage = recalcSharesPercentage(data);

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

// --- Access Requests ---

export async function submitAccessRequest(formData: unknown) {
  const data = accessRequestSchema.parse(formData);

  // Check if already invited
  const existing = await prisma.invitation.findUnique({
    where: { email: data.email },
  });
  if (existing) {
    throw new Error("Este email já possui um convite. Faça login.");
  }

  // Check if already requested
  const existingRequest = await prisma.accessRequest.findFirst({
    where: { email: data.email, status: "pending" },
  });
  if (existingRequest) {
    throw new Error("Você já enviou uma solicitação. Aguarde a aprovação.");
  }

  return prisma.accessRequest.create({ data });
}
