import { Consultorio } from "./Consultorio";
import { Fila } from "./Fila";
import { Patient } from "./Patient";
import { TriagemFormData } from "./Triagem";

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
    triagem?: TriagemFormData
}

export type AtendimentoFilas = {
    id: number,
    atendimento_id: number,    
    fila_id: number,
    fila: Fila,
    atendido: number
}