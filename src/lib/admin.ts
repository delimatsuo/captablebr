"use server";

import { prisma } from "./db";
import { verifySession } from "./auth";
import { redirect } from "next/navigation";

// Your Firebase UID — only this user can access admin features.
// Set via env var or hardcode after first login.
const ADMIN_UID = process.env.ADMIN_UID || "dev-user-001";

async function requireAdmin() {
  const session = await verifySession();
  if (!session || session.uid !== ADMIN_UID) {
    redirect("/benchmarks");
  }
  return session;
}

export async function isAdmin(): Promise<boolean> {
  const session = await verifySession();
  return session?.uid === ADMIN_UID;
}

export async function getInvitations() {
  await requireAdmin();
  return prisma.invitation.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function createInvitation(email: string) {
  await requireAdmin();
  const normalized = email.toLowerCase().trim();

  const existing = await prisma.invitation.findUnique({
    where: { email: normalized },
  });
  if (existing) throw new Error("Email já convidado.");

  return prisma.invitation.create({
    data: { email: normalized },
  });
}

export async function deleteInvitation(id: string) {
  await requireAdmin();
  return prisma.invitation.delete({ where: { id } });
}

export async function getAccessRequests() {
  await requireAdmin();
  return prisma.accessRequest.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function approveAccessRequest(requestId: string) {
  await requireAdmin();

  const request = await prisma.accessRequest.findUnique({
    where: { id: requestId },
  });
  if (!request) throw new Error("Solicitação não encontrada.");

  // Create invitation for this email
  const normalized = request.email.toLowerCase().trim();
  await prisma.invitation.upsert({
    where: { email: normalized },
    create: { email: normalized, status: "pending" },
    update: {},
  });

  // Mark request as approved
  return prisma.accessRequest.update({
    where: { id: requestId },
    data: { status: "approved" },
  });
}

export async function rejectAccessRequest(requestId: string) {
  await requireAdmin();
  return prisma.accessRequest.update({
    where: { id: requestId },
    data: { status: "rejected" },
  });
}
