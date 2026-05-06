import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { UserCog, ShieldCheck, Mail, Phone, MapPin, Building2, CreditCard, Lock, AlertCircle, Users, BadgeInfo } from "lucide-react";

const prisma = new PrismaClient();

export default async function ProfileSettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) return null;

  // Mask sensitive data for security
  const maskString = (str: string | null | undefined, visibleChars = 4) => {
    if (!str) return "NOT PROVIDED";
    if (str.length <= visibleChars) return str;
    return "•".repeat(str.length - visibleChars) + str.slice(-visibleChars);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-cobalt/20 pb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-wide mb-2">Profile Settings</h1>
          <p className="text-slate-light">Manage your verified personal and financial routing information.</p>
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-void-navy/50 border border-cobalt/30 p-6 rounded-xl flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-md">
        <div className="p-3 bg-cobalt/10 rounded-full shrink-0">
          <ShieldCheck size={24} className="text-cobalt" />
        </div>
        <div>
          <h3 className="font-bold text-crisp-white uppercase tracking-wider text-sm mb-1">Data Locked for Compliance</h3>
          <p className="text-xs text-slate-light leading-relaxed">
            Your KYC data and remittance details are tied directly to your legally binding Hire Purchase Administration Agreement. To prevent fraud, any modifications to your bank routing, identity documents, or succession plan must be processed manually through your assigned Account Manager.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-2">
        
        {/* PERSONAL & SUCCESSION DETAILS CARD */}
        <div className="bg-void-navy/50 border border-cobalt/20 rounded-xl overflow-hidden shadow-lg">
          <div className="p-6 border-b border-cobalt/20 bg-void-light/5">
            <h3 className="font-bold uppercase tracking-wider flex items-center gap-2 text-sm text-crisp-white">
              <UserCog size={18} className="text-cobalt" /> Personal Information
            </h3>
          </div>
          
          <div className="p-6 space-y-6">
            <div>
              <p className="text-[10px] font-bold text-slate-light uppercase tracking-widest mb-1">Full Legal Name</p>
              <p className="text-base font-bold text-crisp-white uppercase">{user.firstName} {user.lastName}</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-[10px] font-bold text-slate-light uppercase tracking-widest mb-1 flex items-center gap-1.5"><Mail size={12} /> Email Address</p>
                <p className="text-sm font-medium text-crisp-white">{user.email}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-light uppercase tracking-widest mb-1 flex items-center gap-1.5"><Phone size={12} /> Phone Number</p>
                <p className="text-sm font-medium text-crisp-white">{user.phoneNumber || "NOT PROVIDED"}</p>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold text-slate-light uppercase tracking-widest mb-1 flex items-center gap-1.5"><MapPin size={12} /> Residential Address</p>
              <p className="text-sm font-medium text-crisp-white leading-relaxed">{user.streetAddress || "NOT PROVIDED"}</p>
              {user.state && <p className="text-xs text-slate-light mt-1 uppercase tracking-wider">{user.state}, {user.country || "NIGERIA"}</p>}
            </div>

            {/* Next of Kin (Succession) Section */}
            <div className="pt-6 mt-6 border-t border-cobalt/20">
              <h4 className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Users size={14} /> Succession: Next of Kin
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-[10px] font-bold text-slate-light uppercase tracking-widest mb-1">Full Name</p>
                  <p className="text-sm font-medium text-crisp-white uppercase">
                    {user.nokFirstName ? `${user.nokFirstName} ${user.nokLastName || ""}` : "NOT PROVIDED"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-light uppercase tracking-widest mb-1">Relationship</p>
                  <p className="text-sm font-medium text-crisp-white uppercase">{user.nokRelationship || "NOT PROVIDED"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-light uppercase tracking-widest mb-1 flex items-center gap-1.5"><Phone size={12} /> Phone Number</p>
                  <p className="text-sm font-medium text-crisp-white">{user.nokPhone || "NOT PROVIDED"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-light uppercase tracking-widest mb-1 flex items-center gap-1.5"><BadgeInfo size={12} /> ID Number</p>
                  <p className="text-sm font-mono text-crisp-white tracking-widest">{maskString(user.nokIdNumber)}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-[10px] font-bold text-slate-light uppercase tracking-widest mb-1 flex items-center gap-1.5"><MapPin size={12} /> NOK Address</p>
                  <p className="text-sm font-medium text-crisp-white leading-relaxed">{user.nokAddress || "NOT PROVIDED"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FINANCIAL & KYC CARD */}
        <div className="bg-void-navy/50 border border-cobalt/20 rounded-xl overflow-hidden shadow-lg flex flex-col">
          <div className="p-6 border-b border-cobalt/20 bg-void-light/5">
            <h3 className="font-bold uppercase tracking-wider flex items-center gap-2 text-sm text-crisp-white">
              <Building2 size={18} className="text-emerald-400" /> Remittance & KYC
            </h3>
          </div>
          
          <div className="p-6 space-y-6 flex-1">
            {/* Bank Routing */}
            <div className="bg-emerald-400/5 border border-emerald-400/20 p-5 rounded-lg">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard size={16} className="text-emerald-400" />
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Active Remittance Account</h4>
              </div>
              <p className="text-sm font-black text-crisp-white uppercase tracking-wider mb-1">{user.bankName || "NOT PROVIDED"}</p>
              <p className="text-lg font-mono text-slate-light tracking-widest">{user.accountNumber ? maskString(user.accountNumber, 4) : "----------"}</p>
            </div>

            {/* KYC Data */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              <div>
                <p className="text-[10px] font-bold text-slate-light uppercase tracking-widest mb-1 flex items-center gap-1.5"><Lock size={12} /> BVN</p>
                <p className="text-sm font-mono text-crisp-white tracking-widest">{maskString(user.bvn)}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-light uppercase tracking-widest mb-1 flex items-center gap-1.5"><Lock size={12} /> NIN</p>
                <p className="text-sm font-mono text-crisp-white tracking-widest">{maskString(user.nin)}</p>
              </div>
            </div>
          </div>
          
          {/* Action Footer */}
          <div className="p-6 border-t border-cobalt/20 bg-void-dark/30">
            <a href="mailto:admin@yusdaamautos.com" className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-void-light/5 hover:bg-signal-red/10 text-slate-light hover:text-signal-red border border-cobalt/30 hover:border-signal-red/30 rounded-xl transition font-bold text-xs uppercase tracking-widest">
              <AlertCircle size={14} />
              Request Profile Update
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
