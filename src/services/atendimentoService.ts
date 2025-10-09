import { API_BASE, headers } from "@/utils/constants";
import { AtendimentoFluxo } from "@/types/Fluxo";
import { Atendimento, FaceKey, ToothSelection, EncaminhamentoMedico } from "@/types/Atendimento";

const caminho = "Atendimentos";
const elemento_singular = "atendimento";

export async function getElementById(id: number): Promise<AtendimentoFluxo> {
  const res = await fetch(`${API_BASE}/api/${caminho}/${id}`, { headers: headers() });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`Erro ${res.status} ao buscar ${elemento_singular}: ${msg}`);
  }
  const apiData: AtendimentoFluxo = await res.json();
  return apiData;
}

/**
 * Retorna os atendimentos vinculados ao ID de PACIENTE.
 * Endpoint: GET /api/Atendimentos/{pacienteId}
 * Obs.: o backend pode retornar um único objeto ou uma lista — tratamos os dois casos.
 */
export async function getByPacienteId(pacienteId: number): Promise<AtendimentoFluxo[]> {
  const res = await fetch(`${API_BASE}/api/${caminho}/${pacienteId}`, { headers: headers() });
  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(`Erro ${res.status} ao buscar atendimentos do paciente: ${msg}`);
  }
  const data = await res.json();
  // normaliza para array
  const items = Array.isArray(data) ? data : [data];

  // se precisar mapear campos específicos, faça aqui; por ora, retornamos como AtendimentoFluxo
  return items as AtendimentoFluxo[];
}

export async function finalizarAtendimento(atendimento: Atendimento): Promise<void> {
  const res = await fetch(`${API_BASE}/api/${caminho}/finalizar`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(atendimento),
  });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`Erro ${res.status} ao finalizar ${elemento_singular}: ${msg}`);
  }
}

export async function encaminharAtendimento(encaminhamento: EncaminhamentoMedico): Promise<void> {
  const res = await fetch(`${API_BASE}/api/${caminho}/encaminhamento`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(encaminhamento),
  });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`Erro ${res.status} ao finalizar ${elemento_singular}: ${msg}`);
  }
}

export type { AtendimentoFluxo, FaceKey, ToothSelection, EncaminhamentoMedico };
