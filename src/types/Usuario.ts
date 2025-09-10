import { Especialidade } from "./Especialidade"

export type Usuario = {
    id: number,
    usuario: string,
    email?: string,
    especialidade_id?: number,
    especialidade: Especialidade
}