"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

type TabKey = "dashboard" | "users" | "produk" | "transaksi";
type ToastType = "success" | "error" | "info";
type ValidationErrors<T extends string> = Partial<Record<T, string>>;

interface User {
  id: number;
  name: string;
  username: string;
  password?: string;
}

interface Produk {
  id: number;
  nama: string;
  harga: number;
}

interface Transaksi {
  id: number;
  produkId: number;
  namaPembeli: string;
  emailPembeli: string;
  totalHarga: number;
  createdAt?: string;
}

interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

interface PaginationState {
  query: string;
  page: number;
  pageSize: number;
}

const API_BASE = "http://localhost:3000";
const API_USER = `${API_BASE}/user`;
const API_PRODUK = `${API_BASE}/produk`;
const API_TRANSAKSI = `${API_BASE}/transaksi`;
const PAGE_SIZE_OPTIONS = [5, 10, 20];

const buildAuthHeaders = (token: string, includeJson = false) => ({
  ...(includeJson ? { "Content-Type": "application/json" } : {}),
  Authorization: `Bearer ${token}`,
});

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value || 0);

const parseDate = (date?: string) => {
  if (!date) return null;
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

function paginate<T>(items: T[], page: number, pageSize: number) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const start = (safePage - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    totalPages,
    safePage,
  };
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex min-h-44 flex-col items-center justify-center rounded-md border border-dashed border-neutral-800 bg-neutral-950/60 px-4 py-8 text-center">
      <p className="text-sm font-semibold text-neutral-200">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-neutral-500">{description}</p>
    </div>
  );
}

function TableSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <div className="overflow-hidden rounded-md border border-neutral-800">
      {Array.from({ length: 6 }).map((_, row) => (
        <div key={row} className="grid animate-pulse gap-3 border-b border-neutral-900 p-3" style={{ gridTemplateColumns: `repeat(${columns}, minmax(110px, 1fr))` }}>
          {Array.from({ length: columns }).map((__, column) => (
            <div key={column} className="h-4 rounded bg-neutral-800/80" />
          ))}
        </div>
      ))}
    </div>
  );
}

function FormField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="text-sm text-neutral-300">
      <span className="flex items-center justify-between gap-3">
        {label}
        {error && <span className="text-xs text-red-300">{error}</span>}
      </span>
      {children}
    </label>
  );
}

function ToastStack({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed right-4 top-4 z-50 grid w-[min(360px,calc(100vw-2rem))] gap-3">
      {toasts.map((toast) => (
        <button
          key={toast.id}
          onClick={() => onDismiss(toast.id)}
          className={`rounded-md border px-4 py-3 text-left text-sm shadow-xl backdrop-blur ${
            toast.type === "success"
              ? "border-emerald-700 bg-emerald-950/90 text-emerald-100"
              : toast.type === "error"
              ? "border-red-800 bg-red-950/90 text-red-100"
              : "border-neutral-700 bg-neutral-900/90 text-neutral-100"
          }`}
        >
          {toast.message}
        </button>
      ))}
    </div>
  );
}

function PaginationControls({
  page,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
}: {
  page: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}) {
  return (
    <div className="mt-4 flex flex-col gap-3 border-t border-neutral-800 pt-4 text-sm text-neutral-400 sm:flex-row sm:items-center sm:justify-between">
      <p>
        {totalItems} data, halaman {page} dari {totalPages}
      </p>
      <div className="flex items-center gap-2">
        <select
          value={pageSize}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
          className="h-9 rounded-md border border-neutral-800 bg-neutral-950 px-2 text-neutral-100"
        >
          {PAGE_SIZE_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}/hal
            </option>
          ))}
        </select>
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="h-9 rounded-md border border-neutral-800 px-3 text-neutral-200 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Prev
        </button>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="h-9 rounded-md border border-neutral-800 px-3 text-neutral-200 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}

function ChartBar({ label, value, max, caption }: { label: string; value: number; max: number; caption: string }) {
  const height = max > 0 ? Math.max(8, Math.round((value / max) * 120)) : 8;

  return (
    <div className="flex min-w-16 flex-1 flex-col items-center justify-end gap-2">
      <div className="flex h-32 w-full items-end rounded-md bg-neutral-950 px-2 py-2">
        <div className="w-full rounded bg-emerald-400" style={{ height }} />
      </div>
      <div className="text-center">
        <p className="text-xs font-medium text-neutral-300">{label}</p>
        <p className="text-[11px] text-neutral-500">{caption}</p>
      </div>
    </div>
  );
}

export default function AdminPanel() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>("dashboard");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(0);

  const [users, setUsers] = useState<User[]>([]);
  const [produk, setProduk] = useState<Produk[]>([]);
  const [transaksi, setTransaksi] = useState<Transaksi[]>([]);

  const [userTable, setUserTable] = useState<PaginationState>({ query: "", page: 1, pageSize: 5 });
  const [produkTable, setProdukTable] = useState<PaginationState>({ query: "", page: 1, pageSize: 5 });
  const [transaksiTable, setTransaksiTable] = useState<PaginationState>({ query: "", page: 1, pageSize: 5 });
  const [userFilter, setUserFilter] = useState("all");
  const [produkFilter, setProdukFilter] = useState("all");
  const [transaksiProdukFilter, setTransaksiProdukFilter] = useState("all");
  const [transaksiDateFilter, setTransaksiDateFilter] = useState("all");

  const [userErrors, setUserErrors] = useState<ValidationErrors<"name" | "username" | "password">>({});
  const [produkErrors, setProdukErrors] = useState<ValidationErrors<"nama" | "harga">>({});
  const [transaksiErrors, setTransaksiErrors] = useState<
    ValidationErrors<"produkId" | "namaPembeli" | "emailPembeli" | "totalHarga">
  >({});

  const [userForm, setUserForm] = useState({ id: 0, name: "", username: "", password: "" });
  const [produkForm, setProdukForm] = useState({ id: 0, nama: "", harga: "" });
  const [transaksiForm, setTransaksiForm] = useState({
    id: 0,
    produkId: "",
    namaPembeli: "",
    emailPembeli: "",
    totalHarga: "",
  });

  const tabs = useMemo(
    () => [
      { key: "dashboard" as const, label: "Dashboard" },
      { key: "users" as const, label: "User" },
      { key: "produk" as const, label: "Produk" },
      { key: "transaksi" as const, label: "Transaksi" },
    ],
    []
  );

  const addToast = useCallback((message: string, type: ToastType = "info") => {
    toastIdRef.current += 1;
    const id = toastIdRef.current;
    setToasts((prev) => [...prev, { id, message, type }].slice(-4));
    window.setTimeout(() => setToasts((prev) => prev.filter((toast) => toast.id !== id)), 3500);
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("cms_token");
    localStorage.removeItem("cms_user");
    // Cookie cleanup and navigation are intentional browser side effects.
    document.cookie = "cms_token=; Path=/; Max-Age=0";
    document.cookie = "cms_role=; Path=/; Max-Age=0";
    router.replace("/login");
  }, [router]);

  const loadAll = useCallback(async (token: string, showToast = true) => {
    setLoading(true);
    setError(null);
    try {
      const [userRes, produkRes, transaksiRes] = await Promise.all([
        fetch(API_USER, { cache: "no-store", headers: buildAuthHeaders(token) }),
        fetch(API_PRODUK, { cache: "no-store", headers: buildAuthHeaders(token) }),
        fetch(API_TRANSAKSI, { cache: "no-store", headers: buildAuthHeaders(token) }),
      ]);

      if (userRes.status === 401 || produkRes.status === 401 || transaksiRes.status === 401) {
        handleLogout();
        return;
      }

      if (!userRes.ok || !produkRes.ok || !transaksiRes.ok) {
        throw new Error("Gagal memuat data dari API");
      }

      const [userJson, produkJson, transaksiJson] = await Promise.all([
        userRes.json(),
        produkRes.json(),
        transaksiRes.json(),
      ]);

      setUsers(userJson.data || []);
      setProduk(produkJson.data || []);
      setTransaksi(transaksiJson.data || []);
      if (showToast) addToast("Data berhasil diperbarui", "success");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan";
      setError(message);
      addToast(message, "error");
    } finally {
      setLoading(false);
    }
  }, [addToast, handleLogout]);

  useEffect(() => {
    const token = localStorage.getItem("cms_token");
    const userRaw = localStorage.getItem("cms_user");
    if (!token || !userRaw) {
      setLoading(false);
      setError("Sesi tidak valid. Silakan login ulang.");
      return;
    }

    try {
      const user = JSON.parse(userRaw) as { username?: string };
      if (!user.username || user.username.toLowerCase() !== "admin") {
        setLoading(false);
        setError("Akun bukan admin. Silakan login ulang.");
        return;
      }
    } catch {
      setLoading(false);
      setError("Sesi tidak valid. Silakan login ulang.");
      return;
    }

    setAuthToken(token);
    void loadAll(token, false);
  }, [loadAll]);

  const productName = useCallback(
    (produkId: number) => produk.find((item) => item.id === produkId)?.nama || `#${produkId}`,
    [produk]
  );

  const dashboardStats = useMemo(() => {
    const revenue = transaksi.reduce((sum, item) => sum + (item.totalHarga || 0), 0);
    const dailyMap = new Map<string, number>();
    const topMap = new Map<number, { nama: string; count: number; revenue: number }>();

    transaksi.forEach((item) => {
      const date = parseDate(item.createdAt);
      const key = date
        ? date.toLocaleDateString("id-ID", { day: "2-digit", month: "short" })
        : "Tanpa tanggal";
      dailyMap.set(key, (dailyMap.get(key) || 0) + item.totalHarga);

      const current = topMap.get(item.produkId) || { nama: productName(item.produkId), count: 0, revenue: 0 };
      topMap.set(item.produkId, {
        nama: current.nama,
        count: current.count + 1,
        revenue: current.revenue + item.totalHarga,
      });
    });

    return {
      revenue,
      dailySales: Array.from(dailyMap.entries()).slice(-7).map(([label, total]) => ({ label, total })),
      topProducts: Array.from(topMap.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 5),
    };
  }, [productName, transaksi]);

  const filteredUsers = useMemo(() => {
    const query = userTable.query.toLowerCase().trim();
    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(query) || user.username.toLowerCase().includes(query);
      const matchesFilter =
        userFilter === "all" ||
        (userFilter === "admin" && user.username.toLowerCase() === "admin") ||
        (userFilter === "non-admin" && user.username.toLowerCase() !== "admin");
      return matchesSearch && matchesFilter;
    });
  }, [userFilter, userTable.query, users]);

  const filteredProduk = useMemo(() => {
    const query = produkTable.query.toLowerCase().trim();
    return produk.filter((item) => {
      const matchesSearch = item.nama.toLowerCase().includes(query) || String(item.id).includes(query);
      const matchesFilter =
        produkFilter === "all" ||
        (produkFilter === "low" && item.harga < 100000) ||
        (produkFilter === "mid" && item.harga >= 100000 && item.harga <= 500000) ||
        (produkFilter === "high" && item.harga > 500000);
      return matchesSearch && matchesFilter;
    });
  }, [produk, produkFilter, produkTable.query]);

  const filteredTransaksi = useMemo(() => {
    const now = new Date();
    const query = transaksiTable.query.toLowerCase().trim();
    return transaksi.filter((item) => {
      const date = parseDate(item.createdAt);
      const matchesSearch = [productName(item.produkId), item.namaPembeli, item.emailPembeli, String(item.id)]
        .join(" ")
        .toLowerCase()
        .includes(query);
      const matchesProduct =
        transaksiProdukFilter === "all" || item.produkId === Number(transaksiProdukFilter);
      const matchesDate =
        transaksiDateFilter === "all" ||
        (date &&
          ((transaksiDateFilter === "today" && date.toDateString() === now.toDateString()) ||
            (transaksiDateFilter === "week" &&
              now.getTime() - date.getTime() <= 7 * 24 * 60 * 60 * 1000) ||
            (transaksiDateFilter === "month" &&
              date.getMonth() === now.getMonth() &&
              date.getFullYear() === now.getFullYear())));
      return matchesSearch && matchesProduct && matchesDate;
    });
  }, [productName, transaksi, transaksiDateFilter, transaksiProdukFilter, transaksiTable.query]);

  const pagedUsers = paginate(filteredUsers, userTable.page, userTable.pageSize);
  const pagedProduk = paginate(filteredProduk, produkTable.page, produkTable.pageSize);
  const pagedTransaksi = paginate(filteredTransaksi, transaksiTable.page, transaksiTable.pageSize);
  const maxDailySales = Math.max(...dashboardStats.dailySales.map((item) => item.total), 0);
  const maxTopProductRevenue = Math.max(...dashboardStats.topProducts.map((item) => item.revenue), 0);

  const handleUserSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    const errors: ValidationErrors<"name" | "username" | "password"> = {};

    if (!authToken) {
      addToast("Sesi tidak valid", "error");
      return;
    }

    const payload = {
      name: userForm.name.trim(),
      username: userForm.username.trim(),
      password: userForm.password.trim(),
    };

    if (!payload.name) errors.name = "Wajib diisi";
    if (!payload.username) errors.username = "Wajib diisi";
    if (!userForm.id && payload.password.length < 6) errors.password = "Minimal 6 karakter";

    setUserErrors(errors);
    if (Object.keys(errors).length > 0) {
      addToast("Periksa kembali form user", "error");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(userForm.id ? `${API_USER}/${userForm.id}` : API_USER, {
        method: userForm.id ? "PATCH" : "POST",
        headers: buildAuthHeaders(authToken, true),
        body: JSON.stringify(payload),
      });

      if (res.status === 401) {
        handleLogout();
        return;
      }

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.message || "Gagal menyimpan user");
      }

      setUserForm({ id: 0, name: "", username: "", password: "" });
      setUserErrors({});
      addToast(userForm.id ? "User berhasil diperbarui" : "User berhasil ditambahkan", "success");
      await loadAll(authToken, false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan";
      setError(message);
      addToast(message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleProdukSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    const errors: ValidationErrors<"nama" | "harga"> = {};

    if (!authToken) {
      addToast("Sesi tidak valid", "error");
      return;
    }

    const hargaValue = Number(produkForm.harga);
    if (!produkForm.nama.trim()) errors.nama = "Wajib diisi";
    if (!produkForm.harga || Number.isNaN(hargaValue) || hargaValue < 0) errors.harga = "Masukkan angka valid";

    setProdukErrors(errors);
    if (Object.keys(errors).length > 0) {
      addToast("Periksa kembali form produk", "error");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(produkForm.id ? `${API_PRODUK}/${produkForm.id}` : API_PRODUK, {
        method: produkForm.id ? "PATCH" : "POST",
        headers: buildAuthHeaders(authToken, true),
        body: JSON.stringify({ nama: produkForm.nama.trim(), harga: hargaValue }),
      });

      if (res.status === 401) {
        handleLogout();
        return;
      }

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.message || "Gagal menyimpan produk");
      }

      setProdukForm({ id: 0, nama: "", harga: "" });
      setProdukErrors({});
      addToast(produkForm.id ? "Produk berhasil diperbarui" : "Produk berhasil ditambahkan", "success");
      await loadAll(authToken, false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan";
      setError(message);
      addToast(message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleTransaksiSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    const errors: ValidationErrors<"produkId" | "namaPembeli" | "emailPembeli" | "totalHarga"> = {};

    if (!authToken) {
      addToast("Sesi tidak valid", "error");
      return;
    }

    const produkIdValue = Number(transaksiForm.produkId);
    const totalHargaValue = Number(transaksiForm.totalHarga);

    if (!produkIdValue) errors.produkId = "Pilih produk";
    if (!transaksiForm.namaPembeli.trim()) errors.namaPembeli = "Wajib diisi";
    if (!isValidEmail(transaksiForm.emailPembeli.trim())) errors.emailPembeli = "Email tidak valid";
    if (!transaksiForm.totalHarga || Number.isNaN(totalHargaValue) || totalHargaValue < 0) {
      errors.totalHarga = "Masukkan angka valid";
    }

    setTransaksiErrors(errors);
    if (Object.keys(errors).length > 0) {
      addToast("Periksa kembali form transaksi", "error");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(transaksiForm.id ? `${API_TRANSAKSI}/${transaksiForm.id}` : API_TRANSAKSI, {
        method: transaksiForm.id ? "PATCH" : "POST",
        headers: buildAuthHeaders(authToken, true),
        body: JSON.stringify({
          produkId: produkIdValue,
          namaPembeli: transaksiForm.namaPembeli.trim(),
          emailPembeli: transaksiForm.emailPembeli.trim(),
          totalHarga: totalHargaValue,
        }),
      });

      if (res.status === 401) {
        handleLogout();
        return;
      }

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.message || "Gagal menyimpan transaksi");
      }

      setTransaksiForm({ id: 0, produkId: "", namaPembeli: "", emailPembeli: "", totalHarga: "" });
      setTransaksiErrors({});
      addToast(transaksiForm.id ? "Transaksi berhasil diperbarui" : "Transaksi berhasil ditambahkan", "success");
      await loadAll(authToken, false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan";
      setError(message);
      addToast(message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (resource: "user" | "produk" | "transaksi", id: number) => {
    if (!window.confirm("Yakin ingin menghapus data ini?")) return;
    setError(null);

    if (!authToken) {
      addToast("Sesi tidak valid", "error");
      return;
    }

    const url =
      resource === "user"
        ? `${API_USER}/${id}`
        : resource === "produk"
        ? `${API_PRODUK}/${id}`
        : `${API_TRANSAKSI}/${id}`;

    setSaving(true);
    try {
      const res = await fetch(url, {
        method: "DELETE",
        headers: buildAuthHeaders(authToken),
      });
      if (res.status === 401) {
        handleLogout();
        return;
      }
      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.message || "Gagal menghapus data");
      }
      addToast("Data berhasil dihapus", "success");
      await loadAll(authToken, false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan";
      setError(message);
      addToast(message, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950">
      <ToastStack toasts={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((toast) => toast.id !== id))} />
      <header className="border-b border-neutral-800 bg-neutral-950/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Image
              src="/assets/logo.png"
              alt="Ahmeng Trade"
              width={40}
              height={40}
              className="h-10 w-10 rounded-full border border-neutral-800 bg-neutral-900"
            />
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-neutral-500">Ahmeng Trade</p>
              <h1 className="text-3xl font-semibold text-neutral-50">CMS Admin Panel</h1>
            </div>
          </div>
          <div className="flex items-center gap-4 text-right text-sm text-neutral-400">

            <button
              onClick={() => authToken && void loadAll(authToken)}
              className="rounded-md border border-neutral-700 px-4 py-2 text-sm text-neutral-200 hover:border-neutral-500"
            >
              Refresh
            </button>
            <button
              onClick={handleLogout}
              className="rounded-md border border-neutral-700 px-4 py-2 text-sm text-neutral-200 hover:border-neutral-500"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-10">
        <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
          <aside className="hidden flex-col gap-4 rounded-md border border-neutral-800 bg-neutral-900/40 p-5 lg:flex">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Navigasi</p>
              <p className="mt-2 text-sm text-neutral-300">
                Kelola data user, produk, dan transaksi dalam satu panel.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`rounded-md border px-3 py-2 text-left text-sm font-medium transition ${
                    activeTab === tab.key
                      ? "border-neutral-200 bg-neutral-50 text-neutral-900"
                      : "border-neutral-800 bg-neutral-950 text-neutral-300 hover:border-neutral-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </aside>

          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap gap-2 lg:hidden">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`rounded-md border px-4 py-2 text-sm font-medium transition ${
                    activeTab === tab.key
                      ? "border-neutral-200 bg-neutral-50 text-neutral-900"
                      : "border-neutral-800 bg-neutral-900/40 text-neutral-300 hover:border-neutral-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {error && (
              <div className="rounded-md border border-red-800 bg-red-950/60 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            {activeTab === "dashboard" && (
              <>
                <section className="grid gap-4 md:grid-cols-3">
                  {[
                    ["Total User", users.length.toLocaleString("id-ID")],
                    ["Total Produk", produk.length.toLocaleString("id-ID")],
                    ["Pendapatan", formatCurrency(dashboardStats.revenue)],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-md border border-neutral-800 bg-neutral-900/40 p-5">
                      <p className="text-sm text-neutral-500">{label}</p>
                      <p className="mt-2 text-2xl font-semibold text-neutral-50">{loading ? "..." : value}</p>
                    </div>
                  ))}
                </section>

                <section className="grid gap-6 xl:grid-cols-2">
                  <div className="rounded-md border border-neutral-800 bg-neutral-900/40 p-6">
                    <div className="mb-5 flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-neutral-50">Penjualan Harian</h2>
                      <p className="text-sm text-neutral-500">7 label terakhir</p>
                    </div>
                    {loading ? (
                      <TableSkeleton columns={4} />
                    ) : dashboardStats.dailySales.length === 0 ? (
                      <EmptyState title="Belum ada grafik penjualan" description="Grafik akan muncul setelah transaksi memiliki data penjualan." />
                    ) : (
                      <div className="flex gap-3 overflow-x-auto">
                        {dashboardStats.dailySales.map((item) => (
                          <ChartBar
                            key={item.label}
                            label={item.label}
                            value={item.total}
                            max={maxDailySales}
                            caption={formatCurrency(item.total)}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="rounded-md border border-neutral-800 bg-neutral-900/40 p-6">
                    <div className="mb-5 flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-neutral-50">Top Produk</h2>
                      <p className="text-sm text-neutral-500">Berdasarkan revenue</p>
                    </div>
                    {loading ? (
                      <TableSkeleton columns={3} />
                    ) : dashboardStats.topProducts.length === 0 ? (
                      <EmptyState title="Belum ada top produk" description="Produk teratas akan dihitung dari transaksi yang sudah tersimpan." />
                    ) : (
                      <div className="grid gap-3">
                        {dashboardStats.topProducts.map((item) => (
                          <div key={item.nama} className="grid gap-2">
                            <div className="flex items-center justify-between gap-3 text-sm">
                              <span className="font-medium text-neutral-200">{item.nama}</span>
                              <span className="text-neutral-500">{item.count} transaksi</span>
                            </div>
                            <div className="h-2 rounded bg-neutral-950">
                              <div
                                className="h-2 rounded bg-sky-400"
                                style={{ width: `${maxTopProductRevenue ? (item.revenue / maxTopProductRevenue) * 100 : 0}%` }}
                              />
                            </div>
                            <p className="text-xs text-neutral-500">{formatCurrency(item.revenue)}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </section>
              </>
            )}

            {activeTab === "users" && (
              <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-md border border-neutral-800 bg-neutral-900/40 p-6">
                  <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                    <h2 className="text-xl font-semibold text-neutral-50">Daftar User</h2>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <input
                        value={userTable.query}
                        onChange={(event) => setUserTable((prev) => ({ ...prev, query: event.target.value, page: 1 }))}
                        className="h-10 rounded-md border border-neutral-800 bg-neutral-950 px-3 text-sm text-neutral-100"
                        placeholder="Cari nama/username"
                      />
                      <select
                        value={userFilter}
                        onChange={(event) => {
                          setUserFilter(event.target.value);
                          setUserTable((prev) => ({ ...prev, page: 1 }));
                        }}
                        className="h-10 rounded-md border border-neutral-800 bg-neutral-950 px-3 text-sm text-neutral-100"
                      >
                        <option value="all">Semua user</option>
                        <option value="admin">Admin</option>
                        <option value="non-admin">Non-admin</option>
                      </select>
                    </div>
                  </div>
                  {loading ? (
                    <TableSkeleton columns={4} />
                  ) : filteredUsers.length === 0 ? (
                    <EmptyState title="User tidak ditemukan" description="Ubah pencarian atau filter, lalu coba lagi." />
                  ) : (
                    <>
                      <div className="overflow-auto">
                        <table className="w-full text-left text-sm">
                          <thead className="text-neutral-400">
                            <tr className="border-b border-neutral-800">
                              <th className="px-2 py-3">ID</th>
                              <th className="px-2 py-3">Nama</th>
                              <th className="px-2 py-3">Username</th>
                              <th className="px-2 py-3">Aksi</th>
                            </tr>
                          </thead>
                          <tbody>
                            {pagedUsers.items.map((user) => (
                              <tr key={user.id} className="border-b border-neutral-800/70">
                                <td className="px-2 py-3 text-neutral-200">{user.id}</td>
                                <td className="px-2 py-3 text-neutral-100">{user.name}</td>
                                <td className="px-2 py-3 text-neutral-300">{user.username}</td>
                                <td className="px-2 py-3">
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => setUserForm({ id: user.id, name: user.name, username: user.username, password: "" })}
                                      className="rounded-md border border-neutral-700 px-3 py-1 text-xs text-neutral-200 hover:border-neutral-500"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => handleDelete("user", user.id)}
                                      className="rounded-md border border-red-600/60 px-3 py-1 text-xs text-red-300 hover:border-red-400"
                                    >
                                      Hapus
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <PaginationControls
                        page={pagedUsers.safePage}
                        totalPages={pagedUsers.totalPages}
                        pageSize={userTable.pageSize}
                        totalItems={filteredUsers.length}
                        onPageChange={(page) => setUserTable((prev) => ({ ...prev, page }))}
                        onPageSizeChange={(pageSize) => setUserTable((prev) => ({ ...prev, pageSize, page: 1 }))}
                      />
                    </>
                  )}
                </div>

                <form onSubmit={handleUserSubmit} className="rounded-md border border-neutral-800 bg-neutral-900/40 p-6">
                  <h3 className="mb-4 text-lg font-semibold text-neutral-50">{userForm.id ? "Edit User" : "Tambah User"}</h3>
                  <div className="grid gap-4">
                    <FormField label="Nama" error={userErrors.name}>
                      <input
                        value={userForm.name}
                        onChange={(event) => setUserForm((prev) => ({ ...prev, name: event.target.value }))}
                        className={`mt-2 w-full rounded-md border bg-neutral-950 px-3 py-2 text-neutral-100 ${userErrors.name ? "border-red-700" : "border-neutral-800"}`}
                        placeholder="Nama lengkap"
                      />
                    </FormField>
                    <FormField label="Username" error={userErrors.username}>
                      <input
                        value={userForm.username}
                        onChange={(event) => setUserForm((prev) => ({ ...prev, username: event.target.value }))}
                        className={`mt-2 w-full rounded-md border bg-neutral-950 px-3 py-2 text-neutral-100 ${userErrors.username ? "border-red-700" : "border-neutral-800"}`}
                        placeholder="username"
                      />
                    </FormField>
                    <FormField label="Password" error={userErrors.password}>
                      <input
                        type="password"
                        value={userForm.password}
                        onChange={(event) => setUserForm((prev) => ({ ...prev, password: event.target.value }))}
                        className={`mt-2 w-full rounded-md border bg-neutral-950 px-3 py-2 text-neutral-100 ${userErrors.password ? "border-red-700" : "border-neutral-800"}`}
                        placeholder={userForm.id ? "Kosongkan jika tidak diganti" : "Password"}
                      />
                    </FormField>
                  </div>
                  <div className="mt-6 flex gap-3">
                    <button type="submit" disabled={saving} className="rounded-md bg-neutral-50 px-4 py-2 text-sm font-semibold text-neutral-900 hover:bg-white disabled:opacity-50">
                      {saving ? "Menyimpan..." : userForm.id ? "Simpan Perubahan" : "Tambah User"}
                    </button>
                    {userForm.id !== 0 && (
                      <button type="button" onClick={() => setUserForm({ id: 0, name: "", username: "", password: "" })} className="rounded-md border border-neutral-700 px-4 py-2 text-sm text-neutral-200">
                        Batal
                      </button>
                    )}
                  </div>
                </form>
              </section>
            )}

            {activeTab === "produk" && (
              <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-md border border-neutral-800 bg-neutral-900/40 p-6">
                  <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                    <h2 className="text-xl font-semibold text-neutral-50">Daftar Produk</h2>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <input
                        value={produkTable.query}
                        onChange={(event) => setProdukTable((prev) => ({ ...prev, query: event.target.value, page: 1 }))}
                        className="h-10 rounded-md border border-neutral-800 bg-neutral-950 px-3 text-sm text-neutral-100"
                        placeholder="Cari produk/id"
                      />
                      <select
                        value={produkFilter}
                        onChange={(event) => {
                          setProdukFilter(event.target.value);
                          setProdukTable((prev) => ({ ...prev, page: 1 }));
                        }}
                        className="h-10 rounded-md border border-neutral-800 bg-neutral-950 px-3 text-sm text-neutral-100"
                      >
                        <option value="all">Semua harga</option>
                        <option value="low">&lt; 100 ribu</option>
                        <option value="mid">100-500 ribu</option>
                        <option value="high">&gt; 500 ribu</option>
                      </select>
                    </div>
                  </div>
                  {loading ? (
                    <TableSkeleton columns={4} />
                  ) : filteredProduk.length === 0 ? (
                    <EmptyState title="Produk tidak ditemukan" description="Ubah pencarian atau rentang harga, lalu coba lagi." />
                  ) : (
                    <>
                      <div className="overflow-auto">
                        <table className="w-full text-left text-sm">
                          <thead className="text-neutral-400">
                            <tr className="border-b border-neutral-800">
                              <th className="px-2 py-3">ID</th>
                              <th className="px-2 py-3">Nama</th>
                              <th className="px-2 py-3">Harga</th>
                              <th className="px-2 py-3">Aksi</th>
                            </tr>
                          </thead>
                          <tbody>
                            {pagedProduk.items.map((item) => (
                              <tr key={item.id} className="border-b border-neutral-800/70">
                                <td className="px-2 py-3 text-neutral-200">{item.id}</td>
                                <td className="px-2 py-3 text-neutral-100">{item.nama}</td>
                                <td className="px-2 py-3 text-neutral-300">{formatCurrency(item.harga)}</td>
                                <td className="px-2 py-3">
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => setProdukForm({ id: item.id, nama: item.nama, harga: String(item.harga) })}
                                      className="rounded-md border border-neutral-700 px-3 py-1 text-xs text-neutral-200 hover:border-neutral-500"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => handleDelete("produk", item.id)}
                                      className="rounded-md border border-red-600/60 px-3 py-1 text-xs text-red-300 hover:border-red-400"
                                    >
                                      Hapus
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <PaginationControls
                        page={pagedProduk.safePage}
                        totalPages={pagedProduk.totalPages}
                        pageSize={produkTable.pageSize}
                        totalItems={filteredProduk.length}
                        onPageChange={(page) => setProdukTable((prev) => ({ ...prev, page }))}
                        onPageSizeChange={(pageSize) => setProdukTable((prev) => ({ ...prev, pageSize, page: 1 }))}
                      />
                    </>
                  )}
                </div>

                <form onSubmit={handleProdukSubmit} className="rounded-md border border-neutral-800 bg-neutral-900/40 p-6">
                  <h3 className="mb-4 text-lg font-semibold text-neutral-50">{produkForm.id ? "Edit Produk" : "Tambah Produk"}</h3>
                  <div className="grid gap-4">
                    <FormField label="Nama Produk" error={produkErrors.nama}>
                      <input
                        value={produkForm.nama}
                        onChange={(event) => setProdukForm((prev) => ({ ...prev, nama: event.target.value }))}
                        className={`mt-2 w-full rounded-md border bg-neutral-950 px-3 py-2 text-neutral-100 ${produkErrors.nama ? "border-red-700" : "border-neutral-800"}`}
                        placeholder="Nama produk"
                      />
                    </FormField>
                    <FormField label="Harga" error={produkErrors.harga}>
                      <input
                        type="number"
                        min={0}
                        value={produkForm.harga}
                        onChange={(event) => setProdukForm((prev) => ({ ...prev, harga: event.target.value }))}
                        className={`mt-2 w-full rounded-md border bg-neutral-950 px-3 py-2 text-neutral-100 ${produkErrors.harga ? "border-red-700" : "border-neutral-800"}`}
                        placeholder="0"
                      />
                    </FormField>
                  </div>
                  <div className="mt-6 flex gap-3">
                    <button type="submit" disabled={saving} className="rounded-md bg-neutral-50 px-4 py-2 text-sm font-semibold text-neutral-900 hover:bg-white disabled:opacity-50">
                      {saving ? "Menyimpan..." : produkForm.id ? "Simpan Perubahan" : "Tambah Produk"}
                    </button>
                    {produkForm.id !== 0 && (
                      <button type="button" onClick={() => setProdukForm({ id: 0, nama: "", harga: "" })} className="rounded-md border border-neutral-700 px-4 py-2 text-sm text-neutral-200">
                        Batal
                      </button>
                    )}
                  </div>
                </form>
              </section>
            )}

            {activeTab === "transaksi" && (
              <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-md border border-neutral-800 bg-neutral-900/40 p-6">
                  <div className="mb-4 flex flex-col gap-3 2xl:flex-row 2xl:items-center 2xl:justify-between">
                    <h2 className="text-xl font-semibold text-neutral-50">Daftar Transaksi</h2>
                    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                      <input
                        value={transaksiTable.query}
                        onChange={(event) => setTransaksiTable((prev) => ({ ...prev, query: event.target.value, page: 1 }))}
                        className="h-10 rounded-md border border-neutral-800 bg-neutral-950 px-3 text-sm text-neutral-100"
                        placeholder="Cari transaksi"
                      />
                      <select
                        value={transaksiProdukFilter}
                        onChange={(event) => {
                          setTransaksiProdukFilter(event.target.value);
                          setTransaksiTable((prev) => ({ ...prev, page: 1 }));
                        }}
                        className="h-10 rounded-md border border-neutral-800 bg-neutral-950 px-3 text-sm text-neutral-100"
                      >
                        <option value="all">Semua produk</option>
                        {produk.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.nama}
                          </option>
                        ))}
                      </select>
                      <select
                        value={transaksiDateFilter}
                        onChange={(event) => {
                          setTransaksiDateFilter(event.target.value);
                          setTransaksiTable((prev) => ({ ...prev, page: 1 }));
                        }}
                        className="h-10 rounded-md border border-neutral-800 bg-neutral-950 px-3 text-sm text-neutral-100"
                      >
                        <option value="all">Semua tanggal</option>
                        <option value="today">Hari ini</option>
                        <option value="week">7 hari</option>
                        <option value="month">Bulan ini</option>
                      </select>
                    </div>
                  </div>
                  {loading ? (
                    <TableSkeleton columns={5} />
                  ) : filteredTransaksi.length === 0 ? (
                    <EmptyState title="Transaksi tidak ditemukan" description="Ubah pencarian, produk, atau filter tanggal untuk melihat data." />
                  ) : (
                    <>
                      <div className="overflow-auto">
                        <table className="w-full text-left text-sm">
                          <thead className="text-neutral-400">
                            <tr className="border-b border-neutral-800">
                              <th className="px-2 py-3">ID</th>
                              <th className="px-2 py-3">Produk</th>
                              <th className="px-2 py-3">Pembeli</th>
                              <th className="px-2 py-3">Total</th>
                              <th className="px-2 py-3">Aksi</th>
                            </tr>
                          </thead>
                          <tbody>
                            {pagedTransaksi.items.map((item) => (
                              <tr key={item.id} className="border-b border-neutral-800/70">
                                <td className="px-2 py-3 text-neutral-200">{item.id}</td>
                                <td className="px-2 py-3 text-neutral-100">{productName(item.produkId)}</td>
                                <td className="px-2 py-3 text-neutral-300">
                                  <p className="text-neutral-100">{item.namaPembeli}</p>
                                  <p className="text-xs text-neutral-500">{item.emailPembeli}</p>
                                </td>
                                <td className="px-2 py-3 text-neutral-200">{formatCurrency(item.totalHarga)}</td>
                                <td className="px-2 py-3">
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() =>
                                        setTransaksiForm({
                                          id: item.id,
                                          produkId: String(item.produkId),
                                          namaPembeli: item.namaPembeli,
                                          emailPembeli: item.emailPembeli,
                                          totalHarga: String(item.totalHarga),
                                        })
                                      }
                                      className="rounded-md border border-neutral-700 px-3 py-1 text-xs text-neutral-200 hover:border-neutral-500"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => handleDelete("transaksi", item.id)}
                                      className="rounded-md border border-red-600/60 px-3 py-1 text-xs text-red-300 hover:border-red-400"
                                    >
                                      Hapus
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <PaginationControls
                        page={pagedTransaksi.safePage}
                        totalPages={pagedTransaksi.totalPages}
                        pageSize={transaksiTable.pageSize}
                        totalItems={filteredTransaksi.length}
                        onPageChange={(page) => setTransaksiTable((prev) => ({ ...prev, page }))}
                        onPageSizeChange={(pageSize) => setTransaksiTable((prev) => ({ ...prev, pageSize, page: 1 }))}
                      />
                    </>
                  )}
                </div>

                <form onSubmit={handleTransaksiSubmit} className="rounded-md border border-neutral-800 bg-neutral-900/40 p-6">
                  <h3 className="mb-4 text-lg font-semibold text-neutral-50">{transaksiForm.id ? "Edit Transaksi" : "Tambah Transaksi"}</h3>
                  <div className="grid gap-4">
                    <FormField label="Produk" error={transaksiErrors.produkId}>
                      <select
                        value={transaksiForm.produkId}
                        onChange={(event) => setTransaksiForm((prev) => ({ ...prev, produkId: event.target.value }))}
                        className={`mt-2 w-full rounded-md border bg-neutral-950 px-3 py-2 text-neutral-100 ${transaksiErrors.produkId ? "border-red-700" : "border-neutral-800"}`}
                      >
                        <option value="">Pilih produk</option>
                        {produk.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.nama}
                          </option>
                        ))}
                      </select>
                    </FormField>
                    <FormField label="Nama Pembeli" error={transaksiErrors.namaPembeli}>
                      <input
                        value={transaksiForm.namaPembeli}
                        onChange={(event) => setTransaksiForm((prev) => ({ ...prev, namaPembeli: event.target.value }))}
                        className={`mt-2 w-full rounded-md border bg-neutral-950 px-3 py-2 text-neutral-100 ${transaksiErrors.namaPembeli ? "border-red-700" : "border-neutral-800"}`}
                        placeholder="Nama pembeli"
                      />
                    </FormField>
                    <FormField label="Email Pembeli" error={transaksiErrors.emailPembeli}>
                      <input
                        type="email"
                        value={transaksiForm.emailPembeli}
                        onChange={(event) => setTransaksiForm((prev) => ({ ...prev, emailPembeli: event.target.value }))}
                        className={`mt-2 w-full rounded-md border bg-neutral-950 px-3 py-2 text-neutral-100 ${transaksiErrors.emailPembeli ? "border-red-700" : "border-neutral-800"}`}
                        placeholder="email@contoh.com"
                      />
                    </FormField>
                    <FormField label="Total Harga" error={transaksiErrors.totalHarga}>
                      <input
                        type="number"
                        min={0}
                        value={transaksiForm.totalHarga}
                        onChange={(event) => setTransaksiForm((prev) => ({ ...prev, totalHarga: event.target.value }))}
                        className={`mt-2 w-full rounded-md border bg-neutral-950 px-3 py-2 text-neutral-100 ${transaksiErrors.totalHarga ? "border-red-700" : "border-neutral-800"}`}
                        placeholder="0"
                      />
                    </FormField>
                  </div>
                  <div className="mt-6 flex gap-3">
                    <button type="submit" disabled={saving} className="rounded-md bg-neutral-50 px-4 py-2 text-sm font-semibold text-neutral-900 hover:bg-white disabled:opacity-50">
                      {saving ? "Menyimpan..." : transaksiForm.id ? "Simpan Perubahan" : "Tambah Transaksi"}
                    </button>
                    {transaksiForm.id !== 0 && (
                      <button
                        type="button"
                        onClick={() => setTransaksiForm({ id: 0, produkId: "", namaPembeli: "", emailPembeli: "", totalHarga: "" })}
                        className="rounded-md border border-neutral-700 px-4 py-2 text-sm text-neutral-200"
                      >
                        Batal
                      </button>
                    )}
                  </div>
                </form>
              </section>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
