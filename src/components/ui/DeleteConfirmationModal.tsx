"use client";

import { useState } from "react";
import { AlertTriangle, Trash2, X, Loader2, ShieldAlert, CheckCircle2 } from "lucide-react";

interface DeleteUserTarget {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  role?: string | null;
}

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  user: DeleteUserTarget | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DeleteConfirmationModal({
  isOpen,
  user,
  onClose,
  onSuccess,
}: DeleteConfirmationModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmText, setConfirmText] = useState("");

  if (!isOpen || !user) return null;

  const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email || "User";
  const isRider = user.role === "RIDER";
  const isOwner = user.role === "ASSET_OWNER";
  const roleLabel = isRider ? "Rider / Driver" : isOwner ? "Asset Owner" : user.role || "User";

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/users/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to delete user account.");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during deletion.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-[#0a0f1c] border border-red-500/30 rounded-2xl shadow-2xl shadow-red-950/40 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Danger Gradient Accent */}
        <div className="h-1.5 w-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-500" />

        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isDeleting}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition disabled:opacity-30"
        >
          <X size={20} />
        </button>

        <div className="p-6 space-y-5">
          {/* Header */}
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-red-500/15 border border-red-500/30 rounded-xl text-red-400 shrink-0">
              <Trash2 size={24} />
            </div>
            <div>
              <h3 className="text-lg font-black text-white uppercase tracking-wider">
                Permanent User Deletion
              </h3>
              <p className="text-xs text-red-400 font-semibold tracking-wide">
                This action is destructive and cannot be undone.
              </p>
            </div>
          </div>

          {/* User Target Card */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 uppercase tracking-wider font-bold">Target Account</span>
              <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${
                isRider ? 'bg-emerald-500/20 text-emerald-400' : 'bg-purple-500/20 text-purple-400'
              }`}>
                {roleLabel}
              </span>
            </div>
            <p className="text-base font-black text-white">{fullName}</p>
            <div className="text-xs text-gray-400 space-y-0.5 font-mono">
              {user.email && <p>Email: <span className="text-gray-300">{user.email}</span></p>}
              {user.phoneNumber && <p>Phone: <span className="text-gray-300">{user.phoneNumber}</span></p>}
            </div>
          </div>

          {/* Cascade Impact Description */}
          <div className="space-y-2 text-xs text-gray-300 bg-red-500/5 border border-red-500/15 p-3.5 rounded-xl">
            <p className="font-bold text-red-300 flex items-center gap-1.5">
              <ShieldAlert size={15} /> What will be permanently removed:
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-400 text-[11px] leading-relaxed">
              <li>All signed legal contracts, HPAs, and POAs</li>
              <li>All financial transactions, payouts, and ledger logs</li>
              <li>All weekly billing cycles and debt tracking history</li>
              {isRider && <li>Guarantor deeds & associated documents</li>}
              {isRider && <li>Assigned vehicle will be disconnected and freed for reallocation</li>}
              {isOwner && <li>All vehicles owned by this investor</li>}
              <li>Authentication credentials and active sessions</li>
            </ul>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Safety Confirm Input */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Type <strong className="text-red-400">DELETE</strong> to confirm
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE"
              disabled={isDeleting}
              className="w-full bg-white/5 border border-white/15 focus:border-red-500 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none font-mono uppercase tracking-widest"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2.5 rounded-lg text-xs font-bold text-gray-400 hover:text-white hover:bg-white/5 uppercase tracking-wider transition disabled:opacity-30"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting || confirmText.trim().toUpperCase() !== "DELETE"}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold text-white uppercase tracking-wider transition bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-red-900/30"
            >
              {isDeleting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Deleting User & Cascades...
                </>
              ) : (
                <>
                  <Trash2 size={16} />
                  Permanently Delete
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
