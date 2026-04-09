
"use client";
import { useState, useEffect } from "react";
import { User, Ban, CheckCircle } from "lucide-react";

interface UserRecord {
  id: string;
  email?: string;
  phone?: string;
  created_at: string;
  last_sign_in_at?: string;
  banned_until?: string;
  entitlements?: any[];
}

interface Props {
  initialUsers: UserRecord[];
}

export default function UsersClient({ initialUsers }: Props) {
  const [users, setUsers] = useState<UserRecord[]>(initialUsers);
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [granting, setGranting] = useState<Record<string, boolean>>({});
  const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([]);
  const [pwUser, setPwUser] = useState<string | null>(null);
  const [pw, setPw] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState("");

  useEffect(() => {
    fetch("/api/admin/subjects")
      .then((r) => r.json())
      .then((d) => setSubjects(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

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
        setUsers((users) =>
          users.map((u) =>
            u.id === userId ? { ...u, banned_until: data.user?.banned_until } : u
          )
        );
      }
    } finally {
      setLoading((l) => ({ ...l, [userId]: false }));
    }
  };

  const isBanned = (u: UserRecord) =>
    !!u.banned_until && new Date(u.banned_until) > new Date();

  const handleGrant = async (
    userId: string,
    type: "FULL" | "SUBJECT",
    subjectId?: string
  ) => {
    setGranting((g) => ({ ...g, [userId]: true }));
    try {
      const res = await fetch("/api/admin/users/grant-entitlement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, type, subjectId }),
      });
      if (res.ok) {
        // Optionally: refetch entitlements for user
      }
    } finally {
      setGranting((g) => ({ ...g, [userId]: false }));
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <User className="w-6 h-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">
          Users ({users.length})
        </h1>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="px-4 py-3 text-left font-semibold text-gray-600">
                Email / Phone
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">
                Created
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">
                Last Sign In
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">
                Status
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">
                Actions
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">
                Grant Free Plan
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => {
              const banned = isBanned(u);
              return (
                <tr
                  key={u.id}
                  className={`${
                    i !== 0 ? "border-t border-gray-100" : ""
                  } hover:bg-gray-50`}
                >
                  <td className="px-4 py-3 text-gray-800">
                    {u.email ?? u.phone ?? u.id}
                  </td>
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
                        banned
                          ? "bg-red-100 text-red-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {banned ? "Banned" : "Active"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleBan(u.id, banned ? "unban" : "ban")}
                      disabled={loading[u.id]}
                      className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg font-medium disabled:opacity-50 ${
                        banned
                          ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          : "bg-red-50 text-red-700 hover:bg-red-100"
                      }`}
                    >
                      {banned ? (
                        <CheckCircle className="w-3.5 h-3.5" />
                      ) : (
                        <Ban className="w-3.5 h-3.5" />
                      )}
                      {loading[u.id]
                        ? "..."
                        : banned
                        ? "Unban"
                        : "Ban"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleGrant(u.id, "FULL")}
                      disabled={granting[u.id]}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-xs mr-2 disabled:opacity-50"
                    >
                      {granting[u.id]
                        ? "Granting..."
                        : "Grant Full Free"}
                    </button>
                    <select
                      className="border rounded px-2 py-1 text-xs mr-2"
                      onChange={(e) =>
                        handleGrant(u.id, "SUBJECT", e.target.value)
                      }
                      defaultValue=""
                      disabled={granting[u.id]}
                    >
                      <option value="">Grant Subject Free</option>
                      {subjects.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                    <button
                      className="text-xs text-orange-600 underline mt-1"
                      onClick={() => {
                        setPwUser(u.id);
                        setPw("");
                        setPwMsg("");
                      }}
                    >
                      Change Password
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {/* Password change modal */}
        {pwUser && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 shadow-xl w-full max-w-xs">
              <h2 className="text-lg font-bold mb-4">Change Password</h2>
              <input
                type="password"
                className="border rounded px-3 py-2 w-full mb-3"
                placeholder="New password"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                minLength={6}
                required
              />
              {pwMsg && (
                <div className="text-sm mb-2 text-center text-emerald-600">
                  {pwMsg}
                </div>
              )}
              <div className="flex gap-2 mt-2">
                <button
                  className="bg-emerald-600 text-white px-4 py-1 rounded disabled:opacity-50"
                  disabled={pwLoading || !pw || pw.length < 6}
                  onClick={async () => {
                    setPwLoading(true);
                    setPwMsg("");
                    const res = await fetch(
                      "/api/admin/users/change-password",
                      {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ userId: pwUser, password: pw }),
                      }
                    );
                    if (res.ok) {
                      setPwMsg("Password changed!");
                      setTimeout(() => {
                        setPwUser(null);
                        setPw("");
                        setPwMsg("");
                      }, 1200);
                    } else {
                      setPwMsg("Failed to change password");
                    }
                    setPwLoading(false);
                  }}
                >
                  {pwLoading ? "Saving..." : "Save"}
                </button>
                <button
                  className="text-gray-500 underline"
                  onClick={() => setPwUser(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
