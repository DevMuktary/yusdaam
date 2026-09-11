import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { verifyPasswordResetOtp } from "@/lib/auth/password-reset";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, otp } = body;

    const result = await verifyPasswordResetOtp({
      email,
      role: Role.RIDER,
      otp
    });

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: result.status || 400 });
    }

    return NextResponse.json({ success: true, message: result.message });
  } catch (error: any) {
    console.error("Rider Verify OTP Error:", error);
    return NextResponse.json({ error: error?.message || "Failed to verify OTP." }, { status: 500 });
  }
}
