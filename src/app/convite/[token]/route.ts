import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const invitation = await prisma.invitation.findUnique({
    where: { inviteToken: token },
    select: { id: true, status: true },
  });

  if (!invitation) {
    // Token not found or already consumed (inviteToken is null after claiming)
    return NextResponse.redirect(new URL("/login?convite=invalido", request.url));
  }

  // Set httpOnly cookie so verifyAndAuthorize can read it at login time
  const response = NextResponse.redirect(new URL("/login?convite=1", request.url));
  response.cookies.set("invite_token", token, {
    maxAge: 60 * 60 * 24 * 7, // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  return response;
}
