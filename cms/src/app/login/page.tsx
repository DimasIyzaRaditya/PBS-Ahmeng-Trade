"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE ="http://localhost:3000";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Login gagal");
      }

      const token = data?.data?.access_token as string | undefined;
      const user = data?.data?.user as { id: number; name: string; username: string } | undefined;

      if (!token || !user) {
        throw new Error("Data login tidak lengkap");
      }

      if (user.username.toLowerCase() !== "admin") {
        setError("Bukan akun admin");
        setLoading(false);
        return;
      }

      localStorage.setItem("cms_token", token);
      localStorage.setItem("cms_user", JSON.stringify(user));
      const maxAge = 60 * 60 * 24; // 1 day
      document.cookie = `cms_token=${token}; Path=/; SameSite=Lax; Max-Age=${maxAge}`;
      document.cookie = `cms_role=admin; Path=/; SameSite=Lax; Max-Age=${maxAge}`;

      window.location.href = "/dashboard";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-4">
      <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900/40 p-8">
        <div className="mb-6 flex flex-col items-center gap-3">
          <img
            src="/assets/logo.png"
            alt="Ahmeng Trade"
            className="h-14 w-14 rounded-full border border-neutral-800 bg-neutral-900"
          />
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Ahmeng Trade</p>
            <h1 className="mt-2 text-2xl font-semibold text-neutral-50">CMS Admin Login</h1>
            <p className="mt-2 text-sm text-neutral-400">
              Silakan masuk dengan akun admin.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-md border border-red-800 bg-red-950/60 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm text-neutral-300">
            Username
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="mt-2 w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-neutral-100"
              placeholder="admin"
              required
            />
          </label>
          <label className="block text-sm text-neutral-300">
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-neutral-100"
              placeholder="password"
              required
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-neutral-50 px-4 py-2 text-sm font-semibold text-neutral-900 hover:bg-white disabled:opacity-70"
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/register")}
            className="w-full rounded-full border border-neutral-700 px-4 py-2 text-sm text-neutral-200 hover:border-neutral-500"
          >
            Buat Akun
          </button>
        </form>
      </div>
    </div>
  );
}
