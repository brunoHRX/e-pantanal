'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { getAllPatients, type Patient } from '@/services/patientService'
import { AtendimentoHistoricoDto, Historico, getAll } from '@/services/historicoService'
import { safeDateLabel, safeDateTimeLabel } from '@/utils/functions'

export default function HistoricoPage() {
  // pacientes
  const [results, setResults] = useState<Historico[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [query, setQuery] = useState('')
  const [filtered, setFiltered] = useState<Patient[]>([])
  const [selected, setSelected] = useState<Patient | null>(null)
  const [loadingPatients, setLoadingPatients] = useState(false)
  const [errorPatients, setErrorPatients] = useState<string | null>(null)

  // atendimentos (mock por enquanto)
  const [atendimentos, setAtendimentos] = useState<AtendimentoHistoricoDto[]>([])
  const [loadingAtend, setLoadingAtend] = useState(false)
  const [errorAtend, setErrorAtend] = useState<string | null>(null)

  // === Carrega pacientes 1x ===
  useEffect(() => {
    const run = async () => {
      setLoadingPatients(true)
      setErrorPatients(null)
      try {
        const list = await getAll()
        setResults(list)
        const pacientesHistorico = list.map(h => h.paciente);
        setPatients(pacientesHistorico)
        setFiltered(pacientesHistorico)
      } catch (e: any) {
        setErrorPatients(e?.message ?? 'Falha ao carregar pacientes.')
      } finally {
        setLoadingPatients(false)
      }
    }
    run()
  }, [])

  // === Filtro local ===
  useEffect(() => {
    const q = query.trim().toLowerCase()
    if (!q) {
      setFiltered(patients)
      return
    }
    setFiltered(
      patients.filter(
        p =>
          (p.nome ?? '').toLowerCase().includes(q) ||
          (p.cpf ?? '').toLowerCase().includes(q)
      )
    )
  }, [query, patients])

  // cabeçalho do paciente
  const headerInfo = useMemo(() => {
    if (!selected) return null
    return (
      <div className="flex flex-col gap-1">
        <div className="text-lg font-medium">{selected.nome}</div>
        <div className="text-xs text-muted-foreground">
          {selected.cpf ? `Doc.: ${selected.cpf}` : '—'}
          {selected.dataNascimento
            ? ` • Nasc.: ${safeDateLabel(selected.dataNascimento)}`
            : ''}
        </div>
      </div>
    )
  }, [selected])

  async function handleSelecionarPaciente(p: Patient) {    
    setSelected(p)
    setLoadingAtend(true)
    setErrorAtend(null)
    const historico = results.find(h => h.paciente == p);
    const atendimentosHistorico = historico?.atendimentos;
    setAtendimentos(atendimentosHistorico ?? [])
    setLoadingAtend(false)
  }

  return (
    <div className="container mx-auto max-w-5xl py-6 space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Histórico de Atendimentos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Seleção de paciente */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-2">
              <label className="text-sm font-medium">Selecionar paciente</label>
              <Input
                placeholder="Filtrar por nome ou documento..."
                value={query}
                onChange={e => setQuery(e.target.value)}
              />

              <div className="relative rounded-lg border overflow-hidden bg-card">
                <ScrollArea className="h-64">
                  <ul className="divide-y">
                    {loadingPatients && (
                      <li className="p-3 text-sm text-muted-foreground">
                        Carregando pacientes...
                      </li>
                    )}
                    {!loadingPatients && errorPatients && (
                      <li className="p-3 text-sm text-red-600">
                        {errorPatients}
                      </li>
                    )}
                    {!loadingPatients &&
                      !errorPatients &&
                      filtered.length === 0 && (
                        <li className="p-3 text-sm text-muted-foreground">
                          Nenhum paciente encontrado.
                        </li>
                      )}
                    {!loadingPatients &&
                      !errorPatients &&
                      filtered.map(p => (
                        <li
                          key={p.id}
                          className={`p-3 hover:bg-muted/50 cursor-pointer flex items-center justify-between ${
                            selected?.id === p.id ? 'bg-muted' : ''
                          }`}
                          onClick={() => {
                            handleSelecionarPaciente(p)
                            setErrorAtend(null)
                          }}
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">{p.nome}</span>
                            <span className="text-xs text-muted-foreground">
                              {p.cpf ?? '—'}
                              {p.dataNascimento
                                ? ` • ${safeDateLabel(p.dataNascimento)}`
                                : ''}
                            </span>
                          </div>
                          <Badge
                            variant={
                              selected?.id === p.id ? 'secondary' : 'outline'
                            }
                          >
                            {selected?.id === p.id
                              ? 'Selecionado'
                              : 'Selecionar'}
                          </Badge>
                        </li>
                      ))}
                  </ul>
                </ScrollArea>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="rounded-lg border p-3 h-full">
                <div className="text-sm font-medium mb-2">Paciente</div>
                {selected ? (
                  <div className="space-y-1">{headerInfo}</div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    Nenhum paciente selecionado.
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Lista de atendimentos (placeholder + mock) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Atendimentos</div>
            </div>

            <Card className="border-dashed">
              <CardContent className="p-0">
                <ScrollArea className="max-h-[60vh]">
                  <ul className="divide-y">
                    {!selected && (
                      <li className="p-4 text-sm text-muted-foreground">
                        Selecione um paciente para visualizar os atendimentos.
                      </li>
                    )}
                    {selected && errorAtend && (
                      <li className="p-4 text-sm text-red-600">{errorAtend}</li>
                    )}
                    {selected &&
                      !errorAtend &&
                      atendimentos.length === 0 &&
                      !loadingAtend && (
                        <li className="p-4 text-sm text-muted-foreground">
                          Nenhum atendimento carregado. Clique no botão acima
                          para carregar.
                        </li>
                      )}

                    {atendimentos.map(a => (
                      <li
                        key={a.id}
                        className="p-4 flex items-center justify-between gap-4"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium truncate">
                              {a.triagem?.queixa ?? ""}
                            </span>
                            <Badge variant="outline">{a.status ?? '—'}</Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {safeDateTimeLabel(a.entrada)}
                            {a.usuario
                              ? ` • Prof.: ${a.usuario.nome}`
                              : ''}
                          </div>
                        </div>
                        <div className="shrink-0 flex items-center gap-2">
                          {/* Quando plugar, pode manter o link abaixo */}
                          {/* <Link
                            href={`/atendimento/convencional/${a.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="outline">Abrir</Button>
                          </Link> */}
                        </div>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
