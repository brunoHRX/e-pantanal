import { API_BASE, headers } from "@/utils/constants";
import { AtendimentoFluxo } from "@/types/Fluxo";
const caminho = "Atendimentos";
const elemento_singular = "atendimento";

export async function getElementById(id: number): Promise<AtendimentoFluxo> {
    const res = await fetch(`${API_BASE}/api/${caminho}/${id}`, { headers: headers(), });
    if (!res.ok) {
        const msg = await res.text();
        throw new Error(`Erro ${res.status} ao buscar ${elemento_singular}: ${msg}`);
    }
    const apiData: AtendimentoFluxo = await res.json();
    return apiData;
}

export type { AtendimentoFluxo }