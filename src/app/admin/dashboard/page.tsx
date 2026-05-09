import { Users, Car, ShieldAlert, Banknote, Landmark } from "lucide-react";
import { PrismaClient } from "@prisma/client";

// Initialize Prisma
const prisma = new PrismaClient();

export default async function AdminDashboardOverview() {
  // 1. Fetch Real Data from Database Concurrently for maximum speed
  const [
    pendingUsersCount,
    activeVehiclesCount,
    unverifiedGuarantorsCount,
    activeContracts
  ] = await Promise.all([
    // Count users (both riders and owners) awaiting approval
    prisma.user.count({
      where: { 
        accountStatus: "PENDING", 
        role: { not: "ADMIN" } 
      },
    }),
    
    // Count vehicles currently on the road
    prisma.vehicle.count({
      where: { status: "ACTIVE" },
    }),
    
    // Count guarantors that have submitted their deeds but aren't verified by admin yet
    prisma.guarantor.count({
      where: { status: "SUBMITTED" },
    }),

    // Fetch active contracts to calculate BOTH expected revenue AND owner payouts
    prisma.contract.findMany({
      where: { isActive: true },
      select: { 
        riderWeeklyRemittance: true, 
        ownerWeeklyPayout: true 
      },
    })
  ]);

  // 2. Calculate totals for both sides of the marketplace
  const expectedInflow = activeContracts.reduce(
    (sum, contract) => sum + contract.riderWeeklyRemittance,
    0
  );

  const expectedPayout = activeContracts.reduce(
    (sum, contract) => sum + contract.ownerWeeklyPayout,
    0
  );

  // Format currency properly for Nigeria
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // 3. Map Data to the UI Widgets
  const stats = [
    { title: "Pending KYC Approvals", value: pendingUsersCount.toString(), icon: Users, color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20" },
    { title: "Active Vehicles", value: activeVehiclesCount.toString(), icon: Car, color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" },
    { title: "Weekly Inflow (Riders)", value: formatCurrency(expectedInflow), icon: Banknote, color: "text-cobalt", bg: "bg-cobalt/10", border: "border-cobalt/20" },
    { title: "Weekly Payout (Owners)", value: formatCurrency(expectedPayout), icon: Landmark, color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/20" },
  ];

  return (
    <div className="space-y-8">
      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div 
            key={index} 
            className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm hover:border-white/20 transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.bg} ${stat.color} border ${stat.border}`}>
                <stat.icon size={24} />
              </div>
            </div>
            <h3 className="text-2xl xl:text-3xl font-bold text-crisp-white mb-1 truncate">{stat.value}</h3>
            <p className="text-sm font-medium text-slate-light">{stat.title}</p>
          </div>
        ))}
      </div>

      {/* QUICK ACTIONS & RECENT ACTIVITY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Panel */}
        <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-light mb-4">Platform Overview</h2>
          <div className="text-center py-12 text-gray-500 border border-dashed border-white/10 rounded-lg">
            Dashboard is wired up. Try registering a new user or assigning a vehicle to see the financial stats update in real-time!
          </div>
        </div>

        {/* Side Panel */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-light mb-4">Action Items</h2>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-void-navy border border-white/5 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <Users className="text-amber-400" size={20} />
                <span className="text-sm text-gray-300">You have <strong>{pendingUsersCount}</strong> users awaiting KYC verification.</span>
              </div>
            </div>
            <div className="p-4 rounded-lg bg-void-navy border border-white/5 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <ShieldAlert className="text-signal-red" size={20} />
                <span className="text-sm text-gray-300">You have <strong>{unverifiedGuarantorsCount}</strong> guarantors waiting for deed review.</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
