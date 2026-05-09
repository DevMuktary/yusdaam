import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    // 1. Ensure only Admins can trigger this API
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { nin } = await req.json();

    if (!nin) {
      return NextResponse.json({ error: "NIN is required" }, { status: 400 });
    }

    // 2. Call Robosttech API securely
    const response = await fetch("https://robosttech.com/api/nin_verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.ROBOSTTECH_API_KEY || "", // Add this to your Railway variables!
      },
      body: JSON.stringify({ nin: nin.trim() }),
    });

    const data = await response.json();

    if (!data.success) {
      return NextResponse.json({ error: data.message || "Verification failed" }, { status: 400 });
    }

    return NextResponse.json(data.data);
  } catch (error) {
    console.error("NIN Verification Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
