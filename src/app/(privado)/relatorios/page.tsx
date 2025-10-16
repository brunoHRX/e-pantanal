'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { DashboardTotals, RelatorioFilters, fetchConsolidadoData, fetchDashboardData } from '@/services/relatoriosService'
import { Consolidado, ConsolidadoEspecialidade, ConsolidadoProcedimentos, ConsolidadoSexo } from '@/types/Relatorio'

// ===================== Helpers =====================
function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

// ===================== Componentes auxiliares =====================
function KPICard({
  title,
  value,
  className
}: {
  title: string
  value: number | string
  className?: string
}) {
  return (
    <Card className={cn('shadow-sm', className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-semibold tracking-tight">{value}</div>
      </CardContent>
    </Card>
  )
}

function SkeletonCard() {
  return (
    <Card className="animate-pulse">
      <CardHeader className="pb-2">
        <div className="h-3 w-40 bg-muted rounded" />
      </CardHeader>
      <CardContent>
        <div className="h-8 w-24 bg-muted rounded" />
      </CardContent>
    </Card>
  )
}

// ===================== Modais =====================
function FiltrosDialog({
  open,
  onOpenChange,
  value,
  onChange,
  onApply
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  value: RelatorioFilters
  onChange: (v: RelatorioFilters) => void
  onApply: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Filtros</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="pb-2">Data início</Label>
            <Input
              type="date"
              value={value.dataInicio ?? ''}
              onChange={e => onChange({ ...value, dataInicio: e.target.value })}
            />
          </div>
          <div>
            <Label className="pb-2">Data fim</Label>
            <Input
              type="date"
              value={value.dataFim ?? ''}
              onChange={e => onChange({ ...value, dataFim: e.target.value })}
            />
          </div>

          <div>
            <Label className="pb-2">Fazenda sede</Label>
            <Input
              placeholder="Ex.: Sede Pantanal"
              value={value.fazendaSede ?? ''}
              onChange={e =>
                onChange({ ...value, fazendaSede: e.target.value })
              }
            />
          </div>

          <div>
            <Label className="pb-2">Gênero</Label>
            <Select
              value={value.genero ?? 'ALL'}
              onValueChange={v =>
                onChange({ ...value, genero: v as RelatorioFilters['genero'] })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos</SelectItem>
                <SelectItem value="M">Masculino</SelectItem>
                <SelectItem value="F">Feminino</SelectItem>
                <SelectItem value="NI">Não informado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* <div className="sm:col-span-2">
            <Label className="pb-2">Tipo de atendimento</Label>
            <Input
              placeholder="Ex.: Psicologia, Fono, Fisio..."
              value={value.tipoAtendimento ?? ''}
              onChange={e =>
                onChange({ ...value, tipoAtendimento: e.target.value })
              }
            />
          </div> */}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={onApply}>Aplicar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function GerarRelatorioDialog({
  open,
  onOpenChange,
  filters,
  dataDashboard,
  detalhamentoProcedimentos,
  detalhamentoSexo,
  detalhamentoEspecialidade
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  filters: RelatorioFilters  
  dataDashboard : DashboardTotals | null
  detalhamentoProcedimentos? : ConsolidadoProcedimentos | null
  detalhamentoSexo? : ConsolidadoSexo | null
  detalhamentoEspecialidade? : ConsolidadoEspecialidade | null
}) {
  const [form, setForm] = useState({
    incluirDetalheProcedimentos: true,
    incluirTotaisPorGenero: true,
    incluirTotaisPorTipoAtendimento: true,
    formato: 'pdf' as 'pdf' | 'xlsx'
  })
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit() {
    try {
      setSubmitting(true)
      const res = await fetch(`/api/report-html/?format=${form.formato}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filters,
          options: {
            incluirDetalheProcedimentos: form.incluirDetalheProcedimentos,
            incluirTotaisPorGenero: form.incluirTotaisPorGenero,
            incluirTotaisPorTipoAtendimento: form.incluirTotaisPorTipoAtendimento
          },
          dataDashboard: dataDashboard,
          detalhamentoProcedimentos: detalhamentoProcedimentos,
          detalhamentoSexo: detalhamentoSexo,
          detalhamentoEspecialidade: detalhamentoEspecialidade
        })
      })
      if (!res.ok) throw new Error('Falha ao gerar relatório')

      const contentDisposition = res.headers.get('Content-Disposition') || ''
      const filenameMatch = /filename\*=UTF-8''([^;]+)|filename=([^;]+)/i.exec(
        contentDisposition
      )
      const filename = decodeURIComponent(
        filenameMatch?.[1] ||
          filenameMatch?.[2] ||
          `relatorio-extrato.${form.formato}`
      )

      const blob = await res.blob()
      downloadBlob(filename, blob)
      onOpenChange(false)
    } catch (e) {
      console.error(e)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Gerar relatório (Modelo de Consolidado)</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Resumo dos totais por questões e filtro. As opções abaixo definem o
            conteúdo.
          </div>

          <div className="grid grid-cols-1 gap-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={form.incluirDetalheProcedimentos}
                onChange={e =>
                  setForm(s => ({
                    ...s,
                    incluirDetalheProcedimentos: e.target.checked
                  }))
                }
              />
              <span>Incluir detalhe de procedimentos</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={form.incluirTotaisPorGenero}
                onChange={e =>
                  setForm(s => ({
                    ...s,
                    incluirTotaisPorGenero: e.target.checked
                  }))
                }
              />
              <span>Incluir totais por gênero</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={form.incluirTotaisPorTipoAtendimento}
                onChange={e =>
                  setForm(s => ({
                    ...s,
                    incluirTotaisPorTipoAtendimento: e.target.checked
                  }))
                }
              />
              <span>Incluir totais por tipo de atendimento</span>
            </label>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <Label className="pb-2">Formato</Label>
                <Select
                  value={form.formato}
                  onValueChange={v =>
                    setForm(s => ({ ...s, formato: v as any }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          <div className="rounded-md bg-muted p-3 text-sm">
            <div className="font-medium mb-1">Filtros selecionados</div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-muted-foreground">
              <div>
                <span className="font-medium">Período:</span>{' '}
                {filters.dataInicio || '—'} → {filters.dataFim || '—'}
              </div>
              <div>
                <span className="font-medium">Fazenda sede:</span>{' '}
                {filters.fazendaSede || 'Todas'}
              </div>
              <div>
                <span className="font-medium">Gênero:</span>{' '}
                {filters.genero || 'Todos'}
              </div>
              <div>
                <span className="font-medium">Tipo:</span>{' '}
                {filters.tipoAtendimento || 'Todos'}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Fechar
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Gerando…' : 'Gerar relatório'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ===================== Página =====================
export default function RelatoriosPage() {
  const [filters, setFilters] = useState<RelatorioFilters>({ genero: 'ALL' })
  const [openFiltros, setOpenFiltros] = useState(false)
  const [openRelatorio, setOpenRelatorio] = useState(false)

  const [totals, setTotals] = useState<DashboardTotals | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [detalhamentoProcedimentos, setDetalhamentoProcedimentos] = useState<ConsolidadoProcedimentos | null>(null)
  const [detalhamentoSexo, setDetalhamentoSexo] = useState<ConsolidadoSexo | null>(null)
  const [detalhamentoEspecialidade, setDetalhamentoEspecialidade] = useState<ConsolidadoEspecialidade | null>(null)
  const [consolidado, setConsolidado] = useState<Consolidado | null>(null)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetchDashboardData(filters)
        if (!alive) return
        setTotals(res)
        const resConsolidado = await fetchConsolidadoData(filters)
        setConsolidado(resConsolidado)
        setDetalhamentoProcedimentos(resConsolidado.procedimentos)
        setDetalhamentoSexo(resConsolidado.generos)
        setDetalhamentoEspecialidade(resConsolidado.especialidades)
      } catch (e: any) {
        if (!alive) return
        setError(e?.message ?? 'Falha ao carregar totais.')
      } finally {
        if (!alive) return
        setLoading(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [filters])

  const headerSubtitle = useMemo(() => {
    const parts: string[] = []
    if (filters.dataInicio || filters.dataFim)
      parts.push(`${filters.dataInicio || '…'} → ${filters.dataFim || '…'}`)
    if (filters.fazendaSede) parts.push(`Sede: ${filters.fazendaSede}`)
    if (filters.genero && filters.genero !== 'ALL')
      parts.push(`Gênero: ${filters.genero}`)
    if (filters.tipoAtendimento) parts.push(`Tipo: ${filters.tipoAtendimento}`)
    return parts.join(' • ')
  }, [filters])

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Relatórios</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Visão geral dos atendimentos e procedimentos.{' '}
            {headerSubtitle && <span>({headerSubtitle})</span>}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setOpenFiltros(true)}>
            Filtros
          </Button>
          <Button onClick={() => setOpenRelatorio(true)}>
            Gerar relatório
          </Button>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : error ? (
          <Card className="md:col-span-3 border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">
                Erro ao carregar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">{error}</div>
            </CardContent>
          </Card>
        ) : (
          <>
            <KPICard
              title="Pacientes assistidos (Total)"
              value={totals?.pacientesAssistidos ?? 0}
            />
            <KPICard
              title="Procedimentos (Total)"
              value={totals?.procedimentos ?? 0}
            />
            <KPICard
              title="Atendimentos (Total de áreas)"
              value={totals?.atendimentosAreas ?? 0}
            />
          </>
        )}
      </div>

      {/* Placeholder para evoluções (tabelas/gráficos) */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            {/* Espaço para tabela de "Top procedimentos", "Atendimentos por sede",
            etc. */}
            {/* 🔌 Quando integrar, renderize componentes que consumam os mesmos filtros. */}
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <FiltrosDialog
        open={openFiltros}
        onOpenChange={setOpenFiltros}
        value={filters}
        onChange={setFilters}
        onApply={() => setOpenFiltros(false)}
      />

      <GerarRelatorioDialog
        open={openRelatorio}
        onOpenChange={setOpenRelatorio}
        filters={filters}
        dataDashboard={totals}
        detalhamentoProcedimentos={detalhamentoProcedimentos}
        detalhamentoSexo={detalhamentoSexo}
        detalhamentoEspecialidade={detalhamentoEspecialidade}
      />
    </div>
  )
}
