"use client";

import { useState } from "react";
import { Search, User, ShieldAlert, CheckCircle2, Ban, Briefcase, X, Banknote, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

type UserData = any;

export default function UsersClient({ users }: { users: UserData[] }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Filter Logic
  const filteredUsers = users.filter((user) => {
    const matchesTab = activeTab === "ALL" || user.role === activeTab;
    const searchString = `${user.firstName} ${user.lastName} ${user.email} ${user.phoneNumber}`.toLowerCase();
    const matchesSearch = searchString.includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // Action Handler (Suspend / Reactivate)
  const handleStatusChange = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === "SUSPENDED" ? "ACTIVE" : "SUSPENDED";
    const actionText = newStatus === "SUSPENDED" ? "suspend and lock out" : "reactivate";
    
    if (!confirm(`Are you sure you want to ${actionText} this user?`)) return;

    setIsProcessing(true);
    try {
      const res = await fetch("/api/admin/users/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update status");
      
      alert(`User account is now ${newStatus}`);
      router.refresh();
      setSelectedUser(null); // Close modal if open
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Helper to calculate Rider Financials
  const getRiderFinancials = (user: UserData) => {
    if (!user.assignedTrip || !user.assignedTrip.contract) return null;
    const contract = user.assignedTrip.contract;
    const ledgers = user.assignedTrip.ledgers || [];
    
    // 1. Calculate ONLY the weekly remittances (ledgers)
    const totalRemitted = ledgers.reduce((sum: number, l: any) => sum + l.amount, 0);
    
    // 2. Get the Down Payment (Default to 0 if none)
    const downPayment = contract.downPayment || 0;
    
    // 3. Total Paid is Down Payment + Remittances
    const totalPaid = totalRemitted + downPayment;
    
    const target = contract.riderWeeklyRemittance;
    
    // 4. Weeks Cleared should ONLY count the weekly remittances, not the down payment
    const weeksCleared = target > 0 ? (totalRemitted / target).toFixed(1) : "0";
    
    // 5. Debt Remaining is Total Price minus Total Paid (which includes down payment)
    const balanceRemaining = contract.totalHirePurchasePrice - totalPaid;

    return { totalPaid, target, weeksCleared, balanceRemaining, totalPrice: contract.totalHirePurchasePrice };
  };

  return (
    <div className="space-y-6">
      
      {/* CONTROLS: Tabs & Search */}
      <div className="flex flex-col lg:flex-row justify-between gap-4 bg-void-navy p-4 rounded-xl border border-white/10 shadow-lg">
        <div className="flex overflow-x-auto gap-2 pb-2 lg:pb-0 hide-scrollbar">
          {["ALL", "RIDER", "ASSET_OWNER", "ADMIN"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-xs font-bold tracking-wider uppercase whitespace-nowrap transition-all ${
                activeTab === tab 
                  ? 'bg-cobalt text-white shadow-lg shadow-blue-900/20' 
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              {tab.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="relative w-full lg:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search name, email, or phone..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-cobalt transition-colors"
          />
        </div>
      </div>

      {/* DIRECTORY TABLE */}
      <div className="bg-void-navy border border-white/10 rounded-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-white/5 text-[10px] uppercase tracking-widest text-gray-400 border-b border-white/10">
                <th className="p-4">User</th>
                <th className="p-4">Role</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-white/5 transition duration-150">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                        {user.passportUrl ? <img src={user.passportUrl} className="w-full h-full object-cover rounded-full"/> : <User size={18} className="text-gray-500" />}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-white">{user.firstName} {user.lastName}</p>
                        <p className="text-[10px] text-gray-500 font-mono tracking-wider">Joined: {new Date(user.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded ${
                      user.role === 'RIDER' ? 'bg-emerald-500/10 text-emerald-400' : 
                      user.role === 'ASSET_OWNER' ? 'bg-purple-500/10 text-purple-400' : 'bg-red-500/10 text-red-400'
                    }`}>
                      {user.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4">
                    <p className="text-xs text-gray-300">{user.phoneNumber}</p>
                    <p className="text-[10px] text-gray-500 truncate max-w-[150px]">{user.email}</p>
                  </td>
                  <td className="p-4">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md border ${
                      user.accountStatus === 'ACTIVE' || user.accountStatus === 'APPROVED' ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20' : 
                      user.accountStatus === 'SUSPENDED' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                      'bg-amber-400/10 text-amber-400 border-amber-400/20'
                    }`}>
                      {user.accountStatus.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => setSelectedUser(user)}
                      className="bg-white/10 hover:bg-cobalt hover:text-white text-gray-300 px-4 py-1.5 rounded-lg text-xs font-bold transition"
                    >
                      View Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              No users found matching your criteria.
            </div>
          )}
        </div>
      </div>

      {/* GOD MODE MODAL (DETAILED DOSSIER) */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-void-navy border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-300">
            
            {/* Modal Header */}
            <div className="sticky top-0 bg-void-navy/90 backdrop-blur border-b border-white/10 p-5 flex justify-between items-center z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 overflow-hidden flex items-center justify-center">
                  {selectedUser.passportUrl ? <img src={selectedUser.passportUrl} className="w-full h-full object-cover"/> : <User size={20} className="text-gray-500"/>}
                </div>
                <div>
                  <h2 className="text-xl font-black text-white leading-tight">{selectedUser.firstName} {selectedUser.lastName}</h2>
                  <p className="text-xs text-gray-400 uppercase tracking-widest">{selectedUser.role.replace('_', ' ')} • {selectedUser.accountStatus.replace('_', ' ')}</p>
                </div>
              </div>
              <button onClick={() => setSelectedUser(null)} className="p-2 bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-lg transition"><X size={20} /></button>
            </div>

            <div className="p-6 space-y-8">
              
              {/* FINANCIAL DOSSIER */}
              {selectedUser.role === "RIDER" && selectedUser.assignedTrip && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-5">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-emerald-400 uppercase tracking-wider mb-4 border-b border-emerald-500/20 pb-2">
                    <Banknote size={16} /> Rider Financial Dossier
                  </h3>
                  {(() => {
                    const stats = getRiderFinancials(selectedUser);
                    if (!stats) return <p className="text-xs text-gray-400">No active contract data found.</p>;
                    return (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div><p className="text-[10px] text-gray-400 uppercase mb-1">Target / Wk</p><p className="font-bold text-white text-lg">₦{stats.target.toLocaleString()}</p></div>
                        <div><p className="text-[10px] text-gray-400 uppercase mb-1">Total Paid</p><p className="font-black text-emerald-400 text-lg">₦{stats.totalPaid.toLocaleString()}</p></div>
                        <div><p className="text-[10px] text-gray-400 uppercase mb-1">Weeks Cleared</p><p className="font-bold text-white text-lg">{stats.weeksCleared} Wks</p></div>
                        <div><p className="text-[10px] text-gray-400 uppercase mb-1">Debt Remaining</p><p className="font-bold text-red-400 text-lg">₦{stats.balanceRemaining.toLocaleString()}</p></div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* ASSET OWNER PORTFOLIO SUMMARY */}
              {selectedUser.role === "ASSET_OWNER" && selectedUser.ownedVehicles && selectedUser.ownedVehicles.length > 0 && (
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-5">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-purple-400 uppercase tracking-wider mb-4 border-b border-purple-500/20 pb-2">
                    <Briefcase size={16} /> Owner Portfolio Summary
                  </h3>
                  <div className="space-y-3">
                    {selectedUser.ownedVehicles.map((v: any) => {
                      const totalReceived = v.ledgers.reduce((sum: number, l: any) => sum + l.amount, 0);
                      return (
                        <div key={v.id} className="flex justify-between items-center bg-void-navy p-3 rounded-lg border border-white/5">
                          <div>
                            <p className="font-bold text-white text-sm">{v.registrationNumber}</p>
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest">{v.type}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-0.5">Total Earnings Paid Out</p>
                            <p className="font-bold text-emerald-400">₦{totalReceived.toLocaleString()}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Grid for General Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Contact & KYC */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-cobalt uppercase tracking-wider border-b border-white/10 pb-2">Identity & Contact</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">Phone:</span> <span className="text-white">{selectedUser.phoneNumber}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Email:</span> <span className="text-white truncate max-w-[200px]">{selectedUser.email}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">NIN:</span> <span className="text-white font-mono">{selectedUser.nin || "N/A"}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">BVN:</span> <span className="text-white font-mono">{selectedUser.bvn || "N/A"}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Address:</span> <span className="text-white text-right max-w-[200px]">{selectedUser.streetAddress}</span></div>
                  </div>
                </div>

                {/* Banking & Virtual Account */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-cobalt uppercase tracking-wider border-b border-white/10 pb-2">Financial Channels</h3>
                  <div className="space-y-3 text-sm">
                    
                    {/* ONLY show Personal Bank Account if user is NOT a RIDER */}
                    {selectedUser.role !== "RIDER" && (
                      <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Personal Bank Account</p>
                        <p className="font-bold text-white">{selectedUser.bankName || "N/A"}</p>
                        <p className="text-gray-300 font-mono">{selectedUser.accountNumber || "N/A"}</p>
                      </div>
                    )}
                    
                    {selectedUser.role === "RIDER" && (
                      <div className="p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                        <p className="text-[10px] text-emerald-400 uppercase tracking-widest mb-1">Virtual Remittance Account</p>
                        <p className="font-bold text-white">{selectedUser.virtualBankName || "Pending Setup"}</p>
                        <p className="text-emerald-400 font-mono text-lg">{selectedUser.virtualAccountNo || "N/A"}</p>
                      </div>
                    )}

                  </div>
                </div>

              </div>

              {/* ACTION ZONE */}
              <div className="border-t border-white/10 pt-6 mt-8">
                <div className="bg-red-500/5 border border-red-500/20 p-5 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="text-red-500 font-bold uppercase tracking-wider flex items-center gap-2 mb-1">
                      <ShieldAlert size={18} /> Danger Zone
                    </h3>
                    <p className="text-xs text-red-200/70">Suspending a user immediately revokes their dashboard access and flags their profile.</p>
                  </div>
                  
                  <button 
                    onClick={() => handleStatusChange(selectedUser.id, selectedUser.accountStatus)}
                    disabled={isProcessing || selectedUser.role === "ADMIN"}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-sm uppercase tracking-wider transition disabled:opacity-50 ${
                      selectedUser.accountStatus === 'SUSPENDED' 
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white' 
                        : 'bg-red-600 hover:bg-red-500 text-white'
                    }`}
                  >
                    {isProcessing ? <Loader2 size={16} className="animate-spin" /> : selectedUser.accountStatus === 'SUSPENDED' ? <CheckCircle2 size={16} /> : <Ban size={16} />}
                    {selectedUser.accountStatus === 'SUSPENDED' ? 'Reactivate User' : 'Suspend User'}
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
