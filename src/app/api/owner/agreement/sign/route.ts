import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });

    const body = await req.json();
    const { signature, witnessName, witnessSignature, contractId } = body;
    
    if (!signature || !contractId) {
      return NextResponse.json({ error: "Signature and Contract ID are required" }, { status: 400 });
    }

    // 1. Update the specific Contract
    await prisma.contract.update({
      where: { id: contractId },
      data: { 
        isSigned: true,
        ownerSignatureUrl: signature,
        witnessName: witnessName,
        witnessSignatureUrl: witnessSignature
      },
    });

    // 2. Update the User (Unlock dashboard if pending, and save default witness for future)
    await prisma.user.update({
      where: { id: session.user.id },
      data: { 
        accountStatus: "ACTIVE", 
        signatureUrl: signature, // Keeps the master signature
        defaultWitnessName: witnessName,
        defaultWitnessSignatureUrl: witnessSignature
      },
    });

    return NextResponse.json({ message: "Agreement signed successfully" }, { status: 200 });
  } catch (error) {
    console.error("Signature Processing Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
