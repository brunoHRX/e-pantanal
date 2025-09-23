import { Cid } from "@/types/Cid";
import { API_BASE, headers } from "@/utils/constants";
const caminho = "Cids";
const elemento_singular = "cid";
const elemento_plural = "cids";

export async function getAll(): Promise<Cid[]> {
    const res = await fetch(`${API_BASE}/api/${caminho}`, {
        headers: headers(),
    });
    if (!res.ok) {
        const msg = await res.text();
        throw new Error(`Erro ${res.status} ao buscar ${elemento_plural}: ${msg}`);
    }
    const list: Cid[] = await res.json();
    return list;
}

export type { Cid }