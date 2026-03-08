import { NextResponse } from "next/server";
import { getUsdBrlRate } from "@/lib/fx";

export async function GET() {
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
