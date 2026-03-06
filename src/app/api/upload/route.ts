import { verifySession } from "@/lib/auth";
import { Storage } from "@google-cloud/storage";
import { NextRequest, NextResponse } from "next/server";

const ALLOWED_TYPES = ["application/pdf", "image/png", "image/jpeg", "image/webp"];
const SIGNED_URL_TTL = 15 * 60 * 1000; // 15 minutes

export async function POST(request: NextRequest) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }

  const { fileName, contentType } = await request.json();

  if (!ALLOWED_TYPES.includes(contentType)) {
    return NextResponse.json(
      { error: "Tipo de arquivo nao permitido. Use PDF, PNG, JPEG ou WebP." },
      { status: 400 }
    );
  }

  const bucketName = process.env.GCS_BUCKET_NAME;
  if (!bucketName) {
    return NextResponse.json({ error: "Storage nao configurado" }, { status: 500 });
  }

  const storage = new Storage();
  const bucket = storage.bucket(bucketName);
  const objectName = `uploads/${session.uid}/${Date.now()}-${fileName}`;
  const file = bucket.file(objectName);

  const [signedUrl] = await file.getSignedUrl({
    version: "v4",
    action: "write",
    expires: Date.now() + SIGNED_URL_TTL,
    contentType,
  });

  return NextResponse.json({ signedUrl, objectName });
}
