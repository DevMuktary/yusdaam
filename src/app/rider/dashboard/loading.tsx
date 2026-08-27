import { Loader2 } from "lucide-react";

export default function RiderDashboardLoading() {
  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-pulse p-2 sm:p-0">
      
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="space-y-2">
          <div className="h-7 w-48 bg-white/10 rounded-lg" />
          <div className="h-4 w-64 bg-white/5 rounded-md" />
        </div>
      </div>

      {/* Instant Feedback Banner */}
      <div className="flex items-center gap-3 px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
        <Loader2 className="w-4 h-4 text-emerald-400 animate-spin shrink-0" />
        <span className="text-xs font-semibold text-emerald-200 tracking-wide">
          Loading rider schedule and remittances...
        </span>
      </div>

      {/* KPI Cards Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-[#0e1626] border border-white/10 rounded-xl p-5 space-y-3 shadow-lg">
            <div className="h-3 w-24 bg-white/10 rounded" />
            <div className="h-7 w-32 bg-white/15 rounded-md" />
            <div className="h-2.5 w-40 bg-white/5 rounded" />
          </div>
        ))}
      </div>

      {/* Schedule / Content Skeleton */}
      <div className="bg-[#0e1626] border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="h-5 w-40 bg-white/10 rounded" />
        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4, 5].map((row) => (
            <div key={row} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
              <div className="space-y-1.5">
                <div className="h-3.5 w-28 bg-white/10 rounded" />
                <div className="h-2.5 w-16 bg-white/5 rounded" />
              </div>
              <div className="h-6 w-20 bg-white/10 rounded-md" />
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
