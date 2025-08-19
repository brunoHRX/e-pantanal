import { Patient } from "@/types/Patient";
import { API_BASE } from "@/utils/constants";

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
export async function createPatient(data: Patient): Promise<void> {
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


export type { Patient }