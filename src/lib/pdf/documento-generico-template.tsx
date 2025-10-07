export type ReceitaPayload = {
  paciente_nome: string
  data_nascimento: string
  data_hora: string
  medico_nome: string
  crm: string
  especialidade: string
  // NOVO: imagens em data URI (base64)
  headerLeftDataUri?: string // ex.: "data:image/png;base64,...."
  headerRightDataUri?: string // opcional
  assinaturaDataUri?: string // opcional (imagem de assinatura)
}

export function renderDocumentoHTML(data: ReceitaPayload) {  
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
  <title>Documento médico</title>
  <style>
    @page { size: A4; margin: 20mm; }
    body { font-family: Arial, Helvetica, sans-serif; color: #111; }
    .headerband {
      display: grid; grid-template-columns: 120px 1fr 120px; align-items:center; gap: 16px;
    }
    .center { text-align:center; }
    .muted { color:#555; }
    h1 { margin: 4px 0 0 0; font-size: 18px; }
    .sub { font-size: 12px; }
    .line { border-top: 1px solid #000; margin: 10px 0 16px 0; }
    .grid { display:grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; margin-bottom: 10px; }
    .label { font-weight: bold; }
    .box { border: 1px solid #000; min-height: 110mm; padding: 10px; margin-top: 8px; }
    .small { font-size: 14px; }
    .sig-wrap { display:flex; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 16px; align-items: center; justify-content: center;}
    .sig { text-align:center; margin-top: 28px; }
    .sig .line { margin: 0 0 4px 0; border-top: 1px solid #000; }
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
      <h1>Documento médico</h1>
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

  <div class="box">
  </div>

  <div class="sig-wrap">
    <div class="sig">
      ${assinaturaImg}
      <div class="line"></div>
      <div class="small muted">Assinatura do Médico</div>
      <div class="small muted">Carimbo (${escapeHtml(
        data.medico_nome
      )}, ${escapeHtml(
        data.crm
      )}, ${escapeHtml(
        data.especialidade
      )})</div>
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
