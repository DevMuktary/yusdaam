import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { CarFront, AlertCircle, CheckCircle2, Wrench, Search, MapPin } from "lucide-react";
import Link from "next/link";

const prisma = new PrismaClient();

export default async function FleetPortfolioPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  // 1. Fetch all vehicles owned by this user, including their assigned rider and active contract
  const vehicles = await prisma.vehicle.findMany({
    where: { ownerId: session.user.id },
    include: {
      rider: {
        select: { firstName: true, lastName: true, phoneNumber: true }
      },
      contract: true,
    },
    orderBy: { createdAt: 'desc' }
  });

  // 2. Calculate Fleet Metrics
  const totalVehicles = vehicles.length;
  const activeVehicles = vehicles.filter(v => v.status === "ACTIVE").length;
  const maintenanceVehicles = vehicles.filter(v => v.status === "MAINTENANCE").length;
  const inactiveVehicles = vehicles.filter(v => v.status === "INACTIVE" || v.status === "UNASSIGNED").length;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-cobalt/20 pb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-wide mb-2">Fleet Portfolio</h1>
          <p className="text-slate-light">Manage and monitor your allocated transport assets in real-time.</p>
        </div>
      </div>

      {/* Fleet KPI Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-void-navy/50 border border-cobalt/20 p-5 rounded-xl shadow-lg">
          <p className="text-[10px] font-bold text-slate-light uppercase tracking-widest mb-1">Total Assets</p>
          <h3 className="text-2xl font-black text-crisp-white">{totalVehicles}</h3>
        </div>
        <div className="bg-emerald-500/5 border border-emerald-500/20 p-5 rounded-xl shadow-lg">
          <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1">Active</p>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-400" />
            <h3 className="text-2xl font-black text-emerald-400">{activeVehicles}</h3>
          </div>
        </div>
        <div className="bg-amber-500/5 border border-amber-500/20 p-5 rounded-xl shadow-lg">
          <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1">Maintenance</p>
          <div className="flex items-center gap-2">
            <Wrench size={18} className="text-amber-400" />
            <h3 className="text-2xl font-black text-amber-400">{maintenanceVehicles}</h3>
          </div>
        </div>
        <div className="bg-signal-red/5 border border-signal-red/20 p-5 rounded-xl shadow-lg">
          <p className="text-[10px] font-bold text-signal-red uppercase tracking-widest mb-1">Inactive / Unassigned</p>
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="text-signal-red" />
            <h3 className="text-2xl font-black text-signal-red">{inactiveVehicles}</h3>
          </div>
        </div>
      </div>

      {/* Asset Roster Table */}
      <div className="bg-void-navy border border-cobalt/30 rounded-xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-cobalt/30 bg-void-light/5 flex items-center justify-between">
          <h3 className="font-bold uppercase tracking-wider flex items-center gap-2 text-sm">
            <CarFront size={18} className="text-cobalt" /> Allocated Units
          </h3>
          
          {/* Optional Search/Filter stub for future expansion */}
          <div className="hidden sm:flex items-center gap-2 bg-void-dark border border-cobalt/30 rounded-lg px-3 py-1.5">
            <Search size={14} className="text-slate-light" />
            <input type="text" placeholder="Search plates..." className="bg-transparent text-xs text-crisp-white focus:outline-none w-32 placeholder:text-slate-light/50" disabled />
          </div>
        </div>

        <div className="overflow-x-auto">
          {vehicles.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center">
              <CarFront size={48} className="text-cobalt/30 mb-4" />
              <p className="text-slate-light font-medium">No assets have been allocated to your portfolio yet.</p>
              <p className="text-xs text-slate-light/70 mt-2">Assets will appear here once your KYC and initial purchase are cleared.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-void-dark/50 text-[10px] uppercase tracking-widest text-slate-light border-b border-cobalt/30">
                  <th className="p-4 font-bold">Asset ID / Plate</th>
                  <th className="p-4 font-bold">Type</th>
                  <th className="p-4 font-bold">Assigned Rider</th>
                  <th className="p-4 font-bold">Target Weekly</th>
                  <th className="p-4 font-bold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cobalt/10">
                {vehicles.map((vehicle) => {
                  const isReady = vehicle.status === "ACTIVE";
                  const isMaint = vehicle.status === "MAINTENANCE";
                  const badgeClasses = isReady 
                    ? "bg-emerald-400/10 text-emerald-400 border-emerald-400/20" 
                    : isMaint 
                      ? "bg-amber-400/10 text-amber-400 border-amber-400/20" 
                      : "bg-signal-red/10 text-signal-red border-signal-red/20";

                  return (
                    <tr key={vehicle.id} className="hover:bg-void-light/5 transition duration-150">
                      <td className="p-4">
                        <p className="font-black text-sm text-crisp-white tracking-wider">{vehicle.registrationNumber || "PENDING"}</p>
                        <p className="text-[10px] text-slate-light font-mono mt-1">ID: {vehicle.id.slice(-8).toUpperCase()}</p>
                      </td>
                      <td className="p-4">
                        <span className="text-xs font-bold text-cobalt bg-cobalt/10 px-2 py-1 rounded-md uppercase tracking-wider">
                          {vehicle.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-4">
                        {vehicle.rider ? (
                          <>
                            <p className="font-bold text-xs text-crisp-white uppercase">{vehicle.rider.firstName} {vehicle.rider.lastName}</p>
                            <p className="text-[10px] text-slate-light mt-1">{vehicle.rider.phoneNumber}</p>
                          </>
                        ) : (
                          <span className="text-xs italic text-slate-light/50">Unassigned</span>
                        )}
                      </td>
                      <td className="p-4">
                        {vehicle.contract ? (
                          <p className="font-black text-sm text-emerald-400">₦{vehicle.contract.weeklyRemittance.toLocaleString()}</p>
                        ) : (
                          <span className="text-[10px] uppercase tracking-widest text-slate-light/50">N/A</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <span className={`inline-flex text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-md border ${badgeClasses}`}>
                          {vehicle.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
