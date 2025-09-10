import { Especialidade } from "./Especialidade"

export type Fila = {
    id: number,
    nome: string,
    ativo: boolean,
    controle?: boolean,
    especialidade_id: number,
    especialidade: Especialidade
}