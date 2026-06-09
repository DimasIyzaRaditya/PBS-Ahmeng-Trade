import styles from "./dashboard-ui.module.css";
import { FormField, cx } from "./ui";

type ValidationErrors<T extends string> = Partial<Record<T, string>>;

interface ProdukOption {
  id: number;
  nama: string;
}