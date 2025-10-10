import { API_BASE, headers } from "@/utils/constants";
import { AtendimentoHistoricoDto, Historico } from "@/types/Historico";
const caminho = "Historico";
const elemento_singular = "histórico";
const elemento_plural = "históricos";

export async function getAll(): Promise<Historico[]> {
    const res = await fetch(`${API_BASE}/api/${caminho}`, {
        headers: headers(),
    });
    if (!res.ok) {
        const msg = await res.text();
        throw new Error(`Erro ${res.status} ao buscar ${elemento_plural}: ${msg}`);
    }
    const list: Historico[] = await res.json();
    return list;
}

export type { Historico, AtendimentoHistoricoDto }