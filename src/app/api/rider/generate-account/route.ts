import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "RIDER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!PAYSTACK_SECRET_KEY) {
      return NextResponse.json({ error: "Payment gateway not configured." }, { status: 500 });
    }

    const rider = await prisma.user.findUnique({
      where: { email: session.user.email as string },
    });

    if (!rider) return NextResponse.json({ error: "Rider not found" }, { status: 404 });
    if (rider.virtualAccountNo) return NextResponse.json({ error: "Account already exists" }, { status: 400 });

    let customerCode = rider.paystackCustomerCode;

    // 1. If no Paystack Customer exists, create one
    if (!customerCode) {
      const customerRes = await fetch("https://api.paystack.co/customer", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: rider.email,
          first_name: rider.firstName,
          last_name: rider.lastName,
          phone: rider.phoneNumber,
        }),
      });

      const customerData = await customerRes.json();
      if (!customerData.status) {
        throw new Error(customerData.message || "Failed to create Paystack customer");
      }
      customerCode = customerData.data.customer_code;
    }

    // 2. Generate the Dedicated Virtual Account (DVA)
    const dvaRes = await fetch("https://api.paystack.co/dedicated_account", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customer: customerCode,
        preferred_bank: "wema-bank", // You can change to titan-bank if preferred
      }),
    });

    const dvaData = await dvaRes.json();
    if (!dvaData.status) {
      throw new Error(dvaData.message || "Failed to generate dedicated account");
    }

    // 3. Save to database
    const virtualBankName = dvaData.data.bank.name;
    const virtualAccountNo = dvaData.data.account_number;
    const virtualAccountName = dvaData.data.account_name;

    await prisma.user.update({
      where: { id: rider.id },
      data: {
        paystackCustomerCode: customerCode,
        virtualBankName,
        virtualAccountNo,
        virtualAccountName,
      },
    });

    return NextResponse.json({ 
      message: "Virtual Account Generated", 
      account: { virtualBankName, virtualAccountNo, virtualAccountName } 
    }, { status: 200 });

  } catch (error: any) {
    console.error("Paystack DVA Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate account" }, { status: 500 });
  }
}
