import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendSms } from "@/lib/sms/termii";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();
    const { to, message } = body;

    if (!to || !message) {
      return NextResponse.json({ error: "Destination number and message body are required" }, { status: 400 });
    }

    // Call the Termii utility
    const result = await sendSms({ to, message });

    if (!result.success) {
      return NextResponse.json({ error: result.error || "Failed to dispatch SMS" }, { status: 500 });
    }

    return NextResponse.json({ success: true, messageId: result.messageId }, { status: 200 });

  } catch (error: any) {
    console.error("Admin Messaging API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
