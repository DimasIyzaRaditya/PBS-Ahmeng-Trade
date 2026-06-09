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