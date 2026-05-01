"use client";
import { useState } from "react";
import {
  User,
  Ban,
  CheckCircle,
  Trash2,
  Crown,
  UserX,
  KeyRound,
  Copy,
  Check,
} from "lucide-react";

interface UserRecord {
  id: string;
  email?: string;
  phone?: string;
  created_at: string;
  last_sign_in_at?: string;
  banned_until?: string;
  isPremium?: boolean;
}

interface Props {
  initialUsers: UserRecord[];
}

export default function UsersClient({ initialUsers }: Props) {
  const [users, setUsers] = useState<UserRecord[]>(initialUsers);
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [granting, setGranting] = useState<Record<string, boolean>>({});
  const [revoking, setRevoking] = useState<Record<string, boolean>>({});
  const [deleting, setDeleting] = useState<Record<string, boolean>>({});
  const [resetting, setResetting] = useState<Record<string, boolean>>({});
  const [resetLink, setResetLink] = useState<{ email: string; link: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const isBanned = (u: UserRecord) =>
    !!u.banned_until && new Date(u.banned_until) > new Date();

  const handleBan = async (userId: string, action: "ban" | "unban") => {
    setLoading((l) => ({ ...l, [userId]: true }));
    try {
      const res = await fetch(`/api/admin/users/${userId}/ban`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        const data = await res.json();
        setUsers((prev) =>
          prev.map((u) =>
            u.id === userId ? { ...u, banned_until: data.user?.banned_until } : u
          )
        );
      }
    } finally {
      setLoading((l) => ({ ...l, [userId]: false }));
    }
  };

  const handleGrantPremium = async (userId: string) => {
    setGranting((g) => ({ ...g, [userId]: true }));
    try {
      const res = await fetch("/api/admin/users/grant-entitlement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, type: "FULL" }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, isPremium: true } : u))
        );
      }
    } finally {
      setGranting((g) => ({ ...g, [userId]: false }));
    }
  };

  const handleRevoke = async (userId: string) => {
    if (!confirm("Revoke all entitlements? User will be downgraded to Free.")) return;
    setRevoking((r) => ({ ...r, [userId]: true }));
    try {
      const res = await fetch(`/api/admin/users/${userId}/revoke-entitlement`, {
        method: "POST",
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, isPremium: false } : u))
        );
      }
    } finally {
      setRevoking((r) => ({ ...r, [userId]: false }));
    }
  };

  const handleDelete = async (userId: string, email?: string) => {
    if (!confirm(`Delete user ${email ?? userId}? This cannot be undone.`)) return;
    setDeleting((d) => ({ ...d, [userId]: true }));
    try {
      const res = await fetch(`/api/admin/users/${userId}/delete`, {
        method: "DELETE",
      });
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
      } else {
        const err = await res.json();
        alert(err.error ?? "Failed to delete user");
      }
    } finally {
      setDeleting((d) => ({ ...d, [userId]: false }));
    }
  };

  const handleResetPassword = async (userId: string) => {
    setResetting((r) => ({ ...r, [userId]: true }));
    try {
      const res = await fetch(`/api/admin/users/${userId}/reset-password`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok && data.link) {
        setResetLink({ email: data.email, link: data.link });
        setCopied(false);
      } else {
        alert(data.error ?? "Failed to generate reset link");
      }
    } finally {
      setResetting((r) => ({ ...r, [userId]: false }));
    }
  };

  const handleCopyLink = () => {
    if (resetLink?.link) {
      navigator.clipboard.writeText(resetLink.link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <User className="w-6 h-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">Users ({users.length})</h1>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Email / Phone</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Created</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Last Sign In</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Status</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Plan</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => {
              const banned = isBanned(u);
              return (
                <tr
                  key={u.id}
                  className={`${i !== 0 ? "border-t border-gray-100" : ""} hover:bg-gray-50`}
                >
                  <td className="px-4 py-3 text-gray-800 text-xs">{u.email ?? u.phone ?? u.id}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {new Date(u.created_at).toLocaleDateString("en-IN")}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {u.last_sign_in_at
                      ? new Date(u.last_sign_in_at).toLocaleDateString("en-IN")
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        banned ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {banned ? "Banned" : "Active"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium inline-flex items-center gap-1 ${
                        u.isPremium ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {u.isPremium && <Crown className="w-3 h-3" />}
                      {u.isPremium ? "Premium" : "Free"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {/* Ban/Unban */}
                      <button
                        onClick={() => handleBan(u.id, banned ? "unban" : "ban")}
                        disabled={loading[u.id]}
                        className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg font-medium disabled:opacity-50 ${
                          banned
                            ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            : "bg-red-50 text-red-700 hover:bg-red-100"
                        }`}
                      >
                        {banned ? <CheckCircle className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                        {loading[u.id] ? "..." : banned ? "Unban" : "Ban"}
                      </button>

                      {/* Grant Premium */}
                      {!u.isPremium && (
                        <button
                          onClick={() => handleGrantPremium(u.id)}
                          disabled={granting[u.id]}
                          className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg font-medium bg-amber-50 text-amber-700 hover:bg-amber-100 disabled:opacity-50"
                        >
                          <Crown className="w-3.5 h-3.5" />
                          {granting[u.id] ? "..." : "→ Premium"}
                        </button>
                      )}

                      {/* Revoke to Free */}
                      {u.isPremium && (
                        <button
                          onClick={() => handleRevoke(u.id)}
                          disabled={revoking[u.id]}
                          className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg font-medium bg-gray-50 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                        >
                          <UserX className="w-3.5 h-3.5" />
                          {revoking[u.id] ? "..." : "→ Free"}
                        </button>
                      )}

                      {/* One-click Reset Password */}
                      <button
                        onClick={() => handleResetPassword(u.id)}
                        disabled={resetting[u.id]}
                        className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 disabled:opacity-50"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        {resetting[u.id] ? "..." : "Reset PW"}
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(u.id, u.email)}
                        disabled={deleting[u.id]}
                        className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg font-medium bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        {deleting[u.id] ? "..." : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Reset password link modal */}
      {resetLink && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 shadow-xl w-full max-w-md">
            <h2 className="text-lg font-bold mb-2 text-gray-900">Password Reset Link</h2>
            <p className="text-sm text-gray-500 mb-4">
              Share this link with{" "}
              <span className="font-medium text-gray-700">{resetLink.email}</span>.
              It is valid for a limited time.
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono break-all mb-4 text-gray-700 select-all">
              {resetLink.link}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied!" : "Copy Link"}
              </button>
              <button
                onClick={() => setResetLink(null)}
                className="text-gray-500 underline text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
