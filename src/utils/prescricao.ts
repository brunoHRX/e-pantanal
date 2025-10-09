// src/utils/prescricao.ts
import type { ReceitaMedicamento } from '@/services/medicamentoService'

export function composeLinhaReceita(it: ReceitaMedicamento) {
  const nome = 'nome' in it.medicamento ? it.medicamento.nome : String(it.medicamento)

  // usamos 'frequencia' como campo de posologia livre
  const posologiaLivre = (it.frequencia ?? '').trim()
  const qtd = String(it.duracao ?? '').trim()
  const um = String(it.unidade_medida ?? '').trim()
  const obs = (it.observacao ?? '').trim()

  const corpo = posologiaLivre || [qtd && `${qtd}`, um && `${um}`].filter(Boolean).join(' ')
  const obsFmt = obs ? ` — ${obs}` : ''

  // Ex.: "Amoxicilina 500 mg: 1 cp a cada 12h por 7 dias — Tomar após as refeições"
  return `${nome}${corpo ? ': ' + corpo : ''}${obsFmt}`
}

export function mapReceitaLinhas(items: ReceitaMedicamento[]) {
  return items.map(composeLinhaReceita).filter(Boolean)
}
