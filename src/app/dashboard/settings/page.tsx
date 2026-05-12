"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: "Passwords do not match." });
      return;
    }

    setLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ type: 'success', text: "Password updated successfully!" });
      setNewPassword("");
      setConfirmPassword("");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-12 animate-in fade-in duration-700">
      <div>
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-4">Account Settings</h1>
        <p className="text-zinc-500 font-medium">Manage your security and account preferences.</p>
      </div>

      <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-[2.5rem] p-8 md:p-10 space-y-8">
        <div>
          <h2 className="text-xl font-bold text-white mb-2">Change Password</h2>
          <p className="text-sm text-zinc-500 font-medium">Update your password to keep your account secure.</p>
        </div>

        <form onSubmit={handleUpdatePassword} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] ml-1">New Password</label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-zinc-950/50 border border-zinc-800/50 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-orange-500/50 transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] ml-1">Confirm New Password</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-zinc-950/50 border border-zinc-800/50 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-orange-500/50 transition-colors"
            />
          </div>

          {message && (
            <div className={`p-4 rounded-2xl text-sm font-bold border ${
              message.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'
            }`}>
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-orange-500 hover:bg-orange-600 text-white px-10 py-5 rounded-2xl font-black transition-all shadow-xl shadow-orange-500/10 active:scale-95 disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>

      <div className="bg-red-500/5 border border-red-500/10 rounded-[2.5rem] p-8 md:p-10 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-red-500 mb-2">Danger Zone</h2>
          <p className="text-sm text-zinc-500 font-medium">Irreversible actions for your account.</p>
        </div>
        <button className="text-xs font-black text-red-500 uppercase tracking-widest hover:underline">
          Delete Account & All Data
        </button>
      </div>
    </div>
  );
}
