export type MedicacaoItem = {
  nome?: string // "Dipirona 500mg"
  tipoUso?: string // "contínuo", "eventual", "noturno", etc.
  quantidade?: string // "20", "1", "5"
  unidade?: string // "comprimidos", "ml", "caixas", "gotas"
  tomarQtd?: string // "1", "10"
  forma?: string // "comprimido(s)", "ml", "gota(s)", "cápsula(s)"
  via?: string // "oral", "IM", "IV", "sublingual"
  intervaloHoras?: string // "8", "12"
  dias?: string // "7", "3", "10"
  observacao?: string // texto livre
}

export type ReceitaPayload = {
  paciente_nome: string
  data_nascimento: string
  data_hora: string
  medico_nome: string
  crm: string
  especialidade: string
  // Agora aceita itens estruturados OU o formato antigo
  medicacoes: MedicacaoItem[] | string[] | string
  headerLeftDataUri?: string // ex.: "data:image/png;base64,..."
  headerRightDataUri?: string // opcional
  assinaturaDataUri?: string // opcional
}

function U(value?: string, min = 120): string {
  // Campo sublinhado: se vier valor, mostra o valor sublinhado; senão, linha vazia.
  const display = (value ?? '').trim()
  // largura mínima em px para manter o "traço" visível mesmo preenchido
  return `<span class="u" style="min-width:${min}px;">${escapeHtml(
    display
  )}</span>`
}

function renderMedicacaoItem(item: MedicacaoItem, idx: number): string {
  const nome = U(item.nome, 220)
  const tipoUso = U(item.tipoUso, 140)
  const quantidade = U(item.quantidade, 60)
  const unidade = U(item.unidade, 140)
  const tomarQtd = U(item.tomarQtd, 60)
  const forma = U(item.forma, 140)
  const via = U(item.via, 140)
  const intervaloHoras = U(item.intervaloHoras, 60)
  const dias = U(item.dias, 60)
  const observacao = U(item.observacao, 420)

  return `
  <div class="rx-item">
    <div class="rx-line">
      <span class="rx-num">${idx + 1}.</span>
      <span>Nome da Medicação</span> ${nome}
      <span>&nbsp;(TIPO DE USO)</span> ${tipoUso}
      <span>&nbsp;QTD:</span> ${quantidade}
      <span>&nbsp;</span>(${unidade})
      <span>.</span>
    </div>

    <div class="rx-line">
      <span>Tomar</span> ${tomarQtd} <span>&nbsp;</span>(${forma})
      <span>, por via</span> ${via}
      <span>, a cada</span> ${intervaloHoras} <span>horas</span>
      <span>, por</span> ${dias} <span>dias</span>.
    </div>

    <div class="rx-line">
      <span>Obs:</span> ${observacao}
    </div>
  </div>`
}

function renderMedicacoes(data: ReceitaPayload): string {
  // Se vier o formato antigo (string ou string[]), viramos um item simples
  if (typeof data.medicacoes === 'string') {
    return renderMedicacaoItem({ nome: data.medicacoes }, 0)
  }
  if (
    Array.isArray(data.medicacoes) &&
    typeof data.medicacoes[0] === 'string'
  ) {
    const arr = data.medicacoes as string[]
    return arr.map((s, i) => renderMedicacaoItem({ nome: s }, i)).join('')
  }
  // Caso estruturado
  const items = (data.medicacoes as MedicacaoItem[]) ?? []
  return items.map((m, i) => renderMedicacaoItem(m, i)).join('')
}

export function renderReceituarioHTML(data: ReceitaPayload) {
  const medsHTML = renderMedicacoes(data)

  const leftImg = data.headerLeftDataUri
    ? `<img src="${data.headerLeftDataUri}" style="height:100px; object-fit:contain;">`
    : ''
  const rightImg = data.headerRightDataUri
    ? `<img src="${data.headerRightDataUri}" style="height:100px; object-fit:contain;">`
    : ''

  const assinaturaImg = data.assinaturaDataUri
    ? `<img src="${data.assinaturaDataUri}" style="max-height:70px; object-fit:contain;">`
    : ''

  return `<!doctype html>
<html lang="pt-br">
<head>
  <meta charset="utf-8" />
  <title>Receituário</title>
  <style>
    @page { size: A4; margin: 20mm; }
    body { font-family: Arial, Helvetica, sans-serif; color: #111; }
    .headerband { display: grid; grid-template-columns: 120px 1fr 120px; align-items:center; gap: 16px; }
    .center { text-align:center; }
    .muted { color:#555; }
    h1 { margin: 4px 0 0 0; font-size: 18px; }
    .sub { font-size: 12px; }
    .line { border-top: 1px solid #000; margin: 10px 0 16px 0; }
    .grid { display:grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; margin-bottom: 10px; }
    .label { font-weight: bold; }
    .box { border: 1px solid #000; min-height: 110mm; padding: 12px 12px 8px; margin-top: 8px; }
    .small { font-size: 14px; }
    .sig-wrap { display:grid; grid-template-columns: 1fr; gap: 12px; margin-top: 16px; }
    .sig { text-align:center; margin-top: 20px; }
    .sig .line { margin: 6px 0 4px 0; border-top: 1px solid #000; }

    /* Estilos dos campos sublinhados */
    .u {
      display: inline-block;
      padding: 0 4px 2px;
      border-bottom: 1px solid #000;
      line-height: 1.2;
      vertical-align: baseline;
    }

    /* Blocos de prescrição */
    .rx-item { margin-bottom: 12px; }
    .rx-line { font-size: 13px; line-height: 1.6; text-align: justify; }
    .rx-num { font-weight: bold; margin-right: 6px; }
  </style>
</head>
<body>
  <div class="headerband">
    <div class="left">${leftImg}</div>
    <div class="center">
      <div><strong>INSTITUTO ALMA PANTANEIRA</strong></div>
      <div class="sub">EXPEDIÇÃO ALMA PANTANEIRA – MÉDICOS DO PANTANAL</div>
      <div class="sub">CNPJ: 25.118.108/0001-04</div>
      <div class="sub">Endereço: Rua Cuiabá – n° 1288 – Centro, Corumbá-MS. CEP – 79330-070</div>
      <h1>RECEITUÁRIO</h1>
    </div>
    <div class="right" style="text-align:right;">${rightImg}</div>
  </div>

  <div class="line"></div>

  <div class="grid">
    <div><span class="label">Nome do Paciente:</span> ${escapeHtml(
      data.paciente_nome
    )}</div>
    <div><span class="label">Data de Nascimento:</span> ${escapeHtml(
      data.data_nascimento
    )}</div>
    <div><span class="label">Data/Hora da Emissão:</span> ${escapeHtml(
      data.data_hora
    )}</div>
  </div>

  <div class="label">Medicações / Orientações:</div>
  <div class="box">
    ${medsHTML}
  </div>

  <div class="sig-wrap">
    <div class="sig">
      ${assinaturaImg}
      <div class="line"></div>
      <div class="small muted">Assinatura do Médico</div>
      <div class="small muted">Carimbo (Nome, CRM, Especialidade)</div>
    </div>
  </div>

  <div class="center small" style="margin-top: 14px;">
    Documento gerado eletronicamente - válido sem assinatura física quando acompanhado de carimbo/assinatura digital.
  </div>
</body>
</html>`
}

function escapeHtml(s: string) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
