'use client'

import { useEffect, useMemo, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Search,
  Eye,
  Send,
  X,
  Filter
} from 'lucide-react'
import {
  getAll,
  AtendimentoFluxo,
  Especialidade,
  FilasFluxo,
  getFilas,
  encaminharPaciente,
  removerPaciente,
  ProfissionaisAtivos,
  getProfissionais,
  AtendimentoFilas
} from '@/services/fluxoService'
import { getAll as getEspecialidades } from '@/services/especialidadeService'
import {
  ageFromISO,
  badgeClass,
  computeFilaStatus,
  prioridadeColor,
  prioridadeDesc,
  safeDateTimeLabel,
  stripDiacritics,
  waitingTime
} from '@/utils/functions'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { DataTable } from '@/components/ui/data-table'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"
import {
  EncaminhamentoMedico,
  encaminharAtendimento,
  removerAtendimento
} from '@/services/atendimentoService'

import { TriagemViewDialog } from '@/components/TriagemViewDialog'
import { QueueLegend } from '@/components/QueueLegend'
import { ActiveProfessionalsBar } from '@/components/ActiveProfessionalsBar'
import { ColumnDef } from '@tanstack/react-table'
import EncaminharModal from '@/components/EncaminharModal'

export default function FilaEsperaPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<AtendimentoFluxo[]>([])
  const [especialidades, setEspecialidades] = useState<Especialidade[]>([])
  const [filas, setFilas] = useState<FilasFluxo>()
  const [triagemOpen, setTriagemOpen] = useState(false)  
  const [loading, setLoading] = useState(false)  
  const [triagemSelecionada, setTriagemSelecionada] = useState<AtendimentoFluxo>()  
  const [isModalAtendimentosOpen, setModalAtendimentosOpen] = useState(false)
  const [atendimentos, setAtendimentos] = useState<AtendimentoFilas[]>([])
  const [deleteId, setDeleteId] = useState<number | null>(null)  
  const [encOpen, setEncOpen] = useState(false)

  useEffect(() => {
    searchEspecialidades()
    searchFilas()
  }, [])

  async function searchEspecialidades() {
    try {
      const dados = await getEspecialidades()
      setEspecialidades(dados)
    } catch (err) {
      toast.error((err as Error).message)
    }
  }

  async function searchFilas() {
    try {
      const dados = await getFilas()
      setFilas(dados)
    } catch (err) {
      toast.error((err as Error).message)
    }
  }

  const [filtroEspecialidades, setFiltroEspecialidades] = useState<number[]>([])
  const [filtroSexo, setFiltroSexo] = useState<string[]>([])
  const [filtroEstado, setFiltroEstado] = useState<string[]>([])
  const clearQuery = () => setQuery('')
  const sexosCatalog = ['Masculino', 'Feminino']
  const estadosCatalog = ['Aguardando', 'Em atendimento']

  useEffect(() => {
    runSearch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, filtroEspecialidades, filtroSexo, filtroEstado])

  async function runSearch() {
    try {
      const q = query?.trim().toLowerCase() || ''
      const qNorm = stripDiacritics(q)
      const dados = (await getAll()).sort(
        (a, b) => new Date(a.entrada).getTime() - new Date(b.entrada).getTime()
      )
      const filtrados = dados.filter(atendimento => {
        const nomePaciente = stripDiacritics(
          (atendimento.paciente?.nome ?? '').toLowerCase()
        )
        const matchQuery =
          qNorm === '' ||
          nomePaciente.includes(qNorm) ||
          String(atendimento.paciente?.id ?? '').includes(qNorm)
        const matchEspecialidade =
          filtroEspecialidades.length === 0 ||
          (Array.isArray(atendimento.filas) &&
            atendimento.filas.some(
              f =>
                f?.fila?.especialidade_id != null &&
                filtroEspecialidades.includes(f.fila.especialidade_id)
            ))
        const pacienteSexo = (atendimento.paciente?.sexo ?? '').toLowerCase()
        const matchSexo =
          filtroSexo.length === 0 ||
          filtroSexo.map(s => s.toLowerCase()).includes(pacienteSexo)
        const estadoAtual =
          atendimento.usuario_id && atendimento.usuario_id > 0
            ? 'em atendimento'
            : 'aguardando'
        const matchEstado =
          filtroEstado.length === 0 ||
          filtroEstado.map(e => e.toLowerCase()).includes(estadoAtual)

        return matchQuery && matchEspecialidade && matchSexo && matchEstado
      })
      setResults(filtrados.map(p => ({ ...p })))
    } catch (err) {
      toast.error((err as Error).message)
      setResults([])
    }
    searchFilas()
  }

  const onVer = (at: AtendimentoFluxo) => {
    setTriagemSelecionada(at)
    setTriagemOpen(true)
  }

  async function onEncaminhar(atendimento: number, fila: number) {
    try {
      await encaminharPaciente(atendimento, fila)
      toast.success('Paciente encaminhado!')
    } catch (err) {
      toast.error((err as Error).message)
    }
    searchEspecialidades()
    searchFilas()
    runSearch()
  }

  async function onExcluir(atendimento: number) {
    try {
      await removerPaciente(atendimento)
      toast.success('Paciente removido!')
    } catch (err) {
      toast.error((err as Error).message)
    }
    searchEspecialidades()
    searchFilas()
    runSearch()
  }

  const [profissionais, setProfissionais] = useState<ProfissionaisAtivos[]>([])
  useEffect(() => {
    loadProfissionaisAtivos()
  }, [])

  async function loadProfissionaisAtivos() {
    try {
      const profissionaisAtivos = await getProfissionais()
      setProfissionais(profissionaisAtivos)
    } catch (err) {
      toast.error((err as Error).message)
      setProfissionais([])
    }
  }

  const handleAtendimentos = function (atendimento: AtendimentoFluxo) {
    setTriagemSelecionada(atendimento)
    setAtendimentos(atendimento.filas!)
    setModalAtendimentosOpen(true)
  }

  const colunas = useMemo<ColumnDef<AtendimentoFilas>[]>(
    () => [
      { accessorKey: 'id', header: 'ID' },
      { accessorKey: 'fila.especialidade.nome', header: 'Nome' },
      { accessorKey: 'atendido', header: 'Atendido', accessorFn: (row) => row.atendido == 1 ? 'Sim' : 'Não' },
      {
        id: 'actions',
        header: 'Ações',
        cell: ({ row }) => (
          row.original.atendido == 0 && (<div className="flex gap-2">
            <Button
              size="sm"
              variant="destructive"              
              onClick={e => {
                e.stopPropagation()
                setDeleteId(row.original.id)
              }}
            >
              Remover
            </Button>
          </div>)
        )
      }
    ],
    []
  )

  async function handleDeleteConfirmed() {
    if (!deleteId) return    
    try {
      await removerAtendimento(deleteId)     
      toast.success(`Registro excluído`)
      setDeleteId(null)
      await runSearch()   
    } catch (err) {
      toast.error(`Erro ao excluir registro`)
    } finally {
      setModalAtendimentosOpen(false)
    }
  }
  
  const handleEncaminhamentoMedico = async (
    encaminhamento: EncaminhamentoMedico
  ) => {
    setLoading(true)
    try {
      await encaminharAtendimento(encaminhamento)
      toast.success('Atendimento encaminhado!')
      await runSearch()   
    } catch {
      toast.error('Encaminhamento do atendimento falhou!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 md:p-6 overflow-x-hidden">
      {/* PROFISSIONAIS ATIVOS (colapsável) */}
      <ActiveProfessionalsBar
        profissionais={profissionais}
        defaultOpen={true}
        className="mb-4"
      />

      {/* HEADER: padrão Painel de Pacientes */}
      <Card className="mb-6">
        {/* Header empilhável no mobile */}
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-xl sm:text-2xl font-bold">
            Fila de Espera
          </CardTitle>

          {/* Botão de Filtros - Dropdown com checkboxes */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                aria-label="Abrir filtros"
                className="w-full sm:w-auto"
              >
                <Filter className="h-4 w-4 mr-2" />
                <span>Filtros</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-72 sm:w-64" align="end">
              <DropdownMenuLabel>Especialidades</DropdownMenuLabel>
              {especialidades.map(esp => (
                <DropdownMenuCheckboxItem
                  key={esp.id}
                  checked={filtroEspecialidades.includes(esp.id)}
                  onCheckedChange={() =>
                    setFiltroEspecialidades(prev =>
                      prev.includes(esp.id)
                        ? prev.filter(id => id !== esp.id)
                        : [...prev, esp.id]
                    )
                  }
                >
                  {esp.nome.toUpperCase()}
                </DropdownMenuCheckboxItem>
              ))}

              <DropdownMenuSeparator />
              <DropdownMenuLabel>Sexo</DropdownMenuLabel>
              {sexosCatalog.map(sx => (
                <DropdownMenuCheckboxItem
                  key={sx}
                  checked={filtroSexo.includes(sx)}
                  onCheckedChange={() =>
                    setFiltroSexo(prev =>
                      prev.includes(sx)
                        ? prev.filter(id => id !== sx)
                        : [...prev, sx]
                    )
                  }
                >
                  {sx}
                </DropdownMenuCheckboxItem>
              ))}

              <DropdownMenuSeparator />
              <DropdownMenuLabel>Estado do Atendimento</DropdownMenuLabel>
              {estadosCatalog.map(st => (
                <DropdownMenuCheckboxItem
                  key={st}
                  checked={filtroEstado.includes(st)}
                  onCheckedChange={() =>
                    setFiltroEstado(prev =>
                      prev.includes(st)
                        ? prev.filter(id => id !== st)
                        : [...prev, st]
                    )
                  }
                >
                  {st}
                </DropdownMenuCheckboxItem>
              ))}

              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setFiltroEspecialidades([])
                  setFiltroSexo([])
                  setFiltroEstado([])
                }}
              >
                Limpar filtros
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>

        {/* Barra de busca (padrão do painel) */}
        <CardContent className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1 min-w-0">
            <Input
              placeholder="Pesquise por nome, CPF, CNS ou data de nascimento"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="pr-10"
              aria-label="Campo de busca de pacientes"
            />
            {query && (
              <button
                aria-label="Limpar busca"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-muted"
                onClick={clearQuery}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <Button
            onClick={runSearch}
            className="w-full sm:w-auto flex items-center"
          >
            <Search className="mr-1 h-4 w-4" />
            Buscar
          </Button>
        </CardContent>

        {/* Total + por especialidade (com wrap) */}
        <CardContent className="pt-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
            {filas?.total != null ? (
              <>
                <span>
                  Total na fila:{' '}
                  <span className="font-semibold text-foreground">
                    {filas.total}
                  </span>
                </span>

                <span className="text-muted-foreground hidden sm:inline">
                  •
                </span>

                <div className="flex flex-wrap items-center gap-2">
                  {filas?.filas?.length ? (
                    filas.filas
                      .filter(item => item.quantidade > 0)
                      .map(item => (
                        <Badge
                          key={item.id}
                          variant="outline"
                          className="whitespace-nowrap"
                        >
                          {item.nome} ({item.quantidade})
                        </Badge>
                      ))
                  ) : (
                    <span className="text-muted-foreground">
                      Sem especialidades aguardando.
                    </span>
                  )}
                </div>
              </>
            ) : (
              <span className="text-muted-foreground">
                Sem especialidades aguardando.
              </span>
            )}
          </div>

          {/* legenda das cores dos badges das filas do paciente */}
          <QueueLegend />
        </CardContent>
      </Card>

      {/* LISTA */}
      <TooltipProvider>
        <div className="space-y-2">
          {results.map(p => (
            <Card key={p.id}>
              <CardContent className="p-3 sm:p-4 space-y-2">
                {/* Linha superior (mobile empilha, desktop em linha) */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  {/* Bloco à esquerda: hora, nome, prioridade */}
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <span className="text-xs sm:text-sm text-muted-foreground shrink-0">
                      {safeDateTimeLabel(p.entrada)}
                    </span>

                    <span
                      className="font-semibold truncate"
                      title={p.paciente.nome}
                    >
                      {p.paciente.nome}
                    </span>

                    {p.triagem && (
                      <Badge
                        className={`${prioridadeColor(
                          p.triagem.prioridade
                        )} shrink-0`}
                      >
                        {prioridadeDesc(p.triagem.prioridade)}
                      </Badge>
                    )}
                  </div>

                  {/* Bloco à direita (desktop): ações */}
                  <div className="hidden md:flex gap-1 shrink-0">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-3"
                          onClick={() => onVer(p)}
                          aria-label="Visualizar triagem"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Visualizar
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Visualizar Triagem</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-3"
                          onClick={() => handleAtendimentos(p)}
                          aria-label="Gerenciar atendimentos"
                        >
                          Atendimentos
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Gerenciar atendimentos</TooltipContent>
                    </Tooltip>
                  </div>

                  {/* Mobile: somente “Visualizar triagem” */}
                  <div className="md:hidden self-star">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 px-3"
                      onClick={() => onVer(p)}
                      aria-label="Visualizar triagem"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Visualizar
                    </Button>
                  </div>
                </div>

                {/* Linha 2: Badges de especialidades (mobile: quebra em múltiplas linhas) */}
                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap gap-2">
                    {p.filas?.map((f, i) => {
                      const status = computeFilaStatus(p, f)
                      const name =
                        f?.fila?.especialidade?.nome ?? 'Especialidade'
                      return (
                        <Badge
                          key={i}
                          className={`px-2 py-0.5 text-xs whitespace-nowrap ${badgeClass(
                            status
                          )}`}
                        >
                          {name}
                        </Badge>
                      )
                    })}
                  </div>

                  {/* Linha 3: Meta (tempo/idade/responsável) — responsável oculto no mobile */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-muted-foreground">
                    <span>⏳ {waitingTime(p.entrada)}</span>
                    <span>🎂 {ageFromISO(p.paciente.dataNascimento)}</span>
                    <span className="hidden md:inline">
                      👨‍⚕️ Responsável triagem:{' '}
                      <span className="font-medium text-foreground">
                        {p.triagem?.usuario?.usuario}
                      </span>
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </TooltipProvider>

      {triagemSelecionada && (
        <TriagemViewDialog
          open={triagemOpen}
          onOpenChange={setTriagemOpen}
          atendimento={triagemSelecionada}
        />
      )}

      <Dialog open={isModalAtendimentosOpen} onOpenChange={setModalAtendimentosOpen}>
        <DialogContent className="max-w-4x1 min-w-[600px]">
          <DialogHeader>
            <DialogTitle>Atendimentos</DialogTitle>
          </DialogHeader>
          <DataTable columns={colunas} data={atendimentos} loading={loading} />
          <Button
            size="sm"
            variant="outline"
            className="h-8 px-3"
            onClick={() => setEncOpen(true)}
            aria-label="Visualizar triagem"
          >
            <Send className="h-4 w-4 mr-1" />
            Encaminhar
          </Button>
        </DialogContent>
      </Dialog>

      <EncaminharModal
        open={encOpen}
        onOpenChange={setEncOpen}
        atendimentoId={triagemSelecionada?.id ?? 0}
        pacienteId={triagemSelecionada?.paciente?.id ?? 0}
        especialidades={especialidades}
        onConfirm={async payload => {
          handleEncaminhamentoMedico(payload)
        }}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir atendimento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o registro #{deleteId}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteId(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirmed} className="bg-destructive text-white hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>    
  )
}
