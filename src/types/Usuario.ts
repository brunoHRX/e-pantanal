import { Especialidade } from "./Especialidade"

export type Usuario = {
    id: number,
    usuario: string,
    email?: string,
    registro?: string,
    uf?: string,
    sigla?: string,
    ativo?: boolean,
    tipo_atendimento?: string,
    especialidade_id?: number,
    especialidade: Especialidade
}