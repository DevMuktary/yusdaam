import { Loader2 } from "lucide-react";

export default function AdminLoading() {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in duration-300">
      <Loader2 size={48} className="text-cobalt animate-spin mb-4" />
      <h3 className="text-lg font-bold text-crisp-white uppercase tracking-widest">Fetching Data</h3>
      <p className="text-sm text-slate-light">Please wait securely...</p>
    </div>
  );
}
