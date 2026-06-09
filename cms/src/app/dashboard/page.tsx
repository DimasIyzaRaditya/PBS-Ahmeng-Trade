"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ProdukForm, TransaksiForm, UserForm } from "@/components/dashboard/CrudForms";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import styles from "@/components/dashboard/dashboard-ui.module.css";
import {
  CrudSection,
  PaginationControls,
  RowActions,
  ToastStack,
  cx,
  type TableColumn,
  type Toast,
  type ToastType,
} from "@/components/dashboard/ui";

type TabKey = "dashboard" | "users" | "produk" | "transaksi";
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

const emptyPagination = { query: "", page: 1, pageSize: 5 };

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

export default function AdminPanel() {
  const router = useRouter();
  const toastIdRef = useRef(0);

  const [activeTab, setActiveTab] = useState<TabKey>("dashboard");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const [users, setUsers] = useState<User[]>([]);
  const [produk, setProduk] = useState<Produk[]>([]);
  const [transaksi, setTransaksi] = useState<Transaksi[]>([]);

  const [userTable, setUserTable] = useState<PaginationState>(emptyPagination);
  const [produkTable, setProdukTable] = useState<PaginationState>(emptyPagination);
  const [transaksiTable, setTransaksiTable] = useState<PaginationState>(emptyPagination);
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
    document.cookie = "cms_token=; Path=/; Max-Age=0";
    document.cookie = "cms_role=; Path=/; Max-Age=0";
    router.replace("/login");
  }, [router]);

  const loadAll = useCallback(
    async (token: string, showToast = true) => {
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
    },
    [addToast, handleLogout]
  );

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
    const dailyMap = new Map<string, number>();
    const topMap = new Map<number, { nama: string; count: number; revenue: number }>();

    transaksi.forEach((item) => {
      const date = parseDate(item.createdAt);
      const label = date ? date.toLocaleDateString("id-ID", { day: "2-digit", month: "short" }) : "Tanpa tanggal";
      const current = topMap.get(item.produkId) || { nama: productName(item.produkId), count: 0, revenue: 0 };

      dailyMap.set(label, (dailyMap.get(label) || 0) + item.totalHarga);
      topMap.set(item.produkId, {
        nama: current.nama,
        count: current.count + 1,
        revenue: current.revenue + item.totalHarga,
      });
    });

    return {
      revenue: transaksi.reduce((sum, item) => sum + (item.totalHarga || 0), 0),
      dailySales: Array.from(dailyMap.entries()).slice(-7).map(([label, total]) => ({ label, total })),
      topProducts: Array.from(topMap.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 5),
    };
  }, [productName, transaksi]);

  const filteredUsers = useMemo(() => {
    const query = userTable.query.toLowerCase().trim();
    return users.filter((user) => {
      const matchesSearch = user.name.toLowerCase().includes(query) || user.username.toLowerCase().includes(query);
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
      const matchesProduct = transaksiProdukFilter === "all" || item.produkId === Number(transaksiProdukFilter);
      const matchesDate =
        transaksiDateFilter === "all" ||
        (date &&
          ((transaksiDateFilter === "today" && date.toDateString() === now.toDateString()) ||
            (transaksiDateFilter === "week" && now.getTime() - date.getTime() <= 7 * 24 * 60 * 60 * 1000) ||
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
    const payload = {
      name: userForm.name.trim(),
      username: userForm.username.trim(),
      password: userForm.password.trim(),
    };
    const errors: ValidationErrors<"name" | "username" | "password"> = {};

    if (!authToken) return addToast("Sesi tidak valid", "error");
    if (!payload.name) errors.name = "Wajib diisi";
    if (!payload.username) errors.username = "Wajib diisi";
    if (!userForm.id && payload.password.length < 6) errors.password = "Minimal 6 karakter";

    setError(null);
    setUserErrors(errors);
    if (Object.keys(errors).length > 0) return addToast("Periksa kembali form user", "error");

    await saveData({
      url: userForm.id ? `${API_USER}/${userForm.id}` : API_USER,
      method: userForm.id ? "PATCH" : "POST",
      payload,
      successMessage: userForm.id ? "User berhasil diperbarui" : "User berhasil ditambahkan",
      reset: () => {
        setUserForm({ id: 0, name: "", username: "", password: "" });
        setUserErrors({});
      },
    });
  };

  const handleProdukSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const hargaValue = Number(produkForm.harga);
    const errors: ValidationErrors<"nama" | "harga"> = {};

    if (!authToken) return addToast("Sesi tidak valid", "error");
    if (!produkForm.nama.trim()) errors.nama = "Wajib diisi";
    if (!produkForm.harga || Number.isNaN(hargaValue) || hargaValue < 0) errors.harga = "Masukkan angka valid";

    setError(null);
    setProdukErrors(errors);
    if (Object.keys(errors).length > 0) return addToast("Periksa kembali form produk", "error");

    await saveData({
      url: produkForm.id ? `${API_PRODUK}/${produkForm.id}` : API_PRODUK,
      method: produkForm.id ? "PATCH" : "POST",
      payload: { nama: produkForm.nama.trim(), harga: hargaValue },
      successMessage: produkForm.id ? "Produk berhasil diperbarui" : "Produk berhasil ditambahkan",
      reset: () => {
        setProdukForm({ id: 0, nama: "", harga: "" });
        setProdukErrors({});
      },
    });
  };

  const handleTransaksiSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const produkIdValue = Number(transaksiForm.produkId);
    const totalHargaValue = Number(transaksiForm.totalHarga);
    const errors: ValidationErrors<"produkId" | "namaPembeli" | "emailPembeli" | "totalHarga"> = {};

    if (!authToken) return addToast("Sesi tidak valid", "error");
    if (!produkIdValue) errors.produkId = "Pilih produk";
    if (!transaksiForm.namaPembeli.trim()) errors.namaPembeli = "Wajib diisi";
    if (!isValidEmail(transaksiForm.emailPembeli.trim())) errors.emailPembeli = "Email tidak valid";
    if (!transaksiForm.totalHarga || Number.isNaN(totalHargaValue) || totalHargaValue < 0) {
      errors.totalHarga = "Masukkan angka valid";
    }

    setError(null);
    setTransaksiErrors(errors);
    if (Object.keys(errors).length > 0) return addToast("Periksa kembali form transaksi", "error");

    await saveData({
      url: transaksiForm.id ? `${API_TRANSAKSI}/${transaksiForm.id}` : API_TRANSAKSI,
      method: transaksiForm.id ? "PATCH" : "POST",
      payload: {
        produkId: produkIdValue,
        namaPembeli: transaksiForm.namaPembeli.trim(),
        emailPembeli: transaksiForm.emailPembeli.trim(),
        totalHarga: totalHargaValue,
      },
      successMessage: transaksiForm.id ? "Transaksi berhasil diperbarui" : "Transaksi berhasil ditambahkan",
      reset: () => {
        setTransaksiForm({ id: 0, produkId: "", namaPembeli: "", emailPembeli: "", totalHarga: "" });
        setTransaksiErrors({});
      },
    });
  };

  const saveData = async ({
    url,
    method,
    payload,
    successMessage,
    reset,
  }: {
    url: string;
    method: "POST" | "PATCH";
    payload: unknown;
    successMessage: string;
    reset: () => void;
  }) => {
    if (!authToken) return;
    setSaving(true);
    try {
      const res = await fetch(url, {
        method,
        headers: buildAuthHeaders(authToken, true),
        body: JSON.stringify(payload),
      });

      if (res.status === 401) return handleLogout();
      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.message || "Gagal menyimpan data");
      }

      reset();
      addToast(successMessage, "success");
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
    if (!authToken) return addToast("Sesi tidak valid", "error");

    const url =
      resource === "user"
        ? `${API_USER}/${id}`
        : resource === "produk"
        ? `${API_PRODUK}/${id}`
        : `${API_TRANSAKSI}/${id}`;

    setSaving(true);
    setError(null);
    try {
      const res = await fetch(url, { method: "DELETE", headers: buildAuthHeaders(authToken) });
      if (res.status === 401) return handleLogout();
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

  const userColumns: TableColumn<User>[] = [
    { key: "id", header: "ID", render: (user) => user.id },
    { key: "name", header: "Nama", render: (user) => <span className={styles.strongText}>{user.name}</span> },
    { key: "username", header: "Username", render: (user) => user.username },
    {
      key: "actions",
      header: "Aksi",
      render: (user) => (
        <RowActions
          onEdit={() => setUserForm({ id: user.id, name: user.name, username: user.username, password: "" })}
          onDelete={() => handleDelete("user", user.id)}
        />
      ),
    },
  ];

  const produkColumns: TableColumn<Produk>[] = [
    { key: "id", header: "ID", render: (item) => item.id },
    { key: "nama", header: "Nama", render: (item) => <span className={styles.strongText}>{item.nama}</span> },
    { key: "harga", header: "Harga", render: (item) => formatCurrency(item.harga) },
    {
      key: "actions",
      header: "Aksi",
      render: (item) => (
        <RowActions
          onEdit={() => setProdukForm({ id: item.id, nama: item.nama, harga: String(item.harga) })}
          onDelete={() => handleDelete("produk", item.id)}
        />
      ),
    },
  ];

  const transaksiColumns: TableColumn<Transaksi>[] = [
    { key: "id", header: "ID", render: (item) => item.id },
    { key: "produk", header: "Produk", render: (item) => <span className={styles.strongText}>{productName(item.produkId)}</span> },
    {
      key: "pembeli",
      header: "Pembeli",
      render: (item) => (
        <>
          <p className={styles.strongText}>{item.namaPembeli}</p>
          <p className={styles.subText}>{item.emailPembeli}</p>
        </>
      ),
    },
    { key: "total", header: "Total", render: (item) => formatCurrency(item.totalHarga) },
    {
      key: "actions",
      header: "Aksi",
      render: (item) => (
        <RowActions
          onEdit={() =>
            setTransaksiForm({
              id: item.id,
              produkId: String(item.produkId),
              namaPembeli: item.namaPembeli,
              emailPembeli: item.emailPembeli,
              totalHarga: String(item.totalHarga),
            })
          }
          onDelete={() => handleDelete("transaksi", item.id)}
        />
      ),
    },
  ];

  return (
    <div className={styles.page}>
      <ToastStack toasts={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((toast) => toast.id !== id))} />

      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.brand}>
            <Image src="/assets/logo.png" alt="Ahmeng Trade" width={40} height={40} className={styles.logo} />
            <div>
              <p className={styles.eyebrow}>Ahmeng Trade</p>
              <h1 className={styles.title}>CMS Admin Panel</h1>
            </div>
          </div>
          <div className={styles.headerActions}>
            <div>
              <p className={styles.apiLabel}>API Base</p>
              <p>{API_BASE}</p>
            </div>
            <button onClick={() => authToken && void loadAll(authToken)} className={styles.button}>
              Refresh
            </button>
            <button onClick={handleLogout} className={styles.button}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.layout}>
          <aside className={styles.sidebar}>
            <div>
              <p className={styles.eyebrow}>Navigasi</p>
              <p className={styles.sidebarText}>Kelola data user, produk, dan transaksi dalam satu panel.</p>
            </div>
            <TabButtons tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
          </aside>

          <div className={styles.content}>
            <div className={styles.mobileTabs}>
              <TabButtons tabs={tabs} activeTab={activeTab} onChange={setActiveTab} mobile />
            </div>

            {error && <div className={styles.alert}>{error}</div>}

            {activeTab === "dashboard" && (
              <DashboardOverview
                loading={loading}
                totalUsers={users.length}
                totalProduk={produk.length}
                revenue={dashboardStats.revenue}
                dailySales={dashboardStats.dailySales}
                topProducts={dashboardStats.topProducts}
                maxDailySales={maxDailySales}
                maxTopProductRevenue={maxTopProductRevenue}
                formatCurrency={formatCurrency}
              />
            )}

            {activeTab === "users" && (
              <CrudSection
                title="Daftar User"
                toolbar={
                  <div className={styles.toolbar}>
                    <input
                      value={userTable.query}
                      onChange={(event) => setUserTable((prev) => ({ ...prev, query: event.target.value, page: 1 }))}
                      className={styles.input}
                      placeholder="Cari nama/username"
                    />
                    <select
                      value={userFilter}
                      onChange={(event) => {
                        setUserFilter(event.target.value);
                        setUserTable((prev) => ({ ...prev, page: 1 }));
                      }}
                      className={styles.select}
                    >
                      <option value="all">Semua user</option>
                      <option value="admin">Admin</option>
                      <option value="non-admin">Non-admin</option>
                    </select>
                  </div>
                }
                loading={loading}
                rows={pagedUsers.items}
                columns={userColumns}
                emptyTitle="User tidak ditemukan"
                emptyDescription="Ubah pencarian atau filter, lalu coba lagi."
                pagination={renderPagination(userTable, pagedUsers, filteredUsers.length, setUserTable)}
                form={
                  <UserForm
                    form={userForm}
                    errors={userErrors}
                    saving={saving}
                    onChange={setUserForm}
                    onSubmit={handleUserSubmit}
                    onCancel={() => setUserForm({ id: 0, name: "", username: "", password: "" })}
                  />
                }
                skeletonColumns={4}
              />
            )}

            {activeTab === "produk" && (
              <CrudSection
                title="Daftar Produk"
                toolbar={
                  <div className={styles.toolbar}>
                    <input
                      value={produkTable.query}
                      onChange={(event) => setProdukTable((prev) => ({ ...prev, query: event.target.value, page: 1 }))}
                      className={styles.input}
                      placeholder="Cari produk/id"
                    />
                    <select
                      value={produkFilter}
                      onChange={(event) => {
                        setProdukFilter(event.target.value);
                        setProdukTable((prev) => ({ ...prev, page: 1 }));
                      }}
                      className={styles.select}
                    >
                      <option value="all">Semua harga</option>
                      <option value="low">&lt; 100 ribu</option>
                      <option value="mid">100-500 ribu</option>
                      <option value="high">&gt; 500 ribu</option>
                    </select>
                  </div>
                }
                loading={loading}
                rows={pagedProduk.items}
                columns={produkColumns}
                emptyTitle="Produk tidak ditemukan"
                emptyDescription="Ubah pencarian atau rentang harga, lalu coba lagi."
                pagination={renderPagination(produkTable, pagedProduk, filteredProduk.length, setProdukTable)}
                form={
                  <ProdukForm
                    form={produkForm}
                    errors={produkErrors}
                    saving={saving}
                    onChange={setProdukForm}
                    onSubmit={handleProdukSubmit}
                    onCancel={() => setProdukForm({ id: 0, nama: "", harga: "" })}
                  />
                }
                skeletonColumns={4}
              />
            )}

            {activeTab === "transaksi" && (
              <CrudSection
                title="Daftar Transaksi"
                toolbar={
                  <div className={styles.transactionToolbar}>
                    <input
                      value={transaksiTable.query}
                      onChange={(event) => setTransaksiTable((prev) => ({ ...prev, query: event.target.value, page: 1 }))}
                      className={styles.input}
                      placeholder="Cari transaksi"
                    />
                    <select
                      value={transaksiProdukFilter}
                      onChange={(event) => {
                        setTransaksiProdukFilter(event.target.value);
                        setTransaksiTable((prev) => ({ ...prev, page: 1 }));
                      }}
                      className={styles.select}
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
                      className={styles.select}
                    >
                      <option value="all">Semua tanggal</option>
                      <option value="today">Hari ini</option>
                      <option value="week">7 hari</option>
                      <option value="month">Bulan ini</option>
                    </select>
                  </div>
                }
                loading={loading}
                rows={pagedTransaksi.items}
                columns={transaksiColumns}
                emptyTitle="Transaksi tidak ditemukan"
                emptyDescription="Ubah pencarian, produk, atau filter tanggal untuk melihat data."
                pagination={renderPagination(transaksiTable, pagedTransaksi, filteredTransaksi.length, setTransaksiTable)}
                form={
                  <TransaksiForm
                    form={transaksiForm}
                    produk={produk}
                    errors={transaksiErrors}
                    saving={saving}
                    onChange={setTransaksiForm}
                    onSubmit={handleTransaksiSubmit}
                    onCancel={() => setTransaksiForm({ id: 0, produkId: "", namaPembeli: "", emailPembeli: "", totalHarga: "" })}
                  />
                }
                skeletonColumns={5}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function renderPagination<T>(
  table: PaginationState,
  paged: { safePage: number; totalPages: number; items: T[] },
  totalItems: number,
  setTable: React.Dispatch<React.SetStateAction<PaginationState>>
) {
  return (
    <PaginationControls
      page={paged.safePage}
      totalPages={paged.totalPages}
      pageSize={table.pageSize}
      totalItems={totalItems}
      pageSizeOptions={PAGE_SIZE_OPTIONS}
      onPageChange={(page) => setTable((prev) => ({ ...prev, page }))}
      onPageSizeChange={(pageSize) => setTable((prev) => ({ ...prev, pageSize, page: 1 }))}
    />
  );
}

function TabButtons({
  tabs,
  activeTab,
  onChange,
  mobile = false,
}: {
  tabs: Array<{ key: TabKey; label: string }>;
  activeTab: TabKey;
  onChange: (tab: TabKey) => void;
  mobile?: boolean;
}) {
  return (
    <div className={mobile ? styles.mobileTabs : styles.tabList}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={cx(mobile ? styles.mobileTabButton : styles.tabButton, activeTab === tab.key && styles.activeTab)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
