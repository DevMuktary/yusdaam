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

    // Check if the network request failed OR if Paystack explicitly returned status: false
    if (!paystackRes.ok || !data.status) {
      // Log the exact Paystack error to your server terminal for debugging
      console.error("Paystack API Rejection:", data);
      
      // Pass Paystack's specific error message to the browser
      return NextResponse.json(
        { error: data.message || "Failed to load banks from Paystack" }, 
        { status: paystackRes.status === 200 ? 400 : paystackRes.status }
      );
    }

    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    console.error("Bank Fetch Error:", error);
    return NextResponse.json(
      { error: "Internal server error fetching banks" }, 
      { status: 500 }
    );
  }
}
