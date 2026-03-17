import { NextResponse } from "next/server";
import { getUsdBrlRate } from "@/lib/fx";
import { verifySession } from "@/lib/auth";

export async function GET() {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rate = await getUsdBrlRate();

  if (rate == null) {
    return NextResponse.json(
      { error: "FX rate unavailable" },
      { status: 503 }
    );
  }

  return NextResponse.json(
    { rate, currency: "BRL", base: "USD" },
    {
      headers: {
        "Cache-Control": "public, max-age=3600",
      },
    }
  );
}
