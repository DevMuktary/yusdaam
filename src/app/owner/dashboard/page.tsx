import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import { ShieldAlert, Loader2, CheckCircle2, Clock, TrendingUp, CarFront, Calendar, Activity } from "lucide-react";
import VirtualAgreement from "./VirtualAgreement";

const prisma = new PrismaClient();

export default async function DashboardHome() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) return null;

  // FETCH EVERYTHING NEEDED FOR THE AGREEMENT
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { 
      id: true,
      accountStatus: true, 
      firstName: true, 
      lastName: true,
      email: true,
      phoneNumber: true,
      bvn: true,
      nin: true,
      streetAddress: true,
      bankName: true,
      accountNumber: true,
      ownedVehicles: {
        include: {
          contract: true
        }
      }
    }
  });

  const currentStatus = String(user?.accountStatus);
  const fullName = `${user?.firstName || ""} ${user?.lastName || ""}`.trim();
  
  // Grab the first assigned vehicle and its contract if they exist
  const assignedVehicle = user?.ownedVehicles?.[0];
  const assignedContract = assignedVehicle?.contract;

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
      <div className="py-6 overflow-x-hidden">
        <VirtualAgreement 
          ownerName={fullName} 
          ownerId={user?.id}
          ownerEmail={user?.email || ""}
          ownerPhone={user?.phoneNumber || ""}
          bvn={user?.bvn || ""}
          nin={user?.nin || ""}
          ownerAddress={user?.streetAddress || ""}
          ownerBank={user?.bankName || ""}
          ownerAcctNo={user?.accountNumber || ""}
          vehicleType={assignedVehicle?.type || ""}
          plateNo={assignedVehicle?.registrationNumber || ""}
          // FIXED: Now reads ownerWeeklyPayout
          targetWeeklyRemittance={assignedContract?.ownerWeeklyPayout?.toString() || ""}
        />
      </div>
    );
  }

  // --- STATE 3: FULLY ACTIVE DASHBOARD ---
  const vehicles = await prisma.vehicle.findMany({
    where: { ownerId: session.user.id },
  });

  const ledgers = await prisma.ledger.findMany({
    where: { ownerId: session.user.id, type: "OWNER_REMITTANCE" },
    orderBy: { date: 'desc' },
    take: 5 
  });

  const activeFleetCount = vehicles.filter(v => v.status === "ACTIVE").length;
  const totalRemitted = ledgers.reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 overflow-x-hidden">
      
      <div className="border-b border-cobalt/20 pb-6">
        <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-wide mb-2">Operational Overview</h1>
        <p className="text-slate-light">Welcome back, {user?.firstName}. Here is your real-time asset performance.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-void-light/5 border border-cobalt/20 p-6 rounded-xl relative overflow-hidden shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-cobalt/10 text-cobalt rounded-lg"><CarFront size={24} /></div>
          </div>
          <h3 className="text-3xl font-black text-crisp-white mb-1">{activeFleetCount} <span className="text-sm font-medium text-slate-light">/ {vehicles.length}</span></h3>
          <p className="text-xs font-bold text-slate-light uppercase tracking-widest">Active Fleet</p>
        </div>
        
        <div className="bg-void-light/5 border border-cobalt/20 p-6 rounded-xl relative overflow-hidden shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-emerald-400/10 text-emerald-400 rounded-lg"><TrendingUp size={24} /></div>
          </div>
          <h3 className="text-3xl font-black text-crisp-white mb-1">₦{totalRemitted.toLocaleString()}</h3>
          <p className="text-xs font-bold text-slate-light uppercase tracking-widest">Total Remitted</p>
        </div>

        <div className="bg-void-light/5 border border-cobalt/20 p-6 rounded-xl relative overflow-hidden shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-signal-red/10 text-signal-red rounded-lg"><Calendar size={24} /></div>
          </div>
          <h3 className="text-3xl font-black text-crisp-white mb-1">Weekly</h3>
          <p className="text-xs font-bold text-slate-light uppercase tracking-widest">Payout Cycle</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
        <div className="bg-void-navy/50 border border-cobalt/20 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6 border-b border-cobalt/20 pb-4">
            <h3 className="font-bold uppercase tracking-wider flex items-center gap-2">
              <Activity size={18} className="text-cobalt" /> Recent Remittances
            </h3>
            <Link href="/owner/dashboard/ledger" className="text-[10px] uppercase font-bold text-signal-red hover:text-crisp-white transition">
              View Ledger
            </Link>
          </div>
          
          <div className="space-y-2">
            {ledgers.length === 0 ? (
              <p className="text-sm text-slate-light italic py-4">No remittance history recorded yet.</p>
            ) : (
              ledgers.map((tx) => (
                <div key={tx.id} className="flex justify-between items-center p-3 hover:bg-void-light/5 rounded-lg transition border border-transparent hover:border-cobalt/20">
                  <div>
                    <p className="text-sm font-bold text-crisp-white">{tx.description || "Weekly Remittance"}</p>
                    <p className="text-[10px] text-slate-light uppercase tracking-widest">{new Date(tx.date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-emerald-400">+₦{tx.amount.toLocaleString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-void-navy/50 border border-cobalt/20 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6 border-b border-cobalt/20 pb-4">
            <h3 className="font-bold uppercase tracking-wider flex items-center gap-2">
              <CarFront size={18} className="text-cobalt" /> Fleet Deployment
            </h3>
            <Link href="/owner/dashboard/assets" className="text-[10px] uppercase font-bold text-signal-red hover:text-crisp-white transition">
              Manage Fleet
            </Link>
          </div>
          
          <div className="space-y-2">
            {vehicles.length === 0 ? (
              <p className="text-sm text-slate-light italic py-4">No vehicles assigned to your portfolio yet.</p>
            ) : (
              vehicles.map((v) => (
                <div key={v.id} className="flex justify-between items-center p-3 hover:bg-void-light/5 rounded-lg transition border border-transparent hover:border-cobalt/20">
                  <div>
                    <p className="text-sm font-bold text-crisp-white uppercase tracking-wider">{v.registrationNumber || "PENDING PLATE"}</p>
                    <p className="text-[10px] text-slate-light uppercase tracking-widest">{v.type}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md ${
                      v.status === 'ACTIVE' ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20' : 
                      v.status === 'MAINTENANCE' ? 'bg-amber-400/10 text-amber-400 border border-amber-400/20' :
                      'bg-signal-red/10 text-signal-red border border-signal-red/20'
                    }`}>
                      {v.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
