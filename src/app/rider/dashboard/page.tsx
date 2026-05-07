import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";
import { redirect } from "next/navigation";
import { ShieldAlert, CheckCircle2, Clock, Copy, ArrowRight, WalletCards, CarFront, ShieldCheck } from "lucide-react";
import { authOptions } from "@/lib/auth"; 

const prisma = new PrismaClient();

export default async function RiderDashboardOverview() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "RIDER") {
    redirect("/rider/login");
  }

  // Fetch the rider and their specific guarantors
  const rider = await prisma.user.findUnique({
    where: { email: session.user.email as string },
    include: { guarantors: true }
  });

  if (!rider) {
    redirect("/rider/login");
  }

  // Check guarantor status
  const g1 = rider.guarantors[0];
  const g2 = rider.guarantors[1];

  const allGuarantorsSubmitted = g1?.status !== "PENDING" && g2?.status !== "PENDING";
  const isFullyApproved = rider.accountStatus === "ACTIVE" || rider.accountStatus === "APPROVED";

  const getBaseUrl = () => {
    if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
    return "http://localhost:3000";
  };

  const baseUrl = getBaseUrl();

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-wider mb-2">Command Center</h1>
        <p className="text-sm text-slate-light">Welcome back, {rider.firstName}. Here is your current operational status.</p>
      </div>

      {/* STATUS BANNER */}
      {!isFullyApproved && (
        <div className="bg-signal-red/10 border border-signal-red p-6 rounded-xl flex flex-col md:flex-row md:items-center gap-6">
          <div className="shrink-0 bg-signal-red/20 p-4 rounded-full text-signal-red">
            <ShieldAlert size={32} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-signal-red uppercase tracking-widest mb-1">Account Locked: Pending KYC</h2>
            <p className="text-sm text-slate-light leading-relaxed">
              Your profile is currently restricted. You cannot be assigned an asset or commence operations until your nominated guarantors have successfully executed their Deeds of Guarantee.
            </p>
          </div>
        </div>
      )}

      {/* GUARANTOR TRACKING WIDGET */}
      {!isFullyApproved && (
        <div className="bg-void-dark border border-cobalt/20 rounded-xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-cobalt/20 bg-void-light/5">
            <h3 className="text-lg font-bold uppercase tracking-wider">Guarantor Protocol Status</h3>
            <p className="text-xs text-slate-light">Track the completion of your required legal attestations.</p>
          </div>
          
          <div className="divide-y divide-cobalt/20">
            {/* Guarantor 1 */}
            {g1 && (
              <div className="p-6 flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div className="flex items-center gap-4">
                  {g1.status === "PENDING" ? (
                    <Clock size={24} className="text-cobalt shrink-0" />
                  ) : (
                    <CheckCircle2 size={24} className="text-emerald-400 shrink-0" />
                  )}
                  <div>
                    <p className="font-bold uppercase tracking-widest text-sm">{g1.firstName} {g1.lastName}</p>
                    <p className="text-xs text-slate-light">{g1.relationship}</p>
                  </div>
                </div>
                
                {g1.status === "PENDING" ? (
                  <div className="w-full md:w-auto flex flex-col items-start md:items-end gap-2">
                    <span className="text-[10px] font-bold text-signal-red uppercase tracking-widest bg-signal-red/10 px-3 py-1 rounded-full border border-signal-red/30">Awaiting Signature</span>
                    <p className="text-[10px] text-slate-light font-mono truncate max-w-[200px] sm:max-w-xs">{baseUrl}/guarantor/{g1.token}</p>
                  </div>
                ) : (
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-400/30">Deed Executed</span>
                )}
              </div>
            )}

            {/* Guarantor 2 */}
            {g2 && (
              <div className="p-6 flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div className="flex items-center gap-4">
                  {g2.status === "PENDING" ? (
                    <Clock size={24} className="text-cobalt shrink-0" />
                  ) : (
                    <CheckCircle2 size={24} className="text-emerald-400 shrink-0" />
                  )}
                  <div>
                    <p className="font-bold uppercase tracking-widest text-sm">{g2.firstName} {g2.lastName}</p>
                    <p className="text-xs text-slate-light">{g2.relationship}</p>
                  </div>
                </div>
                
                {g2.status === "PENDING" ? (
                  <div className="w-full md:w-auto flex flex-col items-start md:items-end gap-2">
                    <span className="text-[10px] font-bold text-signal-red uppercase tracking-widest bg-signal-red/10 px-3 py-1 rounded-full border border-signal-red/30">Awaiting Signature</span>
                    <p className="text-[10px] text-slate-light font-mono truncate max-w-[200px] sm:max-w-xs">{baseUrl}/guarantor/{g2.token}</p>
                  </div>
                ) : (
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-400/30">Deed Executed</span>
                )}
              </div>
            )}
          </div>
          
          {/* Admin Review Note */}
          {allGuarantorsSubmitted && !isFullyApproved && (
            <div className="p-6 bg-emerald-500/10 border-t border-emerald-500/30 text-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
              <h4 className="font-bold text-emerald-400 uppercase tracking-wider mb-2">All Guarantors Verified</h4>
              <p className="text-xs text-slate-light max-w-md mx-auto">
                Your required attestations have been successfully recorded. Your file is currently under final review by Administration for fleet allocation.
              </p>
            </div>
          )}
        </div>
      )}

      {/* DASHBOARD PREVIEW (Grayed out if pending) */}
      <div className={`transition-all duration-500 ${!isFullyApproved ? "opacity-30 pointer-events-none grayscale" : ""}`}>
        <h3 className="text-lg font-bold border-b border-cobalt/20 pb-2 mb-6 uppercase tracking-wider">Fleet Operations Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-void-dark border border-cobalt/20 p-6 rounded-xl">
            <WalletCards className="text-cobalt mb-4" size={32} />
            <p className="text-xs text-slate-light font-bold uppercase tracking-widest mb-1">Current Balance</p>
            <p className="text-2xl font-black font-mono">₦ ---</p>
          </div>
          <div className="bg-void-dark border border-cobalt/20 p-6 rounded-xl">
            <CarFront className="text-cobalt mb-4" size={32} />
            <p className="text-xs text-slate-light font-bold uppercase tracking-widest mb-1">Assigned Asset</p>
            <p className="text-2xl font-black">---</p>
          </div>
          <div className="bg-void-dark border border-cobalt/20 p-6 rounded-xl">
            <ShieldCheck className="text-cobalt mb-4" size={32} />
            <p className="text-xs text-slate-light font-bold uppercase tracking-widest mb-1">Next Remittance</p>
            <p className="text-2xl font-black font-mono">---</p>
          </div>
        </div>
      </div>

    </div>
  );
}
