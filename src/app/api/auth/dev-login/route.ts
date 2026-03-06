import { DEV_MODE, DEV_USER_UID } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST() {
  if (!DEV_MODE) {
    return NextResponse.json({ error: "Not available in production" }, { status: 404 });
  }

  const response = NextResponse.json({ status: "ok", uid: DEV_USER_UID });
  response.cookies.set("session", DEV_USER_UID, {
    maxAge: 60 * 60 * 24 * 5,
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
  });
  return response;
}
