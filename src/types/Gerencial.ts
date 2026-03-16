import { Triagem } from "./Triagem"

export type AtendimentoGerencialProcedimento = {
    id?: number
    nome?: string
    dente?: string
}

export type AtendimentoGerencialMedicamento = {
    id?: number
    nome?: string
    frequencia?: string
    duracao?: number
}

export type AtendimentoGerencial = {
    especialidade_id: number
    medico_id?: number
    medico_nome?: string
    medico_registro?: string
    medico_especialidade_id?: number
    procedimentos: AtendimentoGerencialProcedimento[]
    medicamentos: AtendimentoGerencialMedicamento[]
}

export type AtendimentoGerencialFormType = {
    id?: number
    data_atendimento?: string
    paciente_id?: number
    paciente_nome?: string
    paciente_data_nascimento?:string
    atendimentos: AtendimentoGerencial[]
    triagem: Triagem
}