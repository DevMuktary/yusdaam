import { Users, Car, ShieldAlert, Banknote } from "lucide-react";

export default function AdminDashboardOverview() {
  // In the future, these will be fetched via Prisma from your database
  const stats = [
    { title: "Pending KYC Approvals", value: "12", icon: Users, color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20" },
    { title: "Active Vehicles", value: "48", icon: Car, color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" },
    { title: "Unverified Guarantors", value: "7", icon: ShieldAlert, color: "text-signal-red", bg: "bg-signal-red/10", border: "border-signal-red/20" },
    { title: "Expected Remittance (Weekly)", value: "₦1,240,000", icon: Banknote, color: "text-cobalt", bg: "bg-cobalt/10", border: "border-cobalt/20" },
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
            <h3 className="text-3xl font-bold text-crisp-white mb-1">{stat.value}</h3>
            <p className="text-sm font-medium text-slate-light">{stat.title}</p>
          </div>
        ))}
      </div>

      {/* QUICK ACTIONS & RECENT ACTIVITY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Panel */}
        <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-light mb-4">Recent Platform Activity</h2>
          <div className="text-center py-12 text-gray-500 border border-dashed border-white/10 rounded-lg">
            Activity feed will populate once the database is wired up.
          </div>
        </div>

        {/* Side Panel */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-light mb-4">Action Items</h2>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-void-navy border border-white/5 flex justify-between items-center">
              <span className="text-sm text-gray-300">Assign Vehicle to Rider</span>
              <button className="text-xs bg-cobalt hover:bg-blue-600 px-3 py-1.5 rounded transition">Assign</button>
            </div>
            <div className="p-4 rounded-lg bg-void-navy border border-white/5 flex justify-between items-center">
              <span className="text-sm text-gray-300">Review Guarantor Deeds</span>
              <button className="text-xs bg-signal-red hover:bg-red-700 px-3 py-1.5 rounded transition">Review</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
