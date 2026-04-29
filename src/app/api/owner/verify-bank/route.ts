import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { accountNumber, bankCode } = await req.json();

    if (!accountNumber || !bankCode) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const paystackRes = await fetch(
      `https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const data = await paystackRes.json();

    if (!data.status) {
      return NextResponse.json({ error: "Invalid Account Number or Bank" }, { status: 400 });
    }

    return NextResponse.json({ accountName: data.data.account_name }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: "Failed to verify bank" }, { status: 500 });
  }
}
