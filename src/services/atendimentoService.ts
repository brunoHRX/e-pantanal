import { API_BASE, headers } from "@/utils/constants";
import { AtendimentoFluxo } from "@/types/Fluxo";
import { Atendimento } from "@/types/Atendimento";
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

export async function finalizarAtendimento(atendimento: Atendimento): Promise<void> { 
    const res = await fetch(`${API_BASE}/api/${caminho}/finalizar`, { method: "POST", headers: headers(), body: JSON.stringify(atendimento) });
    if (!res.ok) {
        const msg = await res.text();
        throw new Error(`Erro ${res.status} ao finalizar ${elemento_singular}: ${msg}`);
    }
}

export type { AtendimentoFluxo }