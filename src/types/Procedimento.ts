import { Especialidade } from "./Especialidade"

export type Procedimento = {
    id: number,
    nome: string,
    especialidade_id: number,
    especialidade: Especialidade
}