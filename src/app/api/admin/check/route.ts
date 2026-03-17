import { isAdmin } from "@/lib/admin";
import { verifySession } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = await isAdmin();
  return NextResponse.json({ isAdmin: admin });
}
