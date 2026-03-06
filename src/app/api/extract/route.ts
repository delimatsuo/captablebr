import { verifySession } from "@/lib/auth";
import { extractFromDocument } from "@/lib/gemini";
import { Storage } from "@google-cloud/storage";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }

  const { objectName, contentType } = await request.json();

  if (!objectName || typeof objectName !== "string") {
    return NextResponse.json({ error: "objectName obrigatorio" }, { status: 400 });
  }

  // Verify the file belongs to this user
  if (!objectName.startsWith(`uploads/${session.uid}/`)) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const bucketName = process.env.GCS_BUCKET_NAME;
  if (!bucketName) {
    return NextResponse.json({ error: "Storage nao configurado" }, { status: 500 });
  }

  try {
    const storage = new Storage();
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(objectName);
    const [content] = await file.download();

    const result = await extractFromDocument(content, contentType || "application/pdf");

    // Schedule file deletion (best-effort)
    file.delete().catch(() => {});

    return NextResponse.json(result);
  } catch (error) {
    console.error("Extraction error:", error);
    return NextResponse.json(
      { error: "Falha na extracao do documento" },
      { status: 500 }
    );
  }
}
