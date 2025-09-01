'use client'

import { useMemo, useState } from 'react'
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

type EstadoAtendimento = 'Aguardando' | 'Em andamento'
type Sexo = 'Masculino' | 'Feminino'
interface Paciente {
  id: string
  createdAt: string // ISO date da abertura/ficha
  hora: string
  tempoDecorrido: string
  nome: string
  idade: string
  tags: string[] // Especialidades aguardando
  responsavel: string // Responsável pela triagem
  sexo: Sexo
  estado: EstadoAtendimento // Estado do atendimento
}

const pacientesMock: Paciente[] = [
  {
    id: '1',
    createdAt: '2025-08-31T11:18:00-04:00',
    hora: '11:18',
    tempoDecorrido: '25 min',
    nome: 'MILENA RODRIGUES BOIADEIRO',
    idade: '25 anos e 8 meses',
    tags: ['Clínico Geral', 'Exames'],
    responsavel: 'Barbara Marcela Cabral de Lima',
    sexo: 'Feminino',
    estado: 'Aguardando'
  },
  {
    id: '2',
    createdAt: '2025-08-31T17:44:00-04:00',
    hora: '17:44',
    tempoDecorrido: '2h 10min',
    nome: 'RAQUEL VIRGILIO',
    idade: '75 anos e 5 meses',
    tags: ['Emergência'],
    responsavel: 'Caroline Felipe Bezerra',
    sexo: 'Feminino',
    estado: 'Em andamento'
  },
  {
    id: '3',
    createdAt: '2025-08-31T09:05:00-04:00',
    hora: '09:05',
    tempoDecorrido: '4h 33min',
    nome: 'JOÃO PEDRO ALMEIDA',
    idade: '41 anos e 2 meses',
    tags: ['Ortopedia'],
    responsavel: 'Rafael Nogueira',
    sexo: 'Masculino',
    estado: 'Aguardando'
  }
]

export default function FilaEsperaPage() {
  // Busca
  const [query, setQuery] = useState('')

  // Filtros (checkbox)
  const [filtroEspecialidade, setFiltroEspecialidade] = useState<string[]>([])
  const [filtroSexo, setFiltroSexo] = useState<Sexo[]>([])
  const [filtroEstado, setFiltroEstado] = useState<EstadoAtendimento[]>([])

  // Handlers de ações (plugue sua lógica/rotas)
  const onVer = (id: string) => {}
  const onEncaminhar = (id: string) => {}
  const onEditar = (id: string) => {}
  const onExcluir = (id: string) => {}

  const clearQuery = () => setQuery('')
  const handleSearchClick = () => {
    // opcional: disparar busca no back-end
  }

  // Aplica ordenação (por data de abertura) e filtros
  const pacientes = useMemo(() => {
    const byCreatedAtAsc = [...pacientesMock].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )

    return byCreatedAtAsc.filter(p => {
      // Busca (nome/ID/CPF/etc. - aqui só nome/ID para exemplo)
      const q = query.trim().toLowerCase()
      const matchQuery =
        !q || p.nome.toLowerCase().includes(q) || p.id.toLowerCase().includes(q)

      if (!matchQuery) return false

      // Filtro Especialidade (tags) – se marcado, precisa ter interseção
      const matchEsp =
        filtroEspecialidade.length === 0 ||
        p.tags.some(t => filtroEspecialidade.includes(t))

      // Filtro Sexo
      const matchSexo = filtroSexo.length === 0 || filtroSexo.includes(p.sexo)

      // Filtro Estado
      const matchEstado =
        filtroEstado.length === 0 || filtroEstado.includes(p.estado)

      return matchEsp && matchSexo && matchEstado
    })
  }, [query, filtroEspecialidade, filtroSexo, filtroEstado])

  // Helpers para checkbox
  const toggleArrayFilter = <T extends string>(
    value: T,
    arr: T[],
    setArr: (next: T[]) => void
  ) => {
    const exists = arr.includes(value)
    setArr(exists ? arr.filter(x => x !== value) : [...arr, value])
  }

  // Catálogos simples (pode vir do back)
  const especialidadesCatalog = [
    'Clínico Geral',
    'Ortopedia',
    'Emergência',
    'Exames'
  ]
  const sexosCatalog: Sexo[] = ['Masculino', 'Feminino']
  const estadosCatalog: EstadoAtendimento[] = ['Aguardando', 'Em andamento']

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
              {especialidadesCatalog.map(esp => (
                <DropdownMenuCheckboxItem
                  key={esp}
                  checked={filtroEspecialidade.includes(esp)}
                  onCheckedChange={() =>
                    toggleArrayFilter(
                      esp,
                      filtroEspecialidade,
                      setFiltroEspecialidade
                    )
                  }
                >
                  {esp}
                </DropdownMenuCheckboxItem>
              ))}

              <DropdownMenuSeparator />
              <DropdownMenuLabel>Sexo</DropdownMenuLabel>
              {sexosCatalog.map(sx => (
                <DropdownMenuCheckboxItem
                  key={sx}
                  checked={filtroSexo.includes(sx)}
                  onCheckedChange={() =>
                    toggleArrayFilter(sx, filtroSexo, setFiltroSexo)
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
                    toggleArrayFilter(st, filtroEstado, setFiltroEstado)
                  }
                >
                  {st}
                </DropdownMenuCheckboxItem>
              ))}

              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setFiltroEspecialidade([])
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
              onKeyDown={e => {
                if (e.key === 'Enter') handleSearchClick()
              }}
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

          <Button onClick={handleSearchClick} className="flex items-center">
            <Search className="mr-1 h-4 w-4" />
            Buscar
          </Button>
        </CardContent>
      </Card>

      {/* LISTA */}
      <TooltipProvider>
        <div className="space-y-2">
          {pacientes.map(p => (
            <Card key={p.id}>
              <CardContent className="p-4 space-y-2">
                {/* Linha 1: Hora - Nome - Especialidades - Ações */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-sm text-muted-foreground shrink-0">
                      {p.hora}
                    </span>

                    <span className="font-semibold truncate" title={p.nome}>
                      {p.nome}
                    </span>

                    <div className="flex flex-wrap gap-2">
                      {p.tags.map((tag, i) => (
                        <Badge
                          key={i}
                          variant="secondary"
                          className="whitespace-nowrap"
                        >
                          {tag}
                        </Badge>
                      ))}
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
                          onClick={() => onVer(p.id)}
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
                          <Send className="h-4 w-4" />
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
                          variant="ghost"
                          aria-label="Editar triagem"
                          onClick={() => onEditar(p.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Editar Triagem</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="icon"
                          variant="destructive"
                          aria-label="Excluir da fila"
                          onClick={() => onExcluir(p.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Excluir da Fila</TooltipContent>
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
                        <DropdownMenuItem onClick={() => onVer(p.id)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Visualizar triagem
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEncaminhar(p.id)}>
                          <Send className="mr-2 h-4 w-4" />
                          Encaminhar para atendimento
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEditar(p.id)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar triagem
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
                  <span>⏳ {p.tempoDecorrido}</span>
                  <span>🎂 {p.idade}</span>
                  <span className="hidden md:inline">
                    👨‍⚕️ Responsável:{' '}
                    <span className="font-medium text-foreground">
                      {p.responsavel}
                    </span>
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </TooltipProvider>
    </div>
  )
}
