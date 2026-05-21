import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { ShieldAlert, Loader2, CheckCircle2, Clock, CarFront, Banknote, UserCheck, Copy, ExternalLink } from "lucide-react";
import RiderVirtualAgreement from "./RiderVirtualAgreement";
import CopyLinkHelper from "./CopyLinkHelper"; // We will create this simple helper below

const prisma = new PrismaClient();

export default async function RiderDashboardHome() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  // Fetch Rider, assigned vehicle, active contract, AND guarantors
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      assignedTrip: {
        include: {
          contract: true
        }
      },
      guarantors: true 
    }
  });

  const currentStatus = String(user?.accountStatus);
  const vehicle = user?.assignedTrip;
  const contract = vehicle?.contract;
  const guarantors = user?.guarantors || [];

  // Check if any guarantors are still pending out of the expected 2
  const pendingGuarantors = guarantors.filter(g => g.status === "PENDING");
  const isWaitingForGuarantors = pendingGuarantors.length > 0 || guarantors.length < 2;

  // --- STATE 1: PENDING KYC OR WAITING FOR GUARANTORS ---
  if (currentStatus === "PENDING" || currentStatus === "undefined" || !user?.accountStatus) {
    // Get the base URL dynamically for the guarantor tokens
    const baseUrl = process.env.NEXTAUTH_URL || "https://yusdaamautos.com";

    return (
      <div className="max-w-3xl mx-auto mt-10 space-y-6 px-4 sm:px-0">
        <div className="bg-void-light/5 border border-cobalt/30 p-6 sm:p-12 rounded-2xl relative overflow-hidden shadow-2xl">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-signal-red/20 blur-[100px] rounded-full pointer-events-none" />
          
          <ShieldAlert className="w-16 h-16 text-cobalt mb-6" />
          <h1 className="text-2xl sm:text-3xl font-black uppercase mb-2">Application Pipeline</h1>
          <p className="text-slate-light leading-relaxed mb-10 text-sm sm:text-base">
            Welcome back, {user?.firstName}. Your application status is tracked below in real-time. Please complete all pending external requirements.
          </p>

          <div className="space-y-4">
            
            {/* Step 1: Core Application Submission */}
            <div className="flex items-center gap-4 bg-void-navy/50 border border-emerald-500/20 p-4 rounded-xl">
              <CheckCircle2 className="text-emerald-400 shrink-0" size={24} />
              <div>
                <h4 className="font-bold text-sm uppercase tracking-wider text-emerald-400">Application Submitted</h4>
                <p className="text-xs text-slate-light">Profile data received and securely encrypted.</p>
              </div>
            </div>
            
            {/* Step 2: Guarantor Attestations Track Block */}
            <div className={`flex flex-col p-4 rounded-xl border relative overflow-hidden transition-all ${
              isWaitingForGuarantors 
                ? 'bg-signal-red/10 border-signal-red/30' 
                : 'bg-void-navy/50 border-emerald-500/20'
            }`}>
              {isWaitingForGuarantors && <div className="absolute inset-y-0 left-0 w-1 bg-signal-red animate-pulse" />}
              
              <div className="flex items-center gap-4">
                {isWaitingForGuarantors ? (
                  <Loader2 className="text-signal-red animate-spin shrink-0" size={24} />
                ) : (
                  <CheckCircle2 className="text-emerald-400 shrink-0" size={24} />
                )}
                <div>
                  <h4 className={`font-bold text-sm uppercase tracking-wider ${isWaitingForGuarantors ? 'text-signal-red' : 'text-emerald-400'}`}>
                    Guarantor Verifications
                  </h4>
                  <p className="text-xs text-slate-light">
                    {isWaitingForGuarantors 
                      ? "Awaiting execution of digital attestations by your nominated sureties." 
                      : "All guarantor legal verifications are successfully complete."}
                  </p>
                </div>
              </div>

              {/* DYNAMIC GUARANTOR STATUS ITEMS AND ACTIONABLE LINKS */}
              <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
                {guarantors.map((g, idx) => {
                  const fullLink = `${baseUrl}/guarantor/${g.token}`;
                  const isPending = g.status === "PENDING";
                  
                  return (
                    <div key={g.id} className="bg-void-navy/40 border border-white/5 p-3 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold text-white uppercase tracking-wide">
                          Guarantor {idx + 1}: {g.firstName} {g.lastName}
                        </p>
                        <p className="text-[11px] text-gray-400 font-mono truncate max-w-[250px] sm:max-w-xs">{fullLink}</p>
                      </div>
                      
                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${
                          isPending 
                            ? 'bg-amber-400/10 text-amber-400 border-amber-400/20' 
                            : 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20'
                        }`}>
                          {isPending ? 'Awaiting Signature' : 'Signed'}
                        </span>
                        
                        {isPending && (
                          <CopyLinkHelper link={fullLink} />
                        )}
                      </div>
                    </div>
                  );
                })}
                {guarantors.length === 0 && (
                  <p className="text-xs text-signal-red italic">No guarantor entities connected to profile. Contact admin support.</p>
                )}
              </div>
            </div>

            {/* Step 3: Admin KYC Review (Stalls until Guarantors are done) */}
            <div className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
              isWaitingForGuarantors 
                ? 'bg-void-navy/50 border-white/5 opacity-40 select-none' 
                : 'bg-signal-red/10 border-signal-red/30 relative overflow-hidden'
            }`}>
              {!isWaitingForGuarantors && (
                <>
                  <div className="absolute inset-y-0 left-0 w-1 bg-signal-red animate-pulse" />
                  <Loader2 className="text-signal-red animate-spin shrink-0" size={24} />
                </>
              )}
              {isWaitingForGuarantors && <Clock className="text-slate-light shrink-0" size={24} />}
              <div>
                <h4 className={`font-bold text-sm uppercase tracking-wider ${!isWaitingForGuarantors ? 'text-signal-red' : 'text-slate-light'}`}>
                  Corporate Compliance Check
                </h4>
                <p className="text-xs text-slate-light">
                  {isWaitingForGuarantors 
                    ? "Locks automatically until both guarantor signatures are captured." 
                    : "Admin vetting of drivers license, NIN, and address documents is actively in progress."}
                </p>
              </div>
            </div>

            {/* Step 4: Vehicle Allocation & Agreement */}
            <div className="flex items-center gap-4 bg-void-navy/50 border border-white/5 p-4 rounded-xl opacity-40 select-none">
              <Clock className="text-slate-light shrink-0" size={24} />
              <div>
                <h4 className="font-bold text-sm uppercase tracking-wider text-slate-light">Vehicle & Contract Pairing</h4>
                <p className="text-xs text-slate-light">Awaiting operational confirmation and digital contract routing.</p>
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
