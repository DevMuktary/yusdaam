import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { requestPasswordReset } from "@/lib/auth/password-reset";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;

    const result = await requestPasswordReset({
      email,
      role: Role.ASSET_OWNER,
      roleTitle: "Asset Owner",
      portalName: "Asset Owner Administration Portal"
    });

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: result.status || 400 });
    }

    return NextResponse.json({ success: true, message: result.message });
  } catch (error: any) {
    console.error("Owner Forgot Password Error:", error);
    return NextResponse.json({ error: error?.message || "Failed to process password reset request." }, { status: 500 });
  }
}
