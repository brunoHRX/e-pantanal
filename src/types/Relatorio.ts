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