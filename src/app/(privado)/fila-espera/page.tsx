'use client'

import { useEffect, useState } from 'react'
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
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  Search,
  Eye,
  Send,
  Edit,
  Trash2,
  MoreVertical,
  X,
  Filter
} from 'lucide-react'
import {
  getAll,
  AtendimentoFluxo,
  Especialidade
} from '@/services/fluxoService'
import { getAll as getEspecialidades } from '@/services/especialidadeService'
import {
  ageFromISO,
  safeDateTimeLabel,
  stripDiacritics,
  waitingTime
} from '@/utils/functions'
import { toast } from 'sonner'

import { TriagemViewDialog } from '@/components/TriagemViewDialog'
import { QueueSummary } from '@/components/QueueSummary'
import { QueueLegend } from '@/components/QueueLegend'

// Determina a especialidade "ativa" do paciente sem depender de campos inexistentes.
function currentEspecialidadeId(at: AtendimentoFluxo): number | null {
  // 1) Se a fila atual do atendimento está setada, priorize-a
  const espFromAt = at.fila?.especialidade_id
  if (espFromAt != null) return espFromAt

  const filas = at.filas || []

  // 2) Primeira pendente (atendido == 0)
  const pendente = filas.find(f => f?.atendido == 0)
  if (pendente?.fila?.especialidade_id != null) {
    return pendente.fila.especialidade_id
  }

  // 3) Se nada acima, tente TRIAGEM pelo nome
  const tri = filas.find(f =>
    (f?.fila?.especialidade?.nome || '').toUpperCase().includes('TRIAGEM')
  )
  if (tri?.fila?.especialidade_id != null) {
    return tri.fila.especialidade_id
  }

  // 4) Nada encontrado
  return null
}

type BadgeStatus = 'active' | 'pending' | 'expired'

// Define o status do badge de uma fila específica
function computeFilaStatus(
  at: AtendimentoFluxo,
  f: AtendimentoFilas
): BadgeStatus {
  const activeId = currentEspecialidadeId(at)
  const espId = f?.fila?.especialidade_id

  if (espId != null && espId === activeId) return 'active'
  if (f?.atendido == 1) return 'expired'
  return 'pending'
}

function encaminharParaEspecialidade(
  atId: number,
  espId: number,
  setResults: React.Dispatch<React.SetStateAction<AtendimentoFluxo[]>>
) {
  setResults(prev =>
    prev.map(at => {
      if (at.id !== atId) return at

      // encontra a fila/especialidade escolhida
      const nova = at.filas?.find(f => f?.fila?.especialidade_id === espId)
      if (!nova?.fila) return at

      const ativaAnteriorId = at.fila?.especialidade_id

      return {
        ...at,
        // define a "fila" atual (torna essa esp. a ativa para o nosso compute)
        fila: nova.fila,
        // opcionalmente marque a anterior como "expirada" (atendido = 1)
        filas: at.filas?.map(f => {
          // se for a escolhida, garante que está pendente (0)
          if (f.id === nova.id) return { ...f, atendido: 0 }
          // se era a ativa anterior, marca como expirada
          if (
            ativaAnteriorId &&
            f.fila?.especialidade_id === ativaAnteriorId &&
            ativaAnteriorId !== espId
          ) {
            return { ...f, atendido: 1 }
          }
          return f
        })
      }
    })
  )
}

// Classes visuais para cada status
function badgeClass(status: BadgeStatus): string {
  switch (status) {
    case 'active':
      // preto sólido (destaque atual)
      return 'bg-black text-white border-black hover:bg-black'
    case 'expired':
      // claro, “expirado”
      return 'bg-zinc-100 text-zinc-500 border-zinc-200 opacity-70'
    case 'pending':
    default:
      // só borda e texto
      return 'border border-zinc-500 text-zinc-700 bg-transparent'
  }
}

export default function FilaEsperaPage() {
  // Busca
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<AtendimentoFluxo[]>([])
  const [especialidades, setEspecialidades] = useState<Especialidade[]>([])
  const [triagemOpen, setTriagemOpen] = useState(false)
  const [triagemSelecionada, setTriagemSelecionada] =
    useState<AtendimentoFluxo | null>(null)

  useEffect(() => {
    searchEspecialidades()
  }, [])

  async function searchEspecialidades() {
    try {
      const dados = await getEspecialidades()
      setEspecialidades(dados)
    } catch (err) {
      toast.error((err as Error).message)
    }
  }
  // Filtros (checkbox)
  const [filtroEspecialidades, setFiltroEspecialidades] = useState<number[]>([])
  const [filtroSexo, setFiltroSexo] = useState<string[]>([])
  const [filtroEstado, setFiltroEstado] = useState<string[]>([])

  const clearQuery = () => setQuery('')

  const sexosCatalog = ['Masculino', 'Feminino']
  const estadosCatalog = ['Aguardando', 'Em atendimento']

  useEffect(() => {
    runSearch()
  }, [query, filtroEspecialidades, filtroSexo, filtroEstado])

  async function runSearch() {
    console.log('run')

    try {
      const q = query?.trim().toLowerCase() || ''
      const qNorm = stripDiacritics(q)

      // Pega todos os atendimentos e ordena por entrada
      const dados = (await getAll()).sort(
        (a, b) => new Date(a.entrada).getTime() - new Date(b.entrada).getTime()
      )

      const filtrados = dados.filter(atendimento => {
        // === Filtro por nome ou ID do paciente ===
        const nomePaciente = stripDiacritics(
          (atendimento.paciente?.nome ?? '').toLowerCase()
        )
        const matchQuery =
          qNorm === '' ||
          nomePaciente.includes(qNorm) ||
          String(atendimento.paciente?.id ?? '').includes(qNorm)

        // === Filtro por especialidade ===
        const matchEspecialidade =
          filtroEspecialidades.length === 0 ||
          (Array.isArray(atendimento.filas) &&
            atendimento.filas.some(
              f =>
                f?.fila?.especialidade_id != null &&
                filtroEspecialidades.includes(f.fila.especialidade_id)
            ))

        // === Filtro por sexo ===
        const pacienteSexo = (atendimento.paciente?.sexo ?? '').toLowerCase()
        const matchSexo =
          filtroSexo.length === 0 ||
          filtroSexo.map(s => s.toLowerCase()).includes(pacienteSexo)

        // === Filtro por estado ===
        const estadoAtual =
          atendimento.consultorio_id && atendimento.consultorio_id > 0
            ? 'em atendimento'
            : 'aguardando'
        const matchEstado =
          filtroEstado.length === 0 ||
          filtroEstado.map(e => e.toLowerCase()).includes(estadoAtual)

        // === DEBUG: verificação de cada condição ===
        // console.log('Paciente:', atendimento.paciente?.nome, 'Query:', matchQuery, 'Especialidade:', matchEspecialidade, 'Sexo:', matchSexo, 'Estado:', matchEstado);

        // Retorna apenas se todas as condições forem verdadeiras
        return matchQuery && matchEspecialidade && matchSexo && matchEstado
      })

      // Atualiza resultados
      setResults(filtrados.map(p => ({ ...p })))

      console.log('Total filtrados:', filtrados.length)
    } catch (err) {
      toast.error((err as Error).message)
      setResults([])
    }
  }

  // Handlers de ações (plugue sua lógica/rotas)
  const onVer = (at: AtendimentoFluxo) => {
    setTriagemSelecionada(at)
    setTriagemOpen(true)
  }
  const onEncaminhar = (id: number) => {}
  const onExcluir = (id: number) => {}

  return (
    <div className="p-6">
      {/* HEADER: padrão Painel de Pacientes */}
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-bold">Fila de Espera</CardTitle>

          {/* Botão de Filtros - Dropdown com checkboxes */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" aria-label="Abrir filtros">
                <Filter className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Filtros</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64" align="end">
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
        <CardContent className="flex flex-col gap-2 md:flex-row">
          <div className="relative flex-1">
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

          <Button onClick={runSearch} className="flex items-center">
            <Search className="mr-1 h-4 w-4" />
            Buscar
          </Button>
        </CardContent>
        <CardContent className="pt-0">
          <QueueSummary items={results} />
          <QueueLegend />
        </CardContent>
      </Card>

      {/* LISTA */}
      <TooltipProvider>
        <div className="space-y-2">
          {results.map(p => (
            <Card key={p.id}>
              <CardContent className="p-4 space-y-2">
                {/* Linha 1: Hora - Nome - Especialidades - Ações */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-sm text-muted-foreground shrink-0">
                      {safeDateTimeLabel(p.entrada)}
                    </span>

                    <span
                      className="font-semibold truncate"
                      title={p.paciente.nome}
                    >
                      {p.paciente.nome}
                    </span>

                    <div className="flex flex-wrap gap-2">
                      {p.filas?.map((f, i) => {
                        const status = computeFilaStatus(p, f)
                        const name =
                          f?.fila?.especialidade?.nome ?? 'Especialidade'
                        return (
                          <Badge
                            key={i}
                            className={`whitespace-nowrap ${badgeClass(
                              status
                            )}`}
                          >
                            {name}
                          </Badge>
                        )
                      })}
                    </div>
                  </div>

                  {/* Desktop: ícones com tooltip */}
                  <div className="hidden md:flex gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          aria-label="Visualizar triagem"
                          onClick={() => onVer(p)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Visualizar Triagem</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          aria-label="Encaminhar para atendimento"
                          onClick={() => onEncaminhar(p.id)}
                        >
                          <DropdownMenu>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    aria-label="Encaminhar para atendimento"
                                  >
                                    <Send className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                              </TooltipTrigger>
                              <TooltipContent>
                                Encaminhar para Atendimento
                              </TooltipContent>
                            </Tooltip>

                            <DropdownMenuContent
                              align="end"
                              className="min-w-56"
                            >
                              {p.filas?.filter(f => f.atendido == 0).length ? (
                                p.filas
                                  ?.filter(f => f.atendido == 0)
                                  .map(f => (
                                    <DropdownMenuItem
                                      key={f.id}
                                      onClick={() =>
                                        encaminharParaEspecialidade(
                                          p.id,
                                          f.fila?.especialidade_id as number,
                                          setResults
                                        )
                                      }
                                    >
                                      {f.fila?.especialidade?.nome ??
                                        'Especialidade'}
                                    </DropdownMenuItem>
                                  ))
                              ) : (
                                <DropdownMenuItem disabled>
                                  Nenhuma especialidade pendente
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        Encaminhar para Atendimento
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="icon"
                          variant="destructive"
                          aria-label="Remover da fila"
                          onClick={() => {
                            const confirmed = window.confirm(
                              'Tem certeza que deseja remover este atendimento da fila?'
                            )
                            if (confirmed) {
                              onExcluir(p.id)
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Remover da Fila</TooltipContent>
                    </Tooltip>
                  </div>

                  {/* Mobile: menu 3 pontinhos */}
                  <div className="md:hidden">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          aria-label="Abrir ações"
                        >
                          <MoreVertical className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="min-w-60">
                        <DropdownMenuItem onClick={() => onVer(p)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Visualizar triagem
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEncaminhar(p.id)}>
                          <Send className="mr-2 h-4 w-4" />
                          {p.filas?.filter(f => f.atendido == 0).length ? (
                            p.filas
                              ?.filter(f => f.atendido == 0)
                              .map(f => (
                                <DropdownMenuItem
                                  key={`enc-${f.id}`}
                                  onClick={() =>
                                    encaminharParaEspecialidade(
                                      p.id,
                                      f.fila?.especialidade_id as number,
                                      setResults
                                    )
                                  }
                                >
                                  <Send className="mr-2 h-4 w-4" />
                                  Encaminhar:{' '}
                                  {f.fila?.especialidade?.nome ??
                                    'Especialidade'}
                                </DropdownMenuItem>
                              ))
                          ) : (
                            <DropdownMenuItem disabled>
                              <Send className="mr-2 h-4 w-4" />
                              Sem especialidades pendentes
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onExcluir(p.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir da fila
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Linha 2: Tempo decorrido - Idade - Responsável (desktop) */}
                <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-muted-foreground">
                  <span>⏳ {waitingTime(p.entrada)}</span>
                  <span>🎂 {ageFromISO(p.paciente.dataNascimento)}</span>
                  <span className="hidden md:inline">
                    👨‍⚕️ Responsável triagem:{' '}
                    <span className="font-medium text-foreground">
                      {p.triagem?.usuario?.usuario}
                    </span>
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </TooltipProvider>
      <TriagemViewDialog
        open={triagemOpen}
        onOpenChange={setTriagemOpen}
        atendimento={triagemSelecionada}
      />
    </div>
  )
}
