export type AtestadoPayload = {
  paciente_nome: string
  data_atendimento: string
  dias_afastamento: string
  inicio_afastamento: string
  diagnostico?: string
  cid?: string
  medico_nome: string
  crm: string
  assinaturaDataUri?: string
  headerLeftDataUri?: string
  headerRightDataUri?: string
}

export function renderAtestadoHTML(data: AtestadoPayload) {
  const assinaturaImg = data.assinaturaDataUri
    ? `<img src="${data.assinaturaDataUri}" style="max-height:48px; object-fit:contain;">`
    : ''

  const leftImg = data.headerLeftDataUri
    ? `<img src="${data.headerLeftDataUri}" style="height:100px; object-fit:contain;">`
    : ''
  const rightImg = data.headerRightDataUri
    ? `<img src="${data.headerRightDataUri}" style="height:100px; object-fit:contain;">`
    : ''

  return `<!doctype html>
<html lang="pt-br">
<head>
  <meta charset="utf-8" />
  <title>Atestado Médico</title>
  <style>
    @page { size: A4; margin: 20mm; }
    body { font-family: Arial, Helvetica, sans-serif; color: #111; }
    .headerband { display:grid; grid-template-columns:120px 1fr 120px; align-items:center; }
    .center { text-align:center; }
    h1 { margin: 8px 0 0 0; font-size: 18px; }
    .sub { font-size: 12px; }
    .line { border-top: 1px solid #000; margin: 10px 0 16px 0; }
    .content { font-size: 13px; line-height: 1.6; margin-top: 16px; text-align: justify; }
    .indent { text-indent: 2em; } /* <- recuo de "duas tabs" */
    .sig { margin-top: 60px; text-align:center; }
    .small { font-size: 10px; color:#555; }
    .atestado-wrapper {
      display: flex;
      flex-direction: column;
      justify-content: center;  /* centraliza verticalmente */
      min-height: 50vh;         /* ocupa metade da página (ajuste conforme quiser) */
    }
  </style>
</head>
<body>
  <div class="headerband">
    <div class="left">${leftImg}</div>
    <div class="center mb-2">
      <div><strong>INSTITUTO ALMA PANTANEIRA</strong></div>
      <div class="sub">EXPEDIÇÃO ALMA PANTANEIRA – MÉDICOS DO PANTANAL</div>
      <div class="sub">CNPJ: 25.118.108/0001-04</div>
      <div class="sub">Endereço: Rua Cuiabá – n° 1288 – Centro, Corumbá-MS. CEP – 79330-070</div>
    </div>
    <div class="right" style="text-align:right;">${rightImg}</div>
  </div>

  <div class="line"></div>
  <h1 class="center">ATESTADO MÉDICO</h1>
  <div class="atestado-wrapper">
    <div class="content">
      Atesto, para os devidos fins, que o(a) Sr.(a) <strong>${escapeHtml(
        data.paciente_nome
      )}</strong> 
      recebeu atendimento neste Serviço no dia <strong>${escapeHtml(
        data.data_atendimento
      )}</strong>, 
      e necessita afastamento de suas atividades por 
      <strong>${escapeHtml(data.dias_afastamento)}</strong> dia(s), a partir de 
      <strong>${escapeHtml(data.inicio_afastamento)}</strong>.
    </div>

    <div class="content" style="margin-top:20px;">
      Diagnóstico: ${escapeHtml(data.diagnostico ?? '____________________')} 
      &nbsp;&nbsp; CID: ${escapeHtml(data.cid ?? '______')}
    </div>

    <div class="small" style="margin-top:4px;">
      Obs: É vedado ao médico revelar o CID e diagnóstico, salvo se autorizado pelo paciente ou responsável legal,
      conforme art. 73 do Código de Ética Médica.
    </div>
  </div>

  <div class="sig">
    ${assinaturaImg}
    <div style="margin-top:8px;">
      _____________________________________
    </div>
    <div>${escapeHtml(data.medico_nome)} - CRM ${escapeHtml(data.crm)}</div>
  </div>

  <div class="content" style="margin-top:40px;">
    <label>
      <input type="checkbox" /> Autorizo a divulgação do diagnóstico (CID)
    </label>
  </div>

  <div class="small" style="margin-top:12px;">
    Paciente ou responsável legal
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
