
export type Especialidade = { id: number; nome: string }

// --- Mocks (substituir por chamadas HTTP reais)
let MOCK_DB: Especialidade[] = [
  { id: 1, nome: 'Odontologia' },
  { id: 2, nome: 'Ortopedia' },
  { id: 3, nome: 'Clínico Geral' }
]

function delay(ms = 200) {
  return new Promise(res => setTimeout(res, ms))
}

export async function getAll(): Promise<Especialidade[]> {
  await delay()
  // Em produção: fetch('/api/especialidades')
  return [...MOCK_DB]
}

export async function getElementById(id: number): Promise<Especialidade> {
  await delay()
  const found = MOCK_DB.find(e => e.id === id)
  if (!found) throw new Error('Especialidade não encontrada')
  return { ...found }
}

export async function createElement(payload: Omit<Especialidade, 'id'> | Especialidade): Promise<Especialidade> {
  await delay()
  const nextId = (MOCK_DB.at(-1)?.id ?? 0) + 1
  const novo: Especialidade = { id: nextId, nome: (payload as Especialidade).nome }
  MOCK_DB.push(novo)
  return { ...novo }
}

export async function updateElement(payload: Especialidade): Promise<Especialidade> {
  await delay()
  const idx = MOCK_DB.findIndex(e => e.id === payload.id)
  if (idx === -1) throw new Error('Especialidade não encontrada')
  MOCK_DB[idx] = { ...payload }
  return { ...MOCK_DB[idx] }
}

export async function deleteElement(id: number): Promise<void> {
  await delay()
  MOCK_DB = MOCK_DB.filter(e => e.id !== id)
}
