import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { ShieldAlert, Loader2, CheckCircle2, Clock, CarFront, Banknote } from "lucide-react";
import RiderVirtualAgreement from "./RiderVirtualAgreement";

const prisma = new PrismaClient();

export default async function RiderDashboardHome() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  // Fetch Rider, their assigned vehicle, the active contract, AND guarantors
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      assignedTrip: {
        include: {
          contract: true
        }
      },
      guarantors: true // We must fetch guarantors to pass to the agreement
    }
  });

  const currentStatus = String(user?.accountStatus);
  const vehicle = user?.assignedTrip;
  const contract = vehicle?.contract;

  // --- STATE 1: PENDING KYC ---
  if (currentStatus === "PENDING" || currentStatus === "undefined" || !user?.accountStatus) {
    return (
      <div className="max-w-3xl mx-auto mt-10">
        <div className="bg-void-light/5 border border-cobalt/30 p-8 sm:p-12 rounded-2xl relative overflow-hidden shadow-2xl">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-signal-red/20 blur-[100px] rounded-full pointer-events-none" />
          
          <ShieldAlert className="w-16 h-16 text-cobalt mb-6" />
          <h1 className="text-3xl font-black uppercase mb-2">Profile Under Review</h1>
          <p className="text-slate-light leading-relaxed mb-10">
            Welcome, {user?.firstName}. Your rider profile is currently being reviewed by our operations team. We are verifying your driver's license, NIN, and guarantor submissions.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-4 bg-void-navy/50 border border-cobalt/20 p-4 rounded-xl">
              <CheckCircle2 className="text-emerald-400 shrink-0" size={24} />
              <div>
                <h4 className="font-bold text-sm uppercase tracking-wider text-emerald-400">Application Submitted</h4>
                <p className="text-xs text-slate-light">Data received and encrypted.</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 bg-signal-red/10 border border-signal-red/30 p-4 rounded-xl relative overflow-hidden">
              <div className="absolute inset-y-0 left-0 w-1 bg-signal-red animate-pulse" />
              <Loader2 className="text-signal-red animate-spin shrink-0" size={24} />
              <div>
                <h4 className="font-bold text-sm uppercase tracking-wider text-signal-red">KYC Verification</h4>
                <p className="text-xs text-slate-light">Validating Identity and Guarantors.</p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-void-navy/50 border border-cobalt/10 p-4 rounded-xl opacity-50">
              <Clock className="text-slate-light shrink-0" size={24} />
              <div>
                <h4 className="font-bold text-sm uppercase tracking-wider text-slate-light">Vehicle Assignment</h4>
                <p className="text-xs text-slate-light">Awaiting physical vehicle pairing and agreement generation.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- STATE 2: VIRTUAL AGREEMENT READY ---
  if (currentStatus === "AWAITING_SIGNATURE" && vehicle && contract) {
    return (
      <div className="py-6 overflow-x-hidden">
        {/* Pass the exact objects the component is expecting */}
        <RiderVirtualAgreement 
          rider={user}
          vehicle={vehicle}
          contract={contract}
          guarantors={user.guarantors || []}
        />
      </div>
    );
  }

  // --- STATE 3: FULLY ACTIVE DASHBOARD ---
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 overflow-x-hidden">
      <div className="border-b border-cobalt/20 pb-6">
        <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-wide mb-2">Command Center</h1>
        <p className="text-slate-light">Welcome back, {user?.firstName}. Here is your active trip status.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-void-light/5 border border-cobalt/20 p-6 rounded-xl shadow-lg">
          <div className="p-3 bg-cobalt/10 text-cobalt rounded-lg w-fit mb-4"><CarFront size={24} /></div>
          <h3 className="text-2xl font-black text-crisp-white mb-1">{vehicle?.registrationNumber}</h3>
          <p className="text-xs font-bold text-slate-light uppercase tracking-widest">Assigned Vehicle</p>
        </div>
        
        <div className="bg-void-light/5 border border-cobalt/20 p-6 rounded-xl shadow-lg">
          <div className="p-3 bg-emerald-400/10 text-emerald-400 rounded-lg w-fit mb-4"><Banknote size={24} /></div>
          <h3 className="text-2xl font-black text-crisp-white mb-1">₦{contract?.riderWeeklyRemittance?.toLocaleString() || "0"}</h3>
          <p className="text-xs font-bold text-slate-light uppercase tracking-widest">Weekly Target</p>
        </div>
      </div>
    </div>
  );
}
