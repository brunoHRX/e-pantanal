// mantém sua tipagem
export type ReceitaPayload = {
  paciente_nome: string
  data_nascimento: string
  data_hora: string
  medico_nome: string
  crm: string
  especialidade: string
  medicacoes: string[] | string
  headerLeftDataUri?: string
  headerRightDataUri?: string
  assinaturaDataUri?: string
}

// util simples
function escapeHtml(s: string) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function renderReceituarioHTML(data: ReceitaPayload) {
  // normaliza medicações (string[] | string) e monta <li> com numeração
  const asList = Array.isArray(data.medicacoes)
    ? data.medicacoes
    : [String(data.medicacoes ?? '')]

  const medsHTML = `
    <ol class="rx-list">
      ${asList
        .filter(Boolean)
        .map(
          (m, i) => `
          <li class="rx-item">
            <span class="num">${i + 1}.</span>
            <span class="txt">${escapeHtml(String(m))}</span>
          </li>
        `
        )
        .join('')}
    </ol>
  `

  const leftImg = data.headerLeftDataUri
    ? `<img src="${data.headerLeftDataUri}" style="max-height:90px; object-fit:contain;" alt="logo">`
    : ''
  const rightImg = data.headerRightDataUri
    ? `<img src="${data.headerRightDataUri}" style="max-height:90px; object-fit:contain;" alt="logo">`
    : ''

  const assinaturaImg = data.assinaturaDataUri
    ? `<img src="${data.assinaturaDataUri}" style="max-height:100px; object-fit:contain; display:block; margin:0 auto 6px;" alt="assinatura">`
    : ''

  return `<!DOCTYPE html>
<html lang="pt-BR">
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
    .sig-wrap { display:flex; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 16px; align-items: center; justify-content: center;}
    .sig { text-align:center; margin-top: 28px; }
    .sig .line { margin: 0 0 4px 0; border-top: 1px solid #000; }

    /* ===== NOVO: estilo das linhas de medicação ===== */
    .rx-list { /* sem marcadores nativos, usamos nossa coluna de número */
      list-style: none;
      padding: 0;
      margin: 0;
      counter-reset: rx;
    }
    .rx-item {
      display: grid;
      grid-template-columns: 18px 1fr; /* número fixo + texto flexível */
      gap: 6px;
      padding: 6px 0;
      border-bottom: 1px dotted #999;
      page-break-inside: avoid; /* evita quebrar um item no meio */
    }
    .rx-item:last-child { border-bottom: 0; }
    .rx-item .num {
      display: inline-block;
      width: 18px;
      text-align: right;
      font-variant-numeric: tabular-nums;
      color: #555;
      user-select: none;
    }
    .rx-item .txt {
      white-space: pre-wrap;         /* respeita quebras manuais se existirem */
      overflow-wrap: anywhere;       /* permite quebrar palavras longas */
      word-break: break-word;
      hyphens: auto;                 /* hifenização quando disponível */
      line-height: 1.4;
      font-size: 14px;
    }
    /* =============================================== */
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
    <div><span class="label">CRM:</span> ${escapeHtml(data.crm || '')}</div>
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
      <div class="small muted">Carimbo (${escapeHtml(
        data.medico_nome
      )}, ${escapeHtml(data.crm)}, ${escapeHtml(data.especialidade)})</div>
    </div>
  </div>

  <div class="center small" style="margin-top: 14px;">
    Documento gerado eletronicamente - válido sem assinatura física quando acompanhado de carimbo/assinatura digital.
  </div>
</body>
</html>`
}
