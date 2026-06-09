import styles from "./dashboard-ui.module.css";
import { FormField, cx } from "./ui";

type ValidationErrors<T extends string> = Partial<Record<T, string>>;

interface ProdukOption {
  id: number;
  nama: string;
}

function FormActions({
  saving,
  editing,
  addLabel,
  onCancel,
}: {
  saving: boolean;
  editing: boolean;
  addLabel: string;
  onCancel: () => void;
}) {
  return (
    <div className={styles.formActions}>
      <button type="submit" disabled={saving} className={styles.primaryButton}>
        {saving ? "Menyimpan..." : editing ? "Simpan Perubahan" : addLabel}
      </button>
      {editing && (
        <button type="button" onClick={onCancel} className={styles.button}>
          Batal
        </button>
      )}
    </div>
  );
}

export function UserForm({
  form,
  errors,
  saving,
  onChange,
  onSubmit,
  onCancel,
}: {
  form: { id: number; name: string; username: string; password: string };
  errors: ValidationErrors<"name" | "username" | "password">;
  saving: boolean;
  onChange: React.Dispatch<React.SetStateAction<{ id: number; name: string; username: string; password: string }>>;
  onSubmit: (event: React.FormEvent) => void;
  onCancel: () => void;
}) {
  return (
    <form onSubmit={onSubmit} className={styles.panel}>
      <h3 className={styles.chartTitle}>{form.id ? "Edit User" : "Tambah User"}</h3>
      <div className={styles.formGrid}>
        <FormField label="Nama" error={errors.name}>
          <input
            value={form.name}
            onChange={(event) => onChange((prev) => ({ ...prev, name: event.target.value }))}
            className={cx(styles.input, styles.fieldControl, errors.name && styles.inputError)}
            placeholder="Nama lengkap"
          />
        </FormField>
        <FormField label="Username" error={errors.username}>
          <input
            value={form.username}
            onChange={(event) => onChange((prev) => ({ ...prev, username: event.target.value }))}
            className={cx(styles.input, styles.fieldControl, errors.username && styles.inputError)}
            placeholder="username"
          />
        </FormField>
        <FormField label="Password" error={errors.password}>
          <input
            type="password"
            value={form.password}
            onChange={(event) => onChange((prev) => ({ ...prev, password: event.target.value }))}
            className={cx(styles.input, styles.fieldControl, errors.password && styles.inputError)}
            placeholder={form.id ? "Kosongkan jika tidak diganti" : "Password"}
          />
        </FormField>
      </div>
      <FormActions saving={saving} editing={form.id !== 0} addLabel="Tambah User" onCancel={onCancel} />
    </form>
  );
}

export function ProdukForm({
  form,
  errors,
  saving,
  onChange,
  onSubmit,
  onCancel,
}: {
  form: { id: number; nama: string; harga: string };
  errors: ValidationErrors<"nama" | "harga">;
  saving: boolean;
  onChange: React.Dispatch<React.SetStateAction<{ id: number; nama: string; harga: string }>>;
  onSubmit: (event: React.FormEvent) => void;
  onCancel: () => void;
}) {
  return (
    <form onSubmit={onSubmit} className={styles.panel}>
      <h3 className={styles.chartTitle}>{form.id ? "Edit Produk" : "Tambah Produk"}</h3>
      <div className={styles.formGrid}>
        <FormField label="Nama Produk" error={errors.nama}>
          <input
            value={form.nama}
            onChange={(event) => onChange((prev) => ({ ...prev, nama: event.target.value }))}
            className={cx(styles.input, styles.fieldControl, errors.nama && styles.inputError)}
            placeholder="Nama produk"
          />
        </FormField>
        <FormField label="Harga" error={errors.harga}>
          <input
            type="number"
            min={0}
            value={form.harga}
            onChange={(event) => onChange((prev) => ({ ...prev, harga: event.target.value }))}
            className={cx(styles.input, styles.fieldControl, errors.harga && styles.inputError)}
            placeholder="0"
          />
        </FormField>
      </div>
      <FormActions saving={saving} editing={form.id !== 0} addLabel="Tambah Produk" onCancel={onCancel} />
    </form>
  );
}