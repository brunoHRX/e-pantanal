export type DashboardTotals = {
    pacientesAssistidos: number
    procedimentos: number
    atendimentosAreas: number
}

export type RelatorioFilters = {
    dataInicio?: string // ISO (yyyy-mm-dd)
    dataFim?: string // ISO (yyyy-mm-dd)
    fazendaSede?: string // id ou nome
    genero?: 'M' | 'F' | 'NI' | 'ALL'
    tipoAtendimento?: string // id ou slug
}

export type Consolidado = {
    procedimentos: ConsolidadoProcedimentos
    generos: ConsolidadoSexo
    especialidades: ConsolidadoEspecialidade
}
export type ConsolidadoProcedimentos = {
    triagem: number
    procedimentos: DetalhamentoProcedimentos[]
}
export type DetalhamentoProcedimentos = {
    descricao: string
    quantitativo: number
}
export type ConsolidadoSexo = {
    sexo: DetalhamentoSexo[]
}
export type DetalhamentoSexo = {
    descricao: string
    quantitativo: number
}
export type ConsolidadoEspecialidade = {
    especialidade: DetalhamentoEspecialidade[]
}
export type DetalhamentoEspecialidade = {
    descricao: string
    quantitativo: number
}