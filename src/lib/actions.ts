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

// --- Submissions ---

export async function getSubmission() {
  const session = await requireAuth();
  return prisma.submission.findFirst({
    where: { userId: session.uid, status: "active" },
    orderBy: { createdAt: "desc" },
  });
}

export async function getSubmissions() {
  const session = await requireAuth();
  return prisma.submission.findMany({
    where: { userId: session.uid },
    orderBy: { createdAt: "desc" },
  });
}

export async function upsertSubmission(formData: unknown) {
  const session = await requireAuth();
  const data = submissionSchema.parse(formData);

  return prisma.$transaction(async (tx) => {
    await tx.submission.updateMany({
      where: { userId: session.uid, status: "active" },
      data: { status: "archived" },
    });

    return tx.submission.create({
      data: {
        ...data,
        notifyEmail: data.notifyEmail || null,
        userId: session.uid,
        confirmedByUser: true,
      },
    });
  });
}

export async function upsertSubmissionFromAi(
  extractedData: unknown,
  sourceDocumentUrl?: string
) {
  const session = await requireAuth();
  const data = submissionSchema.parse(extractedData);

  return prisma.$transaction(async (tx) => {
    await tx.submission.updateMany({
      where: { userId: session.uid, status: "active" },
      data: { status: "archived" },
    });

    return tx.submission.create({
      data: {
        ...data,
        notifyEmail: data.notifyEmail || null,
        userId: session.uid,
        sourceDocumentUrl,
        extractedByAi: true,
        confirmedByUser: false,
      },
    });
  });
}

export async function deleteSubmission(submissionId: string) {
  const session = await requireAuth();

  const { count } = await prisma.submission.deleteMany({
    where: { id: submissionId, userId: session.uid },
  });
  if (count === 0) throw new Error("Registro nao encontrado.");
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
