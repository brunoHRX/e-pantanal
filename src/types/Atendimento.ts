export type Atendimento = {
    id: number,
    evolucao: string,
    procedimentos: number[],
    cids: number[],
    medicamentos: number[],
    exames: number[]
}