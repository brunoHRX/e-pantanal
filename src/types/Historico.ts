import { Patient } from "./Patient";

export type Historico = {
    paciente: Patient,
    total_atendimentos: number,
    atendimentos: AtendimentoHistoricoDto[],
}

export type AtendimentoHistoricoDto = {
    id: number,
    usuario_id: number,
    usuario: UsuarioHistoricoDto,
    status: string,
    entrada: string,
    saida: string,
    atendimento_filas: AtendimentoFilaHistoricoDto[],
    triagem: TriagemHistoricoDto,
}

export type TriagemHistoricoDto = {
    usuario_id: number,
    usuario: UsuarioHistoricoDto,
    data: string,
    observacao: string,
    peso: number,
    queixa: string,
    temperatura: number,
    fr: string,
    sato2: string,
    pa: string,
    fc: string,
    comorbidades: string,
    medicacao24h: string,
    alergias: string,
    prioridade: string,
}

export type AtendimentoFilaHistoricoDto = {
    evolucao: string,
    usuario_id: number,
    usuario: UsuarioHistoricoDto,
    atendido: boolean,
    receita: ReceitaHistoricoDto,
}

export type ReceitaHistoricoDto = {
    id: number,
    medicamentos: ReceitaMedicamentoHistoricoDto[],
}

export type ReceitaMedicamentoHistoricoDto = {
    id: number
    nome: string,
    dosagem: string,
    frequencia: string,
    duracao: string,
    orientacao?: string,
}

export type UsuarioHistoricoDto = {
    id: number,
    nome: string,
}