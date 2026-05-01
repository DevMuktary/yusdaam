import { NextResponse } from "next/server";

export async function GET() {
  try {
    const paystackRes = await fetch("https://api.paystack.co/bank?country=nigeria", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
      // Revalidate every 24 hours since bank lists rarely change
      next: { revalidate: 86400 } 
    });

    const data = await paystackRes.json();

    if (!data.status) {
      return NextResponse.json({ error: "Failed to load banks from Paystack" }, { status: 400 });
    }

    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    console.error("Bank Fetch Error:", error);
    return NextResponse.json({ error: "Internal server error fetching banks" }, { status: 500 });
  }
}
