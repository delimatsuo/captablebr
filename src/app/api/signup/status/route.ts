import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Rate limit: 30 polls per minute per IP
const pollLimitMap = new Map<string, { count: number; resetAt: number }>();

function isPollLimited(ip: string): boolean {
  const now = Date.now();
  const entry = pollLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    pollLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  entry.count++;
  return entry.count > 30;
}

export async function GET(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const ips = forwardedFor?.split(",").map(s => s.trim()) || [];
  const ip = ips[ips.length - 1] || "unknown";
  if (isPollLimited(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Token obrigatório" }, { status: 400 });
  }

  const accessRequest = await prisma.accessRequest.findUnique({
    where: { requestToken: token },
    select: { status: true, verificationResult: true },
  });

  if (!accessRequest) {
    // Don't reveal whether token exists
    return NextResponse.json({ status: "processing" });
  }

  // Map internal status to safe external status (never reveal "rejected")
  let publicStatus: string;
  if (accessRequest.status === "approved") {
    publicStatus = "approved";
  } else if (accessRequest.status === "pending") {
    publicStatus = accessRequest.verificationResult ? "pending_review" : "processing";
  } else {
    // rejected — don't reveal
    publicStatus = "pending_review";
  }

  return NextResponse.json({ status: publicStatus });
}
