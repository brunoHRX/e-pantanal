import { Especialidade } from "./Especialidade"

export type Usuario = {
    id: number,
    usuario: string,
    email?: string,
    registro?: string,
    uf?: string,
    sigla?: string,
    especialidade_id?: number,
    especialidade: Especialidade
}