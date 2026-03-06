import { NextRequest, NextResponse } from "next/server";
import { submitAccessRequest } from "@/lib/actions";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    await submitAccessRequest(body);
    return NextResponse.json({ status: "ok" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao enviar solicitacao";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
