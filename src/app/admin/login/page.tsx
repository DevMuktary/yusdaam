"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Lock } from "lucide-react";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError("Invalid admin credentials. Please try again.");
        setIsLoading(false);
      } else {
        // Redirect directly to the overview command center
        router.push("/admin/dashboard");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-void-navy flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
      {/* Subtle Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cobalt/10 rounded-full blur-3xl mix-blend-screen"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-signal-red/5 rounded-full blur-3xl mix-blend-screen"></div>
      </div>

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-10">
          <Link href="/" className="text-3xl font-black tracking-wider text-crisp-white hover:opacity-80 transition inline-block">
            YUSDAAM<span className="text-signal-red">.</span>
          </Link>
          <h2 className="mt-6 text-2xl font-bold text-slate-light tracking-wide uppercase">
            Admin Portal
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Authorized personnel only.
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm text-center font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-light mb-2">
                Admin Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-void-navy/50 border border-white/10 rounded-lg text-crisp-white focus:outline-none focus:ring-2 focus:ring-cobalt focus:border-transparent transition-all"
                placeholder="admin@yusdaam.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-light mb-2">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-void-navy/50 border border-white/10 rounded-lg text-crisp-white focus:outline-none focus:ring-2 focus:ring-cobalt focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-signal-red hover:bg-red-700 text-white font-bold rounded-lg shadow-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <Lock size={18} />
                  Authenticate
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
