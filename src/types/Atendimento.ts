import { Medicamento } from "./Medicamento"
import { Procedimento } from "./Procedimento"

export type Atendimento = {
    id: number,
    evolucao: string,
    procedimentos: number[],
    cids: number[],
    medicamentos: AtendimentoMedicamento[],
    exames: number[],
    procedimentosOdontologicos: ToothSelection[]
}

export type AtendimentoMedicamento = {
    duracao: number,
    frequencia: string,
    medicamento: Medicamento,
    observacao: string    
}

const FACES = [
    { key: 'V', label: 'Vestibular' },
    { key: 'M', label: 'Mesial' },
    { key: 'D', label: 'Distal' },
    { key: 'L', label: 'Lingual/Palatina' },
    { key: 'O', label: 'Oclusal/Incisal' }
] as const
  
export type FaceKey = (typeof FACES)[number]['key']

export type ToothSelection = {
    tooth: number
    quadrant: number
    faces: FaceKey[]
    procedures: Procedimento[]
    notes?: string
}

export type EncaminhamentoMedico = {
    atendimentoId: number,
    especialidadeId: number,
    motivo?: string,
    pacienteId: number
}