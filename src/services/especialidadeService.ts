import { Especialidade } from "@/types/Especialidade";
import { API_BASE, headers } from "@/utils/constants";

const caminho = "Especialidades";
const elemento_singular = "especialidade";
const elemento_plural = "especialidades";

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