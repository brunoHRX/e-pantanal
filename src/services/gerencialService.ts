import { API_BASE, headers } from "@/utils/constants";
import { AtendimentoGerencialFormType } from "@/types/Gerencial";
const caminho = "Gerencial";
const elemento_singular = "atendimento";
const elemento_plural = "atendimentos";

export async function getAll(): Promise<AtendimentoGerencialFormType[]> {
    const res = await fetch(`${API_BASE}/api/${caminho}`, {
        headers: headers(),
    });
    if (!res.ok) {
        const msg = await res.text();
        throw new Error(`Erro ${res.status} ao buscar ${elemento_plural}: ${msg}`);
    }
    const list: AtendimentoGerencialFormType[] = await res.json();
    return list;
}

export async function getElementById(id: number): Promise<AtendimentoGerencialFormType> {
    const res = await fetch(`${API_BASE}/api/${caminho}/${id}`, { headers: headers(), });
    if (!res.ok) {
        const msg = await res.text();
        throw new Error(`Erro ${res.status} ao buscar ${elemento_singular}: ${msg}`);
    }
    const apiData: AtendimentoGerencialFormType = await res.json();
    return apiData;
}

export async function createElement(data: AtendimentoGerencialFormType): Promise<void> {
    const res = await fetch(`${API_BASE}/api/${caminho}`, { method: "POST", headers: headers(), body: JSON.stringify(data) });
    if (!res.ok) {
        const msg = await res.text();
        throw new Error(`Erro ${res.status} ao criar ${elemento_singular}: ${msg}`);
    }
}
  
export async function updateElement(data: AtendimentoGerencialFormType): Promise<void> {
    const res = await fetch(`${API_BASE}/api/${caminho}/${data.id}`, { method: "PUT", headers: headers(), body: JSON.stringify(data) });
    if (!res.ok) {
      const msg = await res.text();
      throw new Error(`Erro ${res.status} ao atualizar ${elemento_singular}: ${msg}`);
    }
}
  
export async function deleteElement(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/api/${caminho}/${id}`, { method: "DELETE", headers: headers() });
    if (!res.ok) {
      const msg = await res.text();
      throw new Error(`Erro ${res.status} ao atualizar ${elemento_singular}: ${msg}`);
    }
}

export type { AtendimentoGerencialFormType }