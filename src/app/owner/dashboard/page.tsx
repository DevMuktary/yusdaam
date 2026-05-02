import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { ShieldAlert, Loader2, CheckCircle2, Clock } from "lucide-react";
import VirtualAgreement from "./VirtualAgreement";

const prisma = new PrismaClient();

export default async function DashboardHome() {
  const session = await getServerSession(authOptions);
  
  const user = await prisma.user.findUnique({
    where: { id: session?.user?.id },
    select: { accountStatus: true, firstName: true, lastName: true }
  });

  const currentStatus = String(user?.accountStatus);
  const fullName = `${user?.firstName} ${user?.lastName}`;

  // --- STATE 1: PENDING KYC ---
  if (currentStatus === "PENDING" || currentStatus === "undefined" || !user?.accountStatus) {
    return (
      <div className="max-w-3xl mx-auto mt-10">
        <div className="bg-void-light/5 border border-cobalt/30 p-8 sm:p-12 rounded-2xl relative overflow-hidden shadow-2xl">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-signal-red/20 blur-[100px] rounded-full pointer-events-none" />
          
          <ShieldAlert className="w-16 h-16 text-cobalt mb-6" />
          <h1 className="text-3xl font-black uppercase mb-2">Profile Under Review</h1>
          <p className="text-slate-light leading-relaxed mb-10">
            Welcome, {user?.firstName}. Your onboarding profile is currently locked inside our compliance vault. Our administration team is running mandatory KYC verifications on your submitted documents.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-4 bg-void-navy/50 border border-cobalt/20 p-4 rounded-xl">
              <CheckCircle2 className="text-emerald-400 shrink-0" size={24} />
              <div>
                <h4 className="font-bold text-sm uppercase tracking-wider text-emerald-400">Profile Submitted</h4>
                <p className="text-xs text-slate-light">Data received and encrypted.</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 bg-signal-red/10 border border-signal-red/30 p-4 rounded-xl relative overflow-hidden">
              <div className="absolute inset-y-0 left-0 w-1 bg-signal-red animate-pulse" />
              <Loader2 className="text-signal-red animate-spin shrink-0" size={24} />
              <div>
                <h4 className="font-bold text-sm uppercase tracking-wider text-signal-red">KYC Verification</h4>
                <p className="text-xs text-slate-light">Validating Identity and Remittance channels.</p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-void-navy/50 border border-cobalt/10 p-4 rounded-xl opacity-50">
              <Clock className="text-slate-light shrink-0" size={24} />
              <div>
                <h4 className="font-bold text-sm uppercase tracking-wider text-slate-light">Asset Allocation</h4>
                <p className="text-xs text-slate-light">Awaiting physical vehicle pairing and agreement generation.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- STATE 2: VIRTUAL AGREEMENT READY ---
  if (currentStatus === "AWAITING_SIGNATURE") {
    return (
      <div className="py-6">
        <VirtualAgreement ownerName={fullName} />
      </div>
    );
  }

  // --- STATE 3: FULLY ACTIVE DASHBOARD ---
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-black uppercase mb-8">Asset Overview</h1>
      <p className="text-slate-light">Active Dashboard coming next.</p>
    </div>
  );
}
