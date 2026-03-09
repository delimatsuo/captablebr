"use server";

import { prisma } from "./db";
import { verifySession } from "./auth";
import {
  submissionSchema,
  submissionWithGrantsSchema,
  grantSchema,
  accessRequestSchema,
} from "./validations";
import { getUsdBrlRate } from "./fx";
import { redirect } from "next/navigation";

/**
 * Fetch FX rate data for a submission based on currency.
 * Must be called BEFORE any Prisma transaction.
 * Returns { fxRateUsed, fxRateDate } or nulls for graceful degradation.
 */
async function getFxDataForSubmission(currency?: string): Promise<{
  fxRateUsed: number | null;
  fxRateDate: Date | null;
}> {
  if (!currency || currency === "USD") {
    return { fxRateUsed: 1.0, fxRateDate: new Date() };
  }
  // BRL or other non-USD currency
  const rate = await getUsdBrlRate();
  return {
    fxRateUsed: rate,
    fxRateDate: rate != null ? new Date() : null,
  };
}

async function requireAuth() {
  const session = await verifySession();
  if (!session) redirect("/login");
  return session;
}

/**
 * Compute equity percentage from available data:
 * 1. shares + total outstanding -> direct computation
 * 2. shares + lastValuation + currentSharePrice -> derive total, then compute
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
    if (data.totalSharesOutstanding && data.totalSharesOutstanding > 0) {
      const pct = (data.numberOfShares / data.totalSharesOutstanding) * 100;
      return pct >= 0.001 && pct <= 30 ? pct : undefined;
    }
    if (data.lastValuation && data.currentSharePrice && data.currentSharePrice > 0) {
      const derivedTotal = data.lastValuation / data.currentSharePrice;
      const pct = (data.numberOfShares / derivedTotal) * 100;
      return pct >= 0.001 && pct <= 30 ? pct : undefined;
    }
  }
  const pct = data.equityPercentage;
  if (pct != null && (pct < 0.001 || pct > 30)) return undefined;
  return pct;
}

/**
 * Compute aggregate equity across all grants.
 * Sum all non-NULL equityPercentage values. Returns NULL if ALL grants have NULL equity.
 */
function computeAggregateEquity(
  grants: Array<{ equityPercentage?: number | null }>
): number | undefined {
  const values = grants
    .map((g) => g.equityPercentage)
    .filter((v): v is number => v != null);
  if (values.length === 0) return undefined;
  return values.reduce((sum, v) => sum + v, 0);
}

function splitFlatFormData(data: ReturnType<typeof submissionSchema.parse>) {
  const {
    instrumentType, equityPercentage, vestingTotalMonths, cliffMonths,
    vestingSchedule, grantType, isFirstInRole, inputMode, numberOfShares,
    totalSharesOutstanding, strikePrice, strikeCurrency, currentSharePrice, lastValuation,
    grantDate, grantLabel, vestingStartDate, ...submissionFields
  } = data;

  const grantFields = {
    instrumentType, equityPercentage, vestingTotalMonths, cliffMonths,
    vestingSchedule, grantType, isFirstInRole,
    inputMode: inputMode ?? "percentage",
    numberOfShares, totalSharesOutstanding, strikePrice, strikeCurrency,
    currentSharePrice, lastValuation,
    grantDate, grantLabel, vestingStartDate,
  };

  const grantDenormFields = {
    instrumentType, equityPercentage, vestingTotalMonths, cliffMonths,
    vestingSchedule, grantType, isFirstInRole,
  };

  return { submissionFields, grantFields, grantDenormFields };
}

// --- Submissions ---

export async function getSubmission() {
  const session = await requireAuth();
  return prisma.submission.findUnique({
    where: { userId: session.uid },
    include: { grants: { orderBy: { createdAt: "asc" } } },
  });
}

export async function upsertSubmissionWithGrants(
  formData: unknown,
  opts?: { sourceDocumentUrl?: string; extractedByAi?: boolean }
) {
  const session = await requireAuth();

  const raw = formData as Record<string, unknown>;
  // Pre-compute equityPercentage for each grant
  if (Array.isArray(raw?.grants)) {
    for (const grant of raw.grants as Record<string, unknown>[]) {
      if (grant?.inputMode === "shares" && grant?.numberOfShares) {
        const computed = computeEquityPercentage({
          inputMode: "shares",
          numberOfShares: Number(grant.numberOfShares),
          totalSharesOutstanding: grant.totalSharesOutstanding ? Number(grant.totalSharesOutstanding) : undefined,
          currentSharePrice: grant.currentSharePrice ? Number(grant.currentSharePrice) : undefined,
          lastValuation: grant.lastValuation ? Number(grant.lastValuation) : undefined,
          equityPercentage: grant.equityPercentage ? Number(grant.equityPercentage) : undefined,
        });
        if (computed != null) {
          grant.equityPercentage = computed;
        }
      }
    }
  }

  let data;
  try {
    data = submissionWithGrantsSchema.parse(raw);
  } catch (parseErr) {
    console.error("[upsertSubmissionWithGrants] Validation error:", parseErr);
    if (parseErr && typeof parseErr === "object" && "issues" in parseErr) {
      const issues = (parseErr as { issues: { message: string; path: (string | number)[] }[] }).issues;
      const msg = issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
      throw new Error(`Dados inválidos: ${msg}`);
    }
    throw new Error("Dados inválidos");
  }

  // Server-side recomputation per grant
  for (const grant of data.grants) {
    const computed = computeEquityPercentage(grant);
    if (computed != null) {
      grant.equityPercentage = computed;
    }
  }

  const aggregateEquity = computeAggregateEquity(data.grants);
  const primaryGrant = data.grants[0];

  const { grants: grantsData, ...submissionFields } = data;

  // Fetch FX rate BEFORE transaction (never inside it)
  const { fxRateUsed, fxRateDate } = await getFxDataForSubmission(submissionFields.currency);

  try {
    return await prisma.$transaction(async (tx) => {
      const submission = await tx.submission.upsert({
        where: { userId: session.uid },
        create: {
          userId: session.uid,
          ...submissionFields,
          notifyEmail: submissionFields.notifyEmail || null,
          fxRateUsed,
          fxRateDate,
          confirmedByUser: true,
          ...(opts?.sourceDocumentUrl != null && { sourceDocumentUrl: opts.sourceDocumentUrl }),
          ...(opts?.extractedByAi != null && { extractedByAi: opts.extractedByAi }),
          // Denormalized from primary grant
          instrumentType: primaryGrant.instrumentType,
          equityPercentage: aggregateEquity,
          vestingTotalMonths: primaryGrant.vestingTotalMonths,
          cliffMonths: primaryGrant.cliffMonths,
          vestingSchedule: primaryGrant.vestingSchedule,
          grantType: primaryGrant.grantType,
          isFirstInRole: primaryGrant.isFirstInRole,
        },
        update: {
          ...submissionFields,
          notifyEmail: submissionFields.notifyEmail || null,
          fxRateUsed,
          fxRateDate,
          confirmedByUser: true,
          ...(opts?.sourceDocumentUrl != null && { sourceDocumentUrl: opts.sourceDocumentUrl }),
          ...(opts?.extractedByAi != null && { extractedByAi: opts.extractedByAi }),
          // Denormalized from primary grant
          instrumentType: primaryGrant.instrumentType,
          equityPercentage: aggregateEquity,
          vestingTotalMonths: primaryGrant.vestingTotalMonths,
          cliffMonths: primaryGrant.cliffMonths,
          vestingSchedule: primaryGrant.vestingSchedule,
          grantType: primaryGrant.grantType,
          isFirstInRole: primaryGrant.isFirstInRole,
        },
      });

      // Sync grants: update existing, create new, delete removed
      const existingGrants = await tx.grant.findMany({
        where: { submissionId: submission.id },
      });
      const existingIds = new Set(existingGrants.map((g) => g.id));
      const incomingIds = new Set<string>();

      for (const grant of grantsData) {
        const { id: grantId, ...grantFields } = grant;
        if (grantId && existingIds.has(grantId)) {
          // Update existing grant
          await tx.grant.update({
            where: { id: grantId },
            data: grantFields,
          });
          incomingIds.add(grantId);
        } else {
          // Create new grant
          await tx.grant.create({
            data: { submissionId: submission.id, ...grantFields },
          });
        }
      }

      // Delete grants not in incoming list
      const toDelete = [...existingIds].filter((id) => !incomingIds.has(id));
      if (toDelete.length > 0) {
        await tx.grant.deleteMany({
          where: { id: { in: toDelete } },
        });
      }

      return tx.submission.findUnique({
        where: { id: submission.id },
        include: { grants: { orderBy: { createdAt: "asc" } } },
      });
    });
  } catch (txErr) {
    console.error("[upsertSubmissionWithGrants] Transaction error:", txErr);
    throw new Error(
      txErr instanceof Error ? txErr.message : "Erro ao salvar no banco de dados"
    );
  }
}

export async function upsertSubmission(formData: unknown) {
  const session = await requireAuth();

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

  const computed = computeEquityPercentage(data);
  if (computed != null) {
    data.equityPercentage = computed;
  }

  const { submissionFields, grantFields, grantDenormFields } = splitFlatFormData(data);

  // Fetch FX rate BEFORE transaction
  const { fxRateUsed, fxRateDate } = await getFxDataForSubmission(submissionFields.currency);

  return prisma.$transaction(async (tx) => {
    const existing = await tx.submission.findUnique({
      where: { userId: session.uid },
    });

    if (existing) {
      await tx.submission.update({
        where: { id: existing.id },
        data: {
          ...submissionFields,
          ...grantDenormFields,
          notifyEmail: submissionFields.notifyEmail || null,
          fxRateUsed,
          fxRateDate,
          confirmedByUser: true,
        },
      });
      // Upsert the first grant (or create if none exist)
      const existingGrant = await tx.grant.findFirst({
        where: { submissionId: existing.id },
        orderBy: { createdAt: "asc" },
      });
      if (existingGrant) {
        await tx.grant.update({
          where: { id: existingGrant.id },
          data: grantFields,
        });
      } else {
        await tx.grant.create({
          data: { submissionId: existing.id, ...grantFields },
        });
      }
      return tx.submission.findUnique({ where: { id: existing.id }, include: { grants: { orderBy: { createdAt: "asc" } } } });
    } else {
      return tx.submission.create({
        data: {
          ...submissionFields,
          ...grantDenormFields,
          notifyEmail: submissionFields.notifyEmail || null,
          userId: session.uid,
          fxRateUsed,
          fxRateDate,
          confirmedByUser: true,
          grants: { create: grantFields },
        },
        include: { grants: { orderBy: { createdAt: "asc" } } },
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

  const { submissionFields, grantFields, grantDenormFields } = splitFlatFormData(data);

  // Fetch FX rate BEFORE transaction
  const { fxRateUsed, fxRateDate } = await getFxDataForSubmission(submissionFields.currency);

  return prisma.$transaction(async (tx) => {
    const existing = await tx.submission.findUnique({
      where: { userId: session.uid },
    });

    if (existing) {
      await tx.submission.update({
        where: { id: existing.id },
        data: {
          ...submissionFields,
          ...grantDenormFields,
          notifyEmail: submissionFields.notifyEmail || null,
          fxRateUsed,
          fxRateDate,
          sourceDocumentUrl,
          extractedByAi: true,
          confirmedByUser: false,
        },
      });
      const existingGrant = await tx.grant.findFirst({
        where: { submissionId: existing.id },
        orderBy: { createdAt: "asc" },
      });
      if (existingGrant) {
        await tx.grant.update({
          where: { id: existingGrant.id },
          data: grantFields,
        });
      } else {
        await tx.grant.create({
          data: { submissionId: existing.id, ...grantFields },
        });
      }
      return tx.submission.findUnique({ where: { id: existing.id }, include: { grants: { orderBy: { createdAt: "asc" } } } });
    } else {
      return tx.submission.create({
        data: {
          ...submissionFields,
          ...grantDenormFields,
          notifyEmail: submissionFields.notifyEmail || null,
          userId: session.uid,
          fxRateUsed,
          fxRateDate,
          sourceDocumentUrl,
          extractedByAi: true,
          confirmedByUser: false,
          grants: { create: grantFields },
        },
        include: { grants: { orderBy: { createdAt: "asc" } } },
      });
    }
  });
}

export async function addGrant(grantData: unknown) {
  const session = await requireAuth();

  const submission = await prisma.submission.findUnique({
    where: { userId: session.uid },
    include: { grants: true },
  });
  if (!submission) throw new Error("Nenhuma submissão encontrada. Envie sua compensação primeiro.");

  const raw = grantData as Record<string, unknown>;
  if (raw?.inputMode === "shares" && raw?.numberOfShares) {
    const computed = computeEquityPercentage({
      inputMode: "shares",
      numberOfShares: Number(raw.numberOfShares),
      totalSharesOutstanding: raw.totalSharesOutstanding ? Number(raw.totalSharesOutstanding) : undefined,
      currentSharePrice: raw.currentSharePrice ? Number(raw.currentSharePrice) : undefined,
      lastValuation: raw.lastValuation ? Number(raw.lastValuation) : undefined,
    });
    if (computed != null) {
      raw.equityPercentage = computed;
    }
  }

  const data = grantSchema.parse(raw);
  const computed = computeEquityPercentage(data);
  if (computed != null) {
    data.equityPercentage = computed;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id: _grantId, ...grantFields } = data;

  return prisma.$transaction(async (tx) => {
    const grant = await tx.grant.create({
      data: { submissionId: submission.id, ...grantFields },
    });

    // Recompute aggregate equity
    const allGrants = await tx.grant.findMany({
      where: { submissionId: submission.id },
    });
    const aggregateEquity = computeAggregateEquity(
      allGrants.map((g) => ({ equityPercentage: g.equityPercentage ? Number(g.equityPercentage) : null }))
    );
    await tx.submission.update({
      where: { id: submission.id },
      data: { equityPercentage: aggregateEquity ?? null },
    });

    return grant;
  });
}

export async function updateGrant(grantId: string, grantData: unknown) {
  const session = await requireAuth();

  const grant = await prisma.grant.findUnique({
    where: { id: grantId },
    include: { submission: true },
  });
  if (!grant || grant.submission.userId !== session.uid) {
    throw new Error("Grant não encontrado.");
  }

  const raw = grantData as Record<string, unknown>;
  if (raw?.inputMode === "shares" && raw?.numberOfShares) {
    const computed = computeEquityPercentage({
      inputMode: "shares",
      numberOfShares: Number(raw.numberOfShares),
      totalSharesOutstanding: raw.totalSharesOutstanding ? Number(raw.totalSharesOutstanding) : undefined,
      currentSharePrice: raw.currentSharePrice ? Number(raw.currentSharePrice) : undefined,
      lastValuation: raw.lastValuation ? Number(raw.lastValuation) : undefined,
    });
    if (computed != null) {
      raw.equityPercentage = computed;
    }
  }

  const data = grantSchema.parse(raw);
  const computed = computeEquityPercentage(data);
  if (computed != null) {
    data.equityPercentage = computed;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id: _grantId, ...grantFields } = data;

  return prisma.$transaction(async (tx) => {
    const updated = await tx.grant.update({
      where: { id: grantId },
      data: grantFields,
    });

    // Recompute aggregate equity
    const allGrants = await tx.grant.findMany({
      where: { submissionId: grant.submissionId },
    });
    const aggregateEquity = computeAggregateEquity(
      allGrants.map((g) => ({ equityPercentage: g.equityPercentage ? Number(g.equityPercentage) : null }))
    );

    // Update denormalized fields from primary grant (first by createdAt)
    const primaryGrant = allGrants.sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
    )[0];
    await tx.submission.update({
      where: { id: grant.submissionId },
      data: {
        equityPercentage: aggregateEquity ?? null,
        instrumentType: primaryGrant.instrumentType,
        vestingTotalMonths: primaryGrant.vestingTotalMonths,
        cliffMonths: primaryGrant.cliffMonths,
        vestingSchedule: primaryGrant.vestingSchedule,
        grantType: primaryGrant.grantType,
        isFirstInRole: primaryGrant.isFirstInRole,
      },
    });

    return updated;
  });
}

export async function deleteGrant(grantId: string) {
  const session = await requireAuth();

  const grant = await prisma.grant.findUnique({
    where: { id: grantId },
    include: { submission: true },
  });
  if (!grant || grant.submission.userId !== session.uid) {
    throw new Error("Grant não encontrado.");
  }

  const grantCount = await prisma.grant.count({
    where: { submissionId: grant.submissionId },
  });
  if (grantCount <= 1) {
    throw new Error("Não é possível excluir o último grant. Cada submissão precisa de pelo menos um grant.");
  }

  return prisma.$transaction(async (tx) => {
    await tx.grant.delete({ where: { id: grantId } });

    // Recompute aggregate equity
    const allGrants = await tx.grant.findMany({
      where: { submissionId: grant.submissionId },
      orderBy: { createdAt: "asc" },
    });
    const aggregateEquity = computeAggregateEquity(
      allGrants.map((g) => ({ equityPercentage: g.equityPercentage ? Number(g.equityPercentage) : null }))
    );

    // Update denormalized fields from new primary grant
    const primaryGrant = allGrants[0];
    await tx.submission.update({
      where: { id: grant.submissionId },
      data: {
        equityPercentage: aggregateEquity ?? null,
        instrumentType: primaryGrant.instrumentType,
        vestingTotalMonths: primaryGrant.vestingTotalMonths,
        cliffMonths: primaryGrant.cliffMonths,
        vestingSchedule: primaryGrant.vestingSchedule,
        grantType: primaryGrant.grantType,
        isFirstInRole: primaryGrant.isFirstInRole,
      },
    });
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
    where: { userId: session.uid, confirmedByUser: true },
  });
  return count > 0;
}

// LGPD Data Deletion:
// - Deletes all Submissions + Grants (cascade) for the user
// - Deletes uploaded documents from GCS (best-effort)
// - Invitation records (email only) are RETAINED for access control (legitimate interest)
// - Access request records may contain name+email — retained for audit
export async function deleteMyData() {
  const session = await requireAuth();

  // Attempt GCS cleanup before DB deletion
  const submission = await prisma.submission.findUnique({
    where: { userId: session.uid },
    select: { sourceDocumentUrl: true },
  });

  if (submission?.sourceDocumentUrl) {
    try {
      const prefix = `uploads/${session.uid}/`;
      if (submission.sourceDocumentUrl.startsWith(prefix)) {
        const bucketName = process.env.GCS_BUCKET_NAME;
        if (bucketName) {
          const { Storage } = await import("@google-cloud/storage");
          const storage = new Storage();
          await storage.bucket(bucketName).deleteFiles({ prefix });
          console.log(`GCS cleanup: deleted files with prefix ${prefix}`);
        }
      }
    } catch (err) {
      console.error("GCS cleanup failed (proceeding with DB deletion):", err);
    }
  }

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
