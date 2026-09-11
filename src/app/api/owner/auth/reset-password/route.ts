import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { completePasswordReset } from "@/lib/auth/password-reset";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, otp, newPassword } = body;

    const result = await completePasswordReset({
      email,
      role: Role.ASSET_OWNER,
      otp,
      newPassword
    });

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: result.status || 400 });
    }

    return NextResponse.json({ success: true, message: result.message });
  } catch (error: any) {
    console.error("Owner Reset Password Error:", error);
    return NextResponse.json({ error: error?.message || "Failed to update password." }, { status: 500 });
  }
}
