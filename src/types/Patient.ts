import { Especialidade } from "./Especialidade";

export type Patient = {
    bairro: string,
    cep: string,
    complemento: string,
    cor: string,
    cpf: string,
    dataNascimento: string,
    desconheceMae: boolean,
    desconhecePai: boolean,
    escolaridade: string,
    estadoCivil: string,
    etnia: string,
    fazendaReferencia: string,
    filiacao1: string,
    filiacao2: string,
    id: number,
    infoComplementar: string,
    logradouro: string,
    municipio: string,
    municipioNascimento: string,
    nacionalidade: string,
    nome: string,
    nomeSocial: string,
    numero: string,
    ocupacao: string,
    paisNascimento: string,
    paisResidencia: string,
    pne: boolean,
    pontoReferencia: string,
    relacaoFamiliar: string,
    relacaoLocal: string,
    semNumero: boolean,
    sexo: string,
    tipoLogradouro: string,
    tipoSanguineo: string,
    uf: string
};

export type TriagemFormData = {
    nomePaciente: string
    idade: string // "X anos e Y meses"
    prontuario: number

    especialidades: Especialidade[] // << mudou para objetos

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
}
