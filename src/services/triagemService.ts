import { Patient } from "@/types/Patient";
import { API_BASE, headers } from "@/utils/constants";

const caminho = "Triagens";
const elemento_singular = "triagem";
const elemento_plural = "triagens";

export async function getAllPatients(): Promise<Patient[]> {
    const res = await fetch(`${API_BASE}/api/${caminho}`, { headers: headers(), });
    if (!res.ok) {
      const msg = await res.text();
      throw new Error(`Erro ${res.status} ao buscar ${elemento_plural}: ${msg}`);
    }
    const list: Patient[] = await res.json();
    return list;
}

export type { Patient }