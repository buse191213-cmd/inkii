import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";

/**
 * Stellt signierte Upload-Tokens für den direkten Browser-Upload großer
 * Dateien (Hero-Video) zu Vercel Blob bereit. So wird das Größenlimit von
 * Server Actions umgangen. Nur eingeloggte Admins erhalten ein Token.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;
  try {
    const json = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        if (!(await isAuthenticated())) {
          throw new Error("Nicht autorisiert.");
        }
        return {
          allowedContentTypes: ["video/mp4", "video/webm"],
          maximumSizeInBytes: 100 * 1024 * 1024,
        };
      },
      onUploadCompleted: async () => {
        /* Die URL wird vom Browser per Server Action gespeichert. */
      },
    });
    return NextResponse.json(json);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Upload fehlgeschlagen." },
      { status: 400 }
    );
  }
}
