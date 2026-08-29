import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const fileUrl = searchParams.get("url");
    let filename = searchParams.get("filename") || "Yusdaam_Document.pdf";

    if (!fileUrl) {
      return NextResponse.json({ error: "Missing file URL" }, { status: 400 });
    }

    // Ensure filename ends with .pdf if applicable
    if (!filename.toLowerCase().endsWith(".pdf") && !filename.includes(".")) {
      filename = `${filename}.pdf`;
    }

    // Sanitize filename for safe HTTP header
    const safeFilename = filename.replace(/[^a-zA-Z0-9_\-\.]/g, "_");

    // Fetch the raw document from Cloudinary / external source
    const fileResponse = await fetch(fileUrl);
    if (!fileResponse.ok) {
      return NextResponse.json(
        { error: `Failed to fetch source document (${fileResponse.status})` },
        { status: fileResponse.status }
      );
    }

    const contentType = fileResponse.headers.get("content-type") || "application/pdf";
    const arrayBuffer = await fileResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Return the file with strict Attachment disposition headers to force phone/browser download
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${safeFilename}"; filename*=UTF-8''${encodeURIComponent(safeFilename)}`,
        "Content-Length": buffer.length.toString(),
        "Cache-Control": "public, max-age=3600, must-revalidate",
      },
    });
  } catch (error: any) {
    console.error("Document Proxy Download Error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to download document" },
      { status: 500 }
    );
  }
}
