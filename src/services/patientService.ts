// src/services/patientService.ts

export type NewPatientForm = {
  nome: string;
  dataNascimento: string;
  cpf: string;
  filiacao1: string;
  filiacao2: string;
  cor: string;
  sex: string;
  tipoSanguineo: string;
  relacaoLocal: string;
  fazendaReferencia?: string;
  relacaoFamiliar?: string;
  escolaridade: string;
  pne: boolean;
};

export type ApiPatientPayload = {
  nome: NewPatientForm["nome"];
  data_nascimento: NewPatientForm["dataNascimento"];
  cpf: NewPatientForm["cpf"];
  filiacao_1: NewPatientForm["filiacao1"];
  filiacao_2: NewPatientForm["filiacao2"];
  cor: NewPatientForm["cor"];
  sexo: NewPatientForm["sex"];
  tipo_sanguineo: NewPatientForm["tipoSanguineo"];
  relacao_local: NewPatientForm["relacaoLocal"];
  fazenda_referencia?: NewPatientForm["fazendaReferencia"];
  relacao_familiar?: NewPatientForm["relacaoFamiliar"];
  escolaridade: NewPatientForm["escolaridade"];
  deficiencia: NewPatientForm["pne"];
};

// Esse tipo espelha exatamente o JSON da API
export type ApiPatientResponse = ApiPatientPayload & {
  id: string;
  created_at: string;
  updated_at: string;
  // deleted_at?: string | null;
  // quaisquer outros campos brutos que a API devolva…
};

// Tipo para uso no front-end, já em camelCase, com id
export interface Patient extends NewPatientForm {
  id: string;
  ultimaAtualizacao: string; // = updated_at
  nomeMae: string;            // = filiacao1
  nomePai: string;            // = filiacao2
  local: string;              // = relacao_local
}

// utilitário para converter NewPatientForm → ApiPatientPayload
function toApiPayload(data: NewPatientForm): ApiPatientPayload {
  return {
    nome: data.nome,
    data_nascimento: data.dataNascimento,
    cpf: data.cpf,
    filiacao_1: data.filiacao1,
    filiacao_2: data.filiacao2,
    cor: data.cor,
    sexo: data.sex,
    tipo_sanguineo: data.tipoSanguineo,
    relacao_local: data.relacaoLocal,
    fazenda_referencia: data.fazendaReferencia,
    relacao_familiar: data.relacaoFamiliar,
    escolaridade: data.escolaridade,
    deficiencia: data.pne,
  };
}

// utilitário para mapear a resposta da API em Patient
function mapApiToPatient(api: ApiPatientResponse): Patient {
  return {
    // campos do formulário
    nome: api.nome,
    dataNascimento: api.data_nascimento,
    cpf: api.cpf,
    filiacao1: api.filiacao_1,
    filiacao2: api.filiacao_2,
    cor: api.cor,
    sex: api.sexo,
    tipoSanguineo: api.tipo_sanguineo,
    relacaoLocal: api.relacao_local,
    fazendaReferencia: api.fazenda_referencia,
    relacaoFamiliar: api.relacao_familiar,
    escolaridade: api.escolaridade,
    pne: api.deficiencia,

    // metadados
    id: api.id,
    ultimaAtualizacao: api.updated_at,

    // aliases para a UI
    nomeMae: api.filiacao_1,
    nomePai: api.filiacao_2,
    local: api.relacao_local,
  };
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://www.apiepantanal.kinghost.net";

// busca TODOS os pacientes, já como Patient[]
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
  const list: ApiPatientResponse[] = await res.json();
  return list.map(mapApiToPatient);
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
  const apiData: ApiPatientResponse = await res.json();
  return mapApiToPatient(apiData);
}

// cria paciente
export async function createPatient(data: NewPatientForm): Promise<void> {
  const payload = toApiPayload(data);
  const res = await fetch(`${API_BASE}/api/Pacientes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("authToken")}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`Erro ${res.status} ao criar paciente: ${msg}`);
  }
}

// atualiza paciente
export async function updatePatient(id: string, data: NewPatientForm): Promise<void> {
  const payload = toApiPayload(data);
  const res = await fetch(`${API_BASE}/api/Pacientes/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("authToken")}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`Erro ${res.status} ao atualizar paciente: ${msg}`);
  }
}
