import { Cid } from "./Cid";
import { Consultorio } from "./Consultorio";
import { Fila } from "./Fila";
import { Patient } from "./Patient";
import { Usuario } from "./Usuario";

export type AtendimentoFluxo = {
    id: number,
    paciente_id: number,
    paciente: Patient,
    status: string,
    fila_id?: number,
    fila?: Fila,
    consultorio_id?: number,
    consultorio?: Consultorio,
    entrada: string,
    saida?: string,
    observacao?: string,
    filas?: AtendimentoFilas[],
    triagem?: TriagemFluxo
    cids?: Cid[],
}

export type AtendimentoFilas = {
    id: number,
    atendimento_id: number,    
    fila_id: number,
    fila: Fila,
    atendido: number
}

export type FilasFluxo = {
    id: number,
    total: number
    filas: FilaFluxo[]
}

export type FilaFluxo = {
    id: number,
    nome: string,
    quantidade: number
}

export type TriagemFluxo = {
    id: number,
    usuario?: Usuario,
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