import { verifyAndAuthorize, createSessionCookie } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();
    if (!idToken || typeof idToken !== "string") {
      return NextResponse.json({ error: "Token invalido" }, { status: 400 });
    }

    // Verify token AND check invitation
    await verifyAndAuthorize(idToken);

    // If authorized, create session cookie
    const sessionCookie = await createSessionCookie(idToken);
    const response = NextResponse.json({ status: "ok" });
    response.cookies.set("session", sessionCookie, {
      maxAge: 60 * 60 * 24 * 5, // 5 days
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });
    return response;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "NOT_INVITED") {
        return NextResponse.json(
          { error: "Acesso nao autorizado. Voce precisa de um convite para usar a plataforma." },
          { status: 403 }
        );
      }
      if (error.message === "NO_EMAIL") {
        return NextResponse.json(
          { error: "Conta sem email associado." },
          { status: 400 }
        );
      }
    }
    console.error("Session creation error:", error);
    return NextResponse.json({ error: "Falha na autenticacao" }, { status: 401 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ status: "ok" });
  response.cookies.set("session", "", {
    maxAge: 0,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
  return response;
}
