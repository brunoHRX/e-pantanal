'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { toast } from 'sonner'
import {
  Stethoscope,
  Timer,
  Filter,
  Activity,
  CalendarClock,
  ChevronRight,
  ShieldAlert,
  MapPin
} from 'lucide-react'

// =====================
// Tipos
// =====================
type StatusAtendimento = 'aguardando' | 'em_triagem' | 'prioridade' | 'retorno'
type Origem = 'recepcao' | 'encaixe' | 'telemed' | 'interno'
type Prioridade = 'baixa' | 'media' | 'alta' | 'urgente'

interface PacienteFila {
  idFila: string
  pacienteId: string
  nome: string
  prontuario: string
  idade: number
  genero?: 'F' | 'M' | 'O'
  horaChegadaISO: string
  status: StatusAtendimento
  prioridade: Prioridade
  origem: Origem
  queixaPrincipal?: string
  unidade?: string
  atribuicoes: {
    profissionalId: string
    especialidade: 'odonto' | 'convencional' // especialidade do PROF responsável por atender ESTE paciente
  }
}

// =====================
// Mock: sessão e dados
// =====================

// simule o usuário logado — em produção, traga do seu auth/session
const getSessaoMock = () => ({
  profissionalId: 'prof-123',
  nome: 'Dra. Ana',
  especialidade: 'odonto' as const
})

// simule uma chamada à API (filtrando por profissionalId)
async function fetchFilaDoProfissional(
  profissionalId: string
): Promise<PacienteFila[]> {
  // troque por fetch('/api/fila?...') ou Supabase
  // filtrando no servidor por atribuicoes.profissionalId === profissionalId
  await new Promise(r => setTimeout(r, 300)) // pequeno delay
  const agora = new Date()
  const iso = (minOffset: number) =>
    new Date(agora.getTime() - minOffset * 60_000).toISOString()

  return [
    {
      idFila: 'f-001',
      pacienteId: 'p-01',
      nome: 'Maria Oliveira',
      prontuario: '000123',
      idade: 34,
      genero: 'F',
      horaChegadaISO: iso(18),
      status: 'aguardando',
      prioridade: 'alta',
      origem: 'recepcao',
      queixaPrincipal: 'Dor de dente superior direito há 2 dias',
      unidade: 'Unidade Centro',
      atribuicoes: { profissionalId, especialidade: 'odonto' }
    },
    {
      idFila: 'f-002',
      pacienteId: 'p-02',
      nome: 'Carlos Silva',
      prontuario: '000456',
      idade: 41,
      genero: 'M',
      horaChegadaISO: iso(40),
      status: 'aguardando',
      prioridade: 'media',
      origem: 'encaixe',
      queixaPrincipal: 'Revisão / limpeza',
      unidade: 'Unidade Centro',
      atribuicoes: { profissionalId, especialidade: 'odonto' }
    },
    {
      idFila: 'f-003',
      pacienteId: 'p-03',
      nome: 'Joana Souza',
      prontuario: '000789',
      idade: 12,
      genero: 'F',
      horaChegadaISO: iso(7),
      status: 'retorno',
      prioridade: 'baixa',
      origem: 'recepcao',
      queixaPrincipal: 'Retorno de procedimento',
      unidade: 'Unidade Bairro',
      atribuicoes: { profissionalId, especialidade: 'convencional' }
    }
  ]
}

// =====================
// Utilidades
// =====================
function tempoDeEsperaMin(horaChegadaISO: string) {
  const d = new Date(horaChegadaISO).getTime()
  const diff = Date.now() - d
  return Math.max(0, Math.round(diff / 60000))
}

const prioridadeColor: Record<Prioridade, string> = {
  urgente: 'bg-red-600',
  alta: 'bg-orange-600',
  media: 'bg-amber-600',
  baixa: 'bg-emerald-600'
}

function initials(nome: string) {
  return nome
    .split(' ')
    .slice(0, 2)
    .map(p => p[0]?.toUpperCase() ?? '')
    .join('')
}

// =====================
// Página
// =====================
export default function FilaDeAtendimentoDoProfissionalPage() {
  const router = useRouter()
  const sessao = useMemo(getSessaoMock, [])
  const [query, setQuery] = useState('')
  const [abrindo, setAbrindo] = useState(false)

  // filtros (dropdown com checkbox)
  const [fltStatus, setFltStatus] = useState<StatusAtendimento[]>([
    'aguardando',
    'retorno'
  ])
  const [fltPrioridade, setFltPrioridade] = useState<Prioridade[]>([
    'urgente',
    'alta',
    'media',
    'baixa'
  ])
  const [fltOrigem, setFltOrigem] = useState<Origem[]>([
    'recepcao',
    'encaixe',
    'telemed',
    'interno'
  ])

  const [itens, setItens] = useState<PacienteFila[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetchFilaDoProfissional(sessao.profissionalId)
      .then(setItens)
      .finally(() => setLoading(false))
  }, [sessao.profissionalId])

  const itensFiltrados = useMemo(() => {
    return (
      itens
        .filter(
          i =>
            (i.nome.toLowerCase().includes(query.toLowerCase()) ||
              i.prontuario.toLowerCase().includes(query.toLowerCase())) &&
            fltStatus.includes(i.status) &&
            fltPrioridade.includes(i.prioridade) &&
            fltOrigem.includes(i.origem)
        )
        // ordena: prioridade > tempo de espera
        .sort((a, b) => {
          const orderPri: Prioridade[] = ['urgente', 'alta', 'media', 'baixa']
          const dPri =
            orderPri.indexOf(a.prioridade) - orderPri.indexOf(b.prioridade)
          if (dPri !== 0) return dPri
          return (
            tempoDeEsperaMin(b.horaChegadaISO) -
            tempoDeEsperaMin(a.horaChegadaISO)
          )
        })
    )
  }, [itens, query, fltStatus, fltPrioridade, fltOrigem])

  function toggle<T>(arr: T[], value: T) {
    return arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value]
  }

  // Navegação para páginas de atendimento
  // Troque os paths abaixo conforme sua estrutura
  const handleAtenderOdonto = (item: PacienteFila) => {
    setAbrindo(true)
    toast.message('Abrindo atendimento Odonto…')
    router.push(
      `/atendimento/odonto/${item.idFila}?pacienteId=${item.pacienteId}`
    )
  }

  const handleAtenderConvencional = (item: PacienteFila) => {
    setAbrindo(true)
    toast.message('Abrindo atendimento Convencional…')
    router.push(
      `/atendimento/convencional/${item.idFila}?pacienteId=${item.pacienteId}`
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-bold">
            Fila de Espera — {sessao.nome}
          </CardTitle>

          {/* headerRight: filtros */}
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Filtros
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>Status</DropdownMenuLabel>
                <DropdownMenuCheckboxItem
                  checked={fltStatus.includes('aguardando')}
                  onCheckedChange={() =>
                    setFltStatus(prev => toggle(prev, 'aguardando'))
                  }
                >
                  Aguardando
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={fltStatus.includes('em_triagem')}
                  onCheckedChange={() =>
                    setFltStatus(prev => toggle(prev, 'em_triagem'))
                  }
                >
                  Em triagem
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={fltStatus.includes('prioridade')}
                  onCheckedChange={() =>
                    setFltStatus(prev => toggle(prev, 'prioridade'))
                  }
                >
                  Prioridade (flag)
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={fltStatus.includes('retorno')}
                  onCheckedChange={() =>
                    setFltStatus(prev => toggle(prev, 'retorno'))
                  }
                >
                  Retorno
                </DropdownMenuCheckboxItem>

                <DropdownMenuSeparator />
                <DropdownMenuLabel>Prioridade</DropdownMenuLabel>
                {(['urgente', 'alta', 'media', 'baixa'] as Prioridade[]).map(
                  p => (
                    <DropdownMenuCheckboxItem
                      key={p}
                      checked={fltPrioridade.includes(p)}
                      onCheckedChange={() =>
                        setFltPrioridade(prev => toggle(prev, p))
                      }
                      className="capitalize"
                    >
                      {p}
                    </DropdownMenuCheckboxItem>
                  )
                )}

                <DropdownMenuSeparator />
                <DropdownMenuLabel>Origem</DropdownMenuLabel>
                {(
                  ['recepcao', 'encaixe', 'telemed', 'interno'] as Origem[]
                ).map(o => (
                  <DropdownMenuCheckboxItem
                    key={o}
                    checked={fltOrigem.includes(o)}
                    onCheckedChange={() =>
                      setFltOrigem(prev => toggle(prev, o))
                    }
                    className="capitalize"
                  >
                    {o}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        {/* Barra de busca com título embutido */}
        <CardContent className="flex flex-col gap-2 md:flex-row">
          <div className="flex-1">
            <Label className="text-xs uppercase text-muted-foreground">
              Fila de Espera
            </Label>
            <div className="relative mt-1">
              <Input
                placeholder="Pesquise por nome ou nº de prontuário"
                value={query}
                onChange={e => setQuery(e.target.value)}
                aria-label="Campo de busca da fila do profissional"
                className="pr-10"
              />
              {/* Ícone de search opcional (se tiver) */}
              {/* <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /> */}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista */}
      <div className="grid grid-cols-1 gap-3">
        {loading && (
          <Card>
            <CardContent className="p-6 text-sm text-muted-foreground">
              Carregando fila…
            </CardContent>
          </Card>
        )}

        {!loading && itensFiltrados.length === 0 && (
          <Card>
            <CardContent className="p-6 text-sm text-muted-foreground">
              Nenhum paciente na sua fila com os filtros atuais.
            </CardContent>
          </Card>
        )}

        {!loading &&
          itensFiltrados.map(item => {
            const mins = tempoDeEsperaMin(item.horaChegadaISO)
            const priClass = prioridadeColor[item.prioridade]

            return (
              <Card key={item.idFila}>
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    {/* Bloco 1: identidade e meta */}
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>{initials(item.nome)}</AvatarFallback>
                      </Avatar>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-base">
                            {item.nome}
                          </span>
                          <Badge variant="secondary">
                            Pront. {item.prontuario}
                          </Badge>
                          {item.unidade && (
                            <Badge variant="outline" className="gap-1">
                              <MapPin className="h-3 w-3" />
                              {item.unidade}
                            </Badge>
                          )}
                        </div>

                        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                          <span>
                            {item.idade} anos
                            {item.genero ? ` • ${item.genero}` : ''}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <CalendarClock className="h-3.5 w-3.5" />
                            Chegou há {mins} min
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Activity className="h-3.5 w-3.5" />
                            Status: {item.status}
                          </span>
                        </div>

                        {item.queixaPrincipal && (
                          <p className="mt-2 text-sm text-muted-foreground">
                            <span className="inline-flex items-center gap-1 font-medium text-foreground">
                              <ShieldAlert className="h-3.5 w-3.5" /> Queixa:
                            </span>{' '}
                            {item.queixaPrincipal}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Bloco 2: prioridade + ações */}
                    <div className="flex items-center gap-2 md:self-center">
                      <Badge className={`${priClass}`}>
                        {item.prioridade.toUpperCase()}
                      </Badge>

                      {/* Atendimento Odonto */}
                      <Button
                        className="gap-2"
                        onClick={() => handleAtenderOdonto(item)}
                        disabled={abrindo}
                        variant={
                          item.atribuicoes.especialidade === 'odonto'
                            ? 'default'
                            : 'outline'
                        }
                      >
                        <Stethoscope className="h-4 w-4" />
                        Atendimento Odonto
                        <ChevronRight className="h-4 w-4" />
                      </Button>

                      {/* Atendimento Convencional */}
                      <Button
                        className="gap-2"
                        onClick={() => handleAtenderConvencional(item)}
                        disabled={abrindo}
                        variant={
                          item.atribuicoes.especialidade === 'convencional'
                            ? 'default'
                            : 'outline'
                        }
                      >
                        <Timer className="h-4 w-4" />
                        Atendimento Convencional
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
      </div>
    </div>
  )
}
