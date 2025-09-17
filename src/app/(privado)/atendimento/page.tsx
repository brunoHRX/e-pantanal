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
  DropdownMenuItem,
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
  MapPin,
  X,
  Search
} from 'lucide-react'
import { stripDiacritics } from '@/utils/functions'
import { AtendimentoFluxo, getAll } from '@/services/fluxoService'

// =====================
// Página
// =====================
export default function FilaDeAtendimentoPage() {
  const router = useRouter()
  const [userName, setUserName] = useState<string>("");
  const [userEspecialidade, setEspecialidade] = useState<number>()
  const [results, setResults] = useState<AtendimentoFluxo[]>([])
  const [filtroPrioridade, setFiltroPrioridade] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState('')

  const prioridades = [
    { id: "baixa", nome: "Baixa" },
    { id: "media", nome: "Média" },
    { id: "alta", nome: "Alta" },
    { id: "urgente", nome: "Urgente" }
  ];

  useEffect(() => {
    const storedUser = localStorage.getItem("userData");
    if (storedUser) {
      const user = JSON.parse(storedUser);      
      setEspecialidade(user.especialidade_id);
      setUserName(user.usuario.toUpperCase());
    }
    runSearch()
  }, [])

  async function runSearch() {
    setLoading(true)
    try {
      const q = query?.trim().toLowerCase() || ''
      const qNorm = stripDiacritics(q)
      const dados = (await getAll()).sort((a, b) => new Date(a.entrada).getTime() - new Date(b.entrada).getTime())
      
      const filtrados = dados.filter(atendimento => {
        const nomePaciente = stripDiacritics((atendimento.paciente?.nome ?? '').toLowerCase())
        const matchQuery = qNorm === '' || nomePaciente.includes(qNorm) || String(atendimento.paciente?.id ?? '').includes(qNorm)
        const matchEspecialidade = userEspecialidade == null || atendimento.fila?.especialidade_id === userEspecialidade
        const pacientePrioridade = (atendimento.triagem?.prioridade ?? '').toLowerCase()
        const matchPrioridade = filtroPrioridade.length === 0 || filtroPrioridade.map(s => s.toLowerCase()).includes(pacientePrioridade)
        return matchQuery && matchPrioridade && matchEspecialidade
      })
      setResults(filtrados)
    } catch (err) {
      toast.error((err as Error).message)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-bold">
            Fila de Espera — {userName}
          </CardTitle>

          {/* headerRight: filtros */}
          <div className="flex items-center gap-2">
            {/* Botão de Filtros - Dropdown com checkboxes */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" aria-label="Abrir filtros">
                  <Filter className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Filtros</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64" align="end">
                <DropdownMenuLabel>Prioridades</DropdownMenuLabel>
                {prioridades.map(prior => (
                  <DropdownMenuCheckboxItem
                    key={prior.id}
                    checked={filtroPrioridade.includes(prior.id)}
                    onCheckedChange={() =>
                      setFiltroPrioridade(prev =>
                        prev.includes(prior.id)
                          ? prev.filter(id => id !== prior.id)
                          : [...prev, prior.id]
                      )
                    }
                  >
                    {prior.nome.toUpperCase()}
                  </DropdownMenuCheckboxItem>
                ))}

                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    setFiltroPrioridade([])
                  }}
                >
                  Limpar filtros
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        {/* Barra de busca com título embutido */}
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
                onClick={() => setQuery('')}
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

        {!loading && results.length === 0 && (
          <Card>
            <CardContent className="p-6 text-sm text-muted-foreground">
              Nenhum paciente na sua fila com os filtros atuais.
            </CardContent>
          </Card>
        )}

        {!loading &&
          results.map(atendimento => {
            return (
              <Card key={atendimento.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    {/* Bloco 1: identidade e meta */}
                    <div className="flex items-start gap-3">
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
