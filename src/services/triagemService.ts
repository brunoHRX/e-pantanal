import { Patient } from "@/types/Patient";
import { TriagemFormData, TriagemUpdate } from "@/types/Triagem";
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

export async function getTriagemById(id: number): Promise<TriagemUpdate> {  
  const res = await fetch(`${API_BASE}/api/${caminho}/${id}`, { headers: headers(), });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`Erro ${res.status} ao buscar ${elemento_singular}: ${msg}`);
  }
  const apiData = (await res.json()) as TriagemUpdate;  
  return apiData;
}

export async function updateTriagem(data: TriagemFormData): Promise<void> {
  // const payload = toApiPayload(data);
  const res = await fetch(`${API_BASE}/api/Triagens/${data.id}`, { method: "PUT", headers: headers(), body: JSON.stringify(data) });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`Erro ${res.status} ao criar triagem: ${msg}`);
  }
}

export type { Patient, TriagemUpdate }