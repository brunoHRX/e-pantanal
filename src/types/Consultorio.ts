import { Especialidade } from "./Especialidade"

export type Consultorio = {
    id: number,
    nome: string,
    ativo: boolean,
    livre?: boolean,
    especialidade_id: number,
    especialidade: Especialidade
}