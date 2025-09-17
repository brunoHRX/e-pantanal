import { Especialidade } from "./Especialidade"
import { Usuario } from "./Usuario"

export type Consultorio = {
    id: number,
    nome: string,
    ativo: boolean,
    livre?: boolean,
    especialidade_id: number,
    especialidade: Especialidade
    usuario_id: number,
    usuario: Usuario
}