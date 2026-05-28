"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE ="http://localhost:3000";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          username: username.trim(),
          password: password.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || "Registrasi gagal");
      }

      setSuccess("Akun berhasil dibuat. Silakan login.");
      setName("");
      setUsername("");
      setPassword("");
      setTimeout(() => {
        router.push("/login");
      }, 800);
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
            <h1 className="mt-2 text-2xl font-semibold text-neutral-50">Registrasi Admin</h1>
            <p className="mt-2 text-sm text-neutral-400">
              Buat akun baru. Hanya username admin yang bisa masuk ke CMS.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-md border border-red-800 bg-red-950/60 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-md border border-emerald-700 bg-emerald-950/40 px-4 py-3 text-sm text-emerald-200">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm text-neutral-300">
            Nama
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-2 w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-neutral-100"
              placeholder="Nama lengkap"
              required
            />
          </label>
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
            {loading ? "Memproses..." : "Daftar"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/login")}
            className="w-full rounded-full border border-neutral-700 px-4 py-2 text-sm text-neutral-200 hover:border-neutral-500"
          >
            Kembali ke Login
          </button>
        </form>
      </div>
    </div>
  );
}
