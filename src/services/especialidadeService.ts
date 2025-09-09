import { API_BASE, headers } from "@/utils/constants";
import { Especialidade } from "@/types/Especialidade";
const caminho = "Especialidades";
const elemento_singular = "especialidade";
const elemento_plural = "especialidade";

export async function getAll(): Promise<Especialidade[]> {
    const res = await fetch(`${API_BASE}/api/${caminho}`, {
        headers: headers(),
    });
    if (!res.ok) {
        const msg = await res.text();
        throw new Error(`Erro ${res.status} ao buscar ${elemento_plural}: ${msg}`);
    }
    const list: Especialidade[] = await res.json();
    return list;
}

export async function getElementById(id: number): Promise<Especialidade> {
    const res = await fetch(`${API_BASE}/api/${caminho}/${id}`, { headers: headers(), });
    if (!res.ok) {
        const msg = await res.text();
        throw new Error(`Erro ${res.status} ao buscar ${elemento_singular}: ${msg}`);
    }
    const apiData: Especialidade = await res.json();
    return apiData;
}

export async function createElement(data: Especialidade): Promise<void> {
    const res = await fetch(`${API_BASE}/api/${caminho}`, { method: "POST", headers: headers(), body: JSON.stringify(data) });
    if (!res.ok) {
        const msg = await res.text();
        throw new Error(`Erro ${res.status} ao criar ${elemento_singular}: ${msg}`);
    }
}
  
export async function updateElement(data: Especialidade): Promise<void> {
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

export type { Especialidade }