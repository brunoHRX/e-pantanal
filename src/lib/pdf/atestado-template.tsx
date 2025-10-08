export type AtestadoPayload = {
  paciente_nome: string
  data_atendimento: string
  inicio_afastamento: string
  medico_nome: string
  crm: string
  assinaturaDataUri?: string
  headerLeftDataUri?: string
  headerRightDataUri?: string
}

export function renderAtestadoHTML(data: AtestadoPayload) {
  const leftImg = data.headerLeftDataUri
    ? `<img src="${data.headerLeftDataUri}" style="max-height:90px; object-fit:contain;" alt="logo">`
    : ''
  const rightImg = data.headerRightDataUri
    ? `<img src="${data.headerRightDataUri}" style="max-height:90px; object-fit:contain;" alt="logo">`
    : ''

  const assinaturaImg = data.assinaturaDataUri
    ? `<img src="${data.assinaturaDataUri}" style="max-height:100px; object-fit:contain; display:block; margin:0 auto 6px;" alt="assinatura">`
    : ''

  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>Atestado Médico</title>
  <style>
    @page { size: A4; margin: 20mm; }
    body { font-family: Arial, Helvetica, sans-serif; color: #111; }

    /* Cabeçalho */
    .headerband { display:grid; grid-template-columns:120px 1fr 120px; align-items:center; gap: 16px; }
    .center { text-align:center; }
    .muted { color:#555; }
    h1 { margin: 4px 0 0 0; font-size: 18px; }
    .sub { font-size: 12px; }
    .line { border-top: 1px solid #000; margin: 10px 0 16px 0; }

    /* Identificação */
    .grid { display:grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; margin-bottom: 10px; }
    .label { font-weight: bold; }
    .small { font-size: 14px; }

    /* Corpo do atestado */
    .box {
      border: 1px solid #000;
      min-height: 60mm;
      padding: 12px;
      margin-top: 8px;
    }
    .txt {
      font-size: 14.5px;
      line-height: 1.7;
      text-align: justify;
      text-justify: inter-word;
      white-space: normal;
      overflow-wrap: normal;
      word-break: normal;
      hyphens: none;
      margin: 0;
      page-break-inside: avoid;
    }
    .keep { white-space: nowrap; }

    /* Observação */
    .obs {
      font-size: 12px;
      color: #555;
      margin-top: 8px;
      text-align: justify;
      text-justify: inter-word;
    }

    /* Assinatura */
    .sig-wrap {
      display:flex;
      gap: 24px;
      margin-top: 16px;
      align-items: center;
      justify-content: center;
    }
    .sig { text-align:center; margin-top: 28px; }
    .sig .line { margin: 0 0 4px 0; border-top: 1px solid #000; }

    /* Rodapé */
    .foot-note { text-align:center; font-size: 12px; margin-top: 14px; color:#333; }
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
      <h1>ATESTADO MÉDICO</h1>
    </div>
    <div class="right" style="text-align:right;">${rightImg}</div>
  </div>

  <div class="line"></div>

  <!-- Identificação -->
  <div class="grid">
    <div><span class="label">Nome do Paciente:</span> ${escapeHtml(
      data.paciente_nome
    )}</div>
    <div><span class="label">Data do Atendimento:</span> ${escapeHtml(
      data.data_atendimento
    )}</div>
    <div><span class="label">Início do Afastamento:</span> ${escapeHtml(
      data.inicio_afastamento
    )}</div>
    <div><span class="label">CRM:</span> ${escapeHtml(data.crm || '')}</div>
  </div>

  <!-- Corpo do texto (parágrafo único) -->
  <div class="box">
    <div class="txt">
      Atesto, para os devidos fins, que o(a) Sr.(a) <strong>${escapeHtml(
        data.paciente_nome
      )}</strong> recebeu atendimento neste Serviço na data de <strong><span class="keep">${escapeHtml(
    data.data_atendimento
  )}</span></strong> e necessita de afastamento de suas atividades por <strong>______</strong> dia(s), a iniciar-se em <strong><span class="keep">${escapeHtml(
    data.inicio_afastamento
  )}</span></strong>. Diagnóstico: ____________________ &nbsp;&nbsp; <span class="keep">CID: ______</span>. Obs.: É vedado ao médico revelar o CID e diagnóstico, salvo se autorizado pelo paciente ou responsável legal, conforme art. 73 do Código de Ética Médica.
    </div>
  </div>

  <!-- Assinatura -->
  <div class="sig-wrap">
    <div class="sig">
      ${assinaturaImg}
      <div class="line"></div>
      <div class="small muted">Assinatura do Médico</div>
      <div class="small muted">
        Carimbo (${escapeHtml(data.medico_nome)}, ${escapeHtml(data.crm)})
      </div>
    </div>
  </div>

  <!-- Autorização -->
  <div class="small" style="margin-top: 24px;">
    <label>
      <input type="checkbox" /> Autorizo a divulgação do diagnóstico (CID)
    </label>
    <div style="margin-top: 8px;">Paciente ou responsável legal</div>
  </div>

  <!-- Rodapé -->
  <div class="foot-note">
    Documento gerado eletronicamente — válido sem assinatura física quando acompanhado de carimbo/assinatura digital.
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
