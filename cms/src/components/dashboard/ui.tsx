import styles from "./dashboard-ui.module.css";

export type ToastType = "success" | "error" | "info";

export interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

export const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className={styles.emptyState}>
      <p className={styles.emptyTitle}>{title}</p>
      <p className={styles.emptyDescription}>{description}</p>
    </div>
  );
}

export function TableSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <div className={styles.skeleton}>
      {Array.from({ length: 6 }).map((_, row) => (
        <div
          key={row}
          className={styles.skeletonRow}
          style={{ gridTemplateColumns: `repeat(${columns}, minmax(110px, 1fr))` }}
        >
          {Array.from({ length: columns }).map((__, column) => (
            <div key={column} className={styles.skeletonCell} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function FormField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={styles.field}>
      <span className={styles.fieldLabel}>
        {label}
        {error && <span className={styles.fieldError}>{error}</span>}
      </span>
      {children}
    </label>
  );
}

export function ToastStack({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  if (toasts.length === 0) return null;

  return (
    <div className={styles.toastStack}>
      {toasts.map((toast) => (
        <button
          key={toast.id}
          onClick={() => onDismiss(toast.id)}
          className={cx(
            styles.toast,
            toast.type === "success" && styles.toastSuccess,
            toast.type === "error" && styles.toastError,
            toast.type === "info" && styles.toastInfo
          )}
        >
          {toast.message}
        </button>
      ))}
    </div>
  );
}

export function PaginationControls({
  page,
  totalPages,
  pageSize,
  totalItems,
  pageSizeOptions,
  onPageChange,
  onPageSizeChange,
}: {
  page: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  pageSizeOptions: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}) {
  return (
    <div className={styles.pagination}>
      <p>
        {totalItems} data, halaman {page} dari {totalPages}
      </p>
      <div className={styles.paginationActions}>
        <select
          value={pageSize}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
          className={styles.select}
        >
          {pageSizeOptions.map((option) => (
            <option key={option} value={option}>
              {option}/hal
            </option>
          ))}
        </select>
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className={styles.paginationButton}
        >
          Prev
        </button>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className={styles.paginationButton}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export function ChartBar({
  label,
  value,
  max,
  caption,
}: {
  label: string;
  value: number;
  max: number;
  caption: string;
}) {
  const height = max > 0 ? Math.max(8, Math.round((value / max) * 120)) : 8;

  return (
    <div className={styles.chartBar}>
      <div className={styles.barTrack}>
        <div className={styles.barFill} style={{ height }} />
      </div>
      <div className={styles.chartCaption}>
        <p className={styles.chartLabel}>{label}</p>
        <p className={styles.chartValue}>{caption}</p>
      </div>
    </div>
  );
}

export interface TableColumn<T> {
  key: string;
  header: string;
  render: (item: T) => React.ReactNode;
}

export function DataTable<T>({ columns, rows }: { columns: TableColumn<T>[]; rows: T[] }) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              {columns.map((column) => (
                <td key={column.key}>{column.render(row)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function CrudSection<T>({
  title,
  toolbar,
  loading,
  rows,
  columns,
  emptyTitle,
  emptyDescription,
  pagination,
  form,
  skeletonColumns,
}: {
  title: string;
  toolbar: React.ReactNode;
  loading: boolean;
  rows: T[];
  columns: TableColumn<T>[];
  emptyTitle: string;
  emptyDescription: string;
  pagination: React.ReactNode;
  form: React.ReactNode;
  skeletonColumns: number;
}) {
  return (
    <section className={styles.crudGrid}>
      <div className={styles.panel}>
        <div className={styles.tableHeader}>
          <h2 className={styles.panelTitle}>{title}</h2>
          {toolbar}
        </div>
        {loading ? (
          <TableSkeleton columns={skeletonColumns} />
        ) : rows.length === 0 ? (
          <EmptyState title={emptyTitle} description={emptyDescription} />
        ) : (
          <>
            <DataTable columns={columns} rows={rows} />
            {pagination}
          </>
        )}
      </div>
      {form}
    </section>
  );
}

export function RowActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <div className={styles.rowActions}>
      <button onClick={onEdit} className={styles.editButton}>
        Edit
      </button>
      <button onClick={onDelete} className={styles.dangerButton}>
        Hapus
      </button>
    </div>
  );
}
