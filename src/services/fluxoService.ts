import { API_BASE, headers } from "@/utils/constants";
import { Especialidade } from "@/types/Especialidade";
import { AtendimentoFilas, AtendimentoFluxo, FilasFluxo } from "@/types/Fluxo";

const caminho = "Fluxo";
const elemento_singular = "atendimento";
const elemento_plural = "atendimentos";

export async function getAll(): Promise<AtendimentoFluxo[]> {
    const res = await fetch(`${API_BASE}/api/${caminho}`, { headers: headers() });
    if (!res.ok) {
        const msg = await res.text();
        throw new Error(`Erro ${res.status} ao buscar ${elemento_plural}: ${msg}`);
    }
    const list: AtendimentoFluxo[] = await res.json();
    return list;
}

export async function getFilas(): Promise<FilasFluxo> {
    const res = await fetch(`${API_BASE}/api/${caminho}/filas`, { headers: headers() });
    if (!res.ok) {
        const msg = await res.text();
        throw new Error(`Erro ${res.status} ao buscar filas: ${msg}`);
    }
    const list: FilasFluxo = await res.json();
    return list;
}

export async function encaminharPaciente(atendimento: number, fila: number): Promise<void> {
    const res = await fetch(`${API_BASE}/api/${caminho}/encaminhar/${atendimento}/${fila}`, { headers: headers() });
    if (!res.ok) {
        const msg = await res.text();
        throw new Error(`Erro ${res.status} ao buscar filas: ${msg}`);
    }
}

export async function removerPaciente(atendimento: number): Promise<void> {
    const res = await fetch(`${API_BASE}/api/${caminho}/remover/${atendimento}`, { headers: headers() });
    if (!res.ok) {
        const msg = await res.text();
        throw new Error(`Erro ${res.status} ao buscar filas: ${msg}`);
    }
}

export async function iniciarAtendimento(atendimento: number): Promise<void> {
    const res = await fetch(`${API_BASE}/api/${caminho}/atendimento/${atendimento}`, { headers: headers() });
    if (!res.ok) {
        const msg = await res.text();
        throw new Error(`Erro ${res.status} ao buscar filas: ${msg}`);
    }
}

export type { Especialidade, AtendimentoFluxo, AtendimentoFilas, FilasFluxo }