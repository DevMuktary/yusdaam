import { Loader2, Wallet } from "lucide-react";

export default function OwnerDashboardLoading() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-pulse pb-20 p-2 sm:p-0">
      
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-cobalt/20 pb-6">
        <div className="space-y-2">
          <div className="h-8 w-56 bg-white/10 rounded-lg" />
          <div className="h-4 w-80 bg-white/5 rounded-md" />
        </div>
      </div>

      {/* Instant Feedback Banner */}
      <div className="flex items-center gap-3 px-4 py-3 bg-cobalt/10 border border-cobalt/20 rounded-xl">
        <Loader2 className="w-4 h-4 text-cobalt animate-spin shrink-0" />
        <span className="text-xs font-semibold text-blue-200 tracking-wide">
          Syncing your asset portfolio and ledger...
        </span>
      </div>

      {/* KPI Cards Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-[#0e1626] border border-white/10 p-6 rounded-xl space-y-3 shadow-lg">
            <div className="h-3 w-28 bg-white/10 rounded" />
            <div className="h-8 w-36 bg-white/15 rounded-lg" />
            <div className="h-3 w-48 bg-white/5 rounded" />
          </div>
        ))}
      </div>

      {/* Content / Table Block Skeleton */}
      <div className="bg-[#0e1626] border border-white/10 rounded-2xl overflow-hidden shadow-xl p-6 space-y-4">
        <div className="h-6 w-44 bg-white/10 rounded" />
        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4, 5].map((row) => (
            <div key={row} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
              <div className="space-y-1.5">
                <div className="h-4 w-32 bg-white/10 rounded" />
                <div className="h-3 w-20 bg-white/5 rounded" />
              </div>
              <div className="h-5 w-24 bg-white/15 rounded-md" />
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
