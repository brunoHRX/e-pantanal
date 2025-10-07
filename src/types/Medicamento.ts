export type Medicamento = { 
    id: number,
    nome: string,
    ativo: boolean,
}

export type ReceitaMedicamento = { 
    medicamento: Medicamento,
    frequencia: string,
    duracao: number,
    observacao: string,
}