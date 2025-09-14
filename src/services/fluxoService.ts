import { API_BASE, headers } from "@/utils/constants";
import { Especialidade } from "@/types/Especialidade";
import { AtendimentoFluxo } from "@/types/Fluxo";

const caminho = "Fluxo";
const elemento_singular = "atendimento";
const elemento_plural = "atendimentos";

export async function getAll(): Promise<AtendimentoFluxo[]> {
    const res = await fetch(`${API_BASE}/api/${caminho}`, {
        headers: headers(),
    });
    if (!res.ok) {
        const msg = await res.text();
        throw new Error(`Erro ${res.status} ao buscar ${elemento_plural}: ${msg}`);
    }
    const list: AtendimentoFluxo[] = await res.json();
    return list;
}

export type { Especialidade, AtendimentoFluxo }