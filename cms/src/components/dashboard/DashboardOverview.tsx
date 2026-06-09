import styles from "./dashboard-ui.module.css";
import { ChartBar, EmptyState, TableSkeleton } from "./ui";

interface DailySale {
  label: string;
  total: number;
}

interface TopProduct {
  nama: string;
  count: number;
  revenue: number;
}

export function DashboardOverview({
  loading,
  totalUsers,
  totalProduk,
  revenue,
  dailySales,
  topProducts,
  maxDailySales,
  maxTopProductRevenue,
  formatCurrency,
}: {
  loading: boolean;
  totalUsers: number;
  totalProduk: number;
  revenue: number;
  dailySales: DailySale[];
  topProducts: TopProduct[];
  maxDailySales: number;
  maxTopProductRevenue: number;
  formatCurrency: (value: number) => string;
}) {
  return (
    <>
      <section className={styles.statsGrid}>
        {[
          ["Total User", totalUsers.toLocaleString("id-ID")],
          ["Total Produk", totalProduk.toLocaleString("id-ID")],
          ["Pendapatan", formatCurrency(revenue)],
        ].map(([label, value]) => (
          <div key={label} className={styles.statCard}>
            <p className={styles.statLabel}>{label}</p>
            <p className={styles.statValue}>{loading ? "..." : value}</p>
          </div>
        ))}
      </section>

      <section className={styles.chartGrid}>
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.chartTitle}>Penjualan Harian</h2>
            <p className={styles.mutedText}>7 label terakhir</p>
          </div>
          {loading ? (
            <TableSkeleton columns={4} />
          ) : dailySales.length === 0 ? (
            <EmptyState
              title="Belum ada grafik penjualan"
              description="Grafik akan muncul setelah transaksi memiliki data penjualan."
            />
          ) : (
            <div className={styles.chartBars}>
              {dailySales.map((item) => (
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

        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.chartTitle}>Top Produk</h2>
            <p className={styles.mutedText}>Berdasarkan revenue</p>
          </div>
          {loading ? (
            <TableSkeleton columns={3} />
          ) : topProducts.length === 0 ? (
            <EmptyState
              title="Belum ada top produk"
              description="Produk teratas akan dihitung dari transaksi yang sudah tersimpan."
            />
          ) : (
            <div className={styles.topProducts}>
              {topProducts.map((item) => (
                <div key={item.nama} className={styles.topProductItem}>
                  <div className={styles.topProductMeta}>
                    <span className={styles.strongText}>{item.nama}</span>
                    <span className={styles.mutedText}>{item.count} transaksi</span>
                  </div>
                  <div className={styles.progressTrack}>
                    <div
                      className={styles.progressFill}
                      style={{
                        width: `${maxTopProductRevenue ? (item.revenue / maxTopProductRevenue) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <p className={styles.subText}>{formatCurrency(item.revenue)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
