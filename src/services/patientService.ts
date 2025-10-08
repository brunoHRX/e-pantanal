import { Especialidade } from "@/types/Especialidade";
import { Patient } from "@/types/Patient";
import { TriagemFormData } from "@/types/Triagem";
import { API_BASE, headers } from "@/utils/constants";




export async function getAllPatients(): Promise<Patient[]> {
  const res = await fetch(`${API_BASE}/api/Pacientes`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("authToken")}`,
    },
  });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`Erro ${res.status} ao buscar pacientes: ${msg}`);
  }
  const list: Patient[] = await res.json();
  return list;
}

// busca só UM paciente pelo ID
export async function getPatientById(id: string): Promise<Patient> {
  const res = await fetch(`${API_BASE}/api/Pacientes/${id}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("authToken")}`,
    },
  });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`Erro ${res.status} ao buscar paciente: ${msg}`);
  }
  const apiData: Patient = await res.json();
  return apiData;
}

// cria paciente
export async function createPatient(data: Patient): Promise<Patient> {
  // const payload = toApiPayload(data);
  const res = await fetch(`${API_BASE}/api/Pacientes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("authToken")}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`Erro ${res.status} ao criar paciente: ${msg}`);
  }
  const paciente: Patient = await res.json();
  return paciente; 
}

// atualiza paciente
export async function updatePatient(id: number, data: Patient): Promise<void> {
  // const payload = toApiPayload(data);
  const res = await fetch(`${API_BASE}/api/Pacientes/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("authToken")}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`Erro ${res.status} ao atualizar paciente: ${msg}`);
  }
}

export async function submitTriagem(data: TriagemFormData): Promise<void> {
  // const payload = toApiPayload(data);
  const res = await fetch(`${API_BASE}/api/Triagens`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("authToken")}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`Erro ${res.status} ao criar triagem: ${msg}`);
  }
}

export async function startAtendimento(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/Pacientes/atendimento/${id}`, { headers: headers(), });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`Erro ${res.status} ao criar atendimento: ${msg}`);
  }
}

export type { Patient, TriagemFormData, Especialidade }