import { ConsolidadoEspecialidade, ConsolidadoProcedimentos, ConsolidadoSexo, DashboardTotals } from "@/types/Relatorio"
import { safeDateLabel } from "@/utils/functions"

export function renderConsolidadoHTML(input: {
  leftImg?: string // data URI
  rightImg?: string // data URI
  titulo?: string
  filtros?: any
  secoes?: any
  dataDashboard : DashboardTotals
  detalhamentoProcedimentos? : ConsolidadoProcedimentos
  detalhamentoSexo? : ConsolidadoSexo
  detalhamentoEspecialidade? : ConsolidadoEspecialidade
}) {
  const {
    leftImg = '',
    rightImg = '',
    titulo = 'Consolidado',
    filtros,
    secoes = {},
    dataDashboard,
    detalhamentoProcedimentos,
    detalhamentoSexo,
    detalhamentoEspecialidade
  } = input
  return `
<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${titulo}</title>
<style>
* { box-sizing: border-box; }
body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, Arial, sans-serif; color: #111; margin: 0; padding: 18mm 12mm; }
.headerband { display: grid; grid-template-columns: 1fr 3fr 1fr; align-items: center; gap: 12px; }
.headerband .left img, .headerband .right img { max-height: 90px; object-fit: contain; }
.center { text-align: center; }
.center .sub { font-size: 11px; color: #444; line-height: 1.3; }
h1 { font-size: 18px; margin: 8px 0 0 0; }
.line { height: 2px; background: #0f172a; margin: 10px 0 18px; opacity: .85; }
.section { margin-top: 14px; }
.kv { font-size: 12px; color: #222; }
.kv b { color: #0f172a; }
table { width: 100%; border-collapse: collapse; margin-top: 8px; }
th, td { border: 1px solid #e5e7eb; padding: 6px 8px; font-size: 12px; }
th { background: #f8fafc; text-align: left; }
</style>
</head>
<body>
<div class="headerband">
<div class="left">${leftImg ? `<img src="${leftImg}">` : ''}</div>
<div class="center">
<div><strong>INSTITUTO ALMA PANTANEIRA</strong></div>
<div class="sub">EXPEDIÇÃO ALMA PANTANEIRA – MÉDICOS DO PANTANAL</div>
<div class="sub">CNPJ: 25.118.108/0001-04</div>
<div class="sub">Endereço: Rua Cuiabá – n° 1288 – Centro, Corumbá-MS. CEP – 79330-070</div>
<h1>${titulo}</h1>
</div>
<div class="right" style="text-align:right;">${
    rightImg ? `<img src="${rightImg}">` : ''
  }</div>
</div>
<div class="line"></div>


<div class="section kv">
<div><b>Período:</b> ${safeDateLabel(filtros?.dataInicio) || '—'} → ${
    safeDateLabel(filtros?.dataFim) || '—'
  }</div>
<div><b>Fazenda sede:</b> ${filtros?.fazendaSede || 'Todas'} • <b>Gênero:</b> ${
    filtros?.genero || 'Todos'
  } • <b>Tipo:</b> ${filtros?.tipoAtendimento || 'Todos'}</div>
</div>


<div class="section">
  <span>Dados gerais</span>
  <table>
    <thead>
      <tr><th></th><th>Quantitativo</th></tr>
    </thead>
    <tbody>
      <tr><td>Pacientes assistidos</td><td>${dataDashboard.pacientesAssistidos}</td></tr>
      <tr><td>Total de procedimentos</td><td>${dataDashboard.procedimentos}</td></tr>
      <tr><td>Total de áreas assistidas</td><td>${dataDashboard.atendimentosAreas}</td></tr>
    </tbody>
  </table>
</div>
${ secoes?.incluirDetalheProcedimentos &&  detalhamentoProcedimentos && (
  `<div class="section">
    <span>Procedimentos</span>
    <table>
      <thead>
        <tr><th></th><th>Quantitativo</th></tr>
      </thead>
      <tbody>
        <tr><td>Triagens</td><td>${detalhamentoProcedimentos.triagem}</td></tr>
        ${
          detalhamentoProcedimentos.procedimentos.forEach(detalhamento => {
            `<tr><td>${detalhamento.descricao}</td><td>${detalhamento.quantitativo}</td></tr>`
          })
        }
      </tbody>
    </table>
  </div>`
)}
${ secoes?.incluirTotaisPorGenero &&  detalhamentoSexo && (
  `<div class="section">
    <span>Gêneros</span>
    <table>
      <thead>
        <tr><th></th><th>Quantitativo</th></tr>
      </thead>
      <tbody>
        ${
          detalhamentoSexo.sexo.forEach(detalhamento => {
            `<tr><td>${detalhamento.descricao}</td><td>${detalhamento.quantitativo}</td></tr>`
          })
        }
      </tbody>
    </table>
  </div>`
)}
${ secoes?.incluirTotaisPorTipoAtendimento &&  detalhamentoEspecialidade && (
  `<div class="section">
    <span>Especialidades</span>
    <table>
      <thead>
        <tr><th></th><th>Quantitativo</th></tr>
      </thead>
      <tbody>
        ${
          detalhamentoEspecialidade.especialidade.forEach(detalhamento => {
            `<tr><td>${detalhamento.descricao}</td><td>${detalhamento.quantitativo}</td></tr>`
          })
        }
      </tbody>
    </table>
  </div>`
)}
</body>
</html>`
}
