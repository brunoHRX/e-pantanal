export type Medicamento = { 
    id: number,
    nome: string,
    ativo: boolean,
}

export type ReceitaMedicamento = { 
    medicamento: Medicamento,
    frequencia: string,
    unidade_medida: string,
    duracao: number,
    observacao: string,
}