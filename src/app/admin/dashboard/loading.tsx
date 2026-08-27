import { Loader2 } from "lucide-react";

export default function AdminDashboardLoading() {
  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-pulse p-2 sm:p-0">
      
      {/* Top Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="space-y-2">
          <div className="h-7 w-48 bg-white/10 rounded-lg" />
          <div className="h-4 w-72 bg-white/5 rounded-md" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-9 w-24 bg-white/10 rounded-lg" />
          <div className="h-9 w-28 bg-cobalt/20 rounded-lg" />
        </div>
      </div>

      {/* Instant Feedback Banner */}
      <div className="flex items-center gap-3 px-4 py-3 bg-cobalt/10 border border-cobalt/20 rounded-xl">
        <Loader2 className="w-4 h-4 text-cobalt animate-spin shrink-0" />
        <span className="text-xs font-semibold text-blue-200 tracking-wide">
          Loading dashboard data...
        </span>
      </div>

      {/* KPI Cards Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-[#0e1626] border border-white/10 rounded-xl p-4 space-y-3 shadow-lg">
            <div className="flex justify-between items-center">
              <div className="h-3 w-20 bg-white/10 rounded" />
              <div className="w-7 h-7 rounded-lg bg-white/5" />
            </div>
            <div className="h-7 w-28 bg-white/15 rounded-md" />
            <div className="h-2.5 w-36 bg-white/5 rounded" />
          </div>
        ))}
      </div>

      {/* Table / Content Block Skeleton */}
      <div className="bg-[#0e1626] border border-white/10 rounded-2xl overflow-hidden shadow-xl space-y-4 p-5">
        <div className="flex justify-between items-center pb-3 border-b border-white/5">
          <div className="h-5 w-36 bg-white/10 rounded" />
          <div className="h-8 w-48 bg-white/5 rounded-lg" />
        </div>

        {/* Row Skeletons */}
        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4, 5, 6].map((row) => (
            <div key={row} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/10 shrink-0" />
                <div className="space-y-1.5">
                  <div className="h-3.5 w-32 bg-white/10 rounded" />
                  <div className="h-2.5 w-20 bg-white/5 rounded" />
                </div>
              </div>
              <div className="h-3 w-24 bg-white/10 rounded hidden sm:block" />
              <div className="h-6 w-16 bg-white/10 rounded-md" />
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
