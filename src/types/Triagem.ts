import { Especialidade } from "./Especialidade"
import { Usuario } from "./Usuario"

export type TriagemFormData = {
    id?: number
    nomePaciente: string
    idade: string
    prontuario: number
    especialidades: Especialidade[]
    situacao: string
    sinaisVitais: {
        peso: string
        temperatura: string
        fr: string
        sato2: string
        pa: string
        fc: string
    }
    comorbidadeOp: string
    comorbidadeDesc?: string
    obsComorbidade?: string
    medicacao24h: string
    alergia: 'não' | 'sim'
    quaisAlergias?: string
    coletadoPor: string
    dataHora: string
    usuario?: Usuario
}