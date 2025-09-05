'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import Odontograma from '../componentes/Odontograma'
import type { ToothSelectionsMap } from '../componentes/OdontogramaQuadrante'

// --------------------
// Tipos
// --------------------
interface Paciente {
  id: string
  nome: string
  dataNascimento: string
  cpf: string
  contato: string
}

interface Triagem {
  pa: string
  hipertensao: string
  diabetes: string
  alergia: string
}

// --------------------
// Mocks (trocar por API/Supabase)
// --------------------
async function fetchPacienteById(pacienteId: string): Promise<Paciente | null> {
  await new Promise(r => setTimeout(r, 250))
  if (!pacienteId) return null
  return {
    id: pacienteId,
    nome: 'Maria Oliveira',
    dataNascimento: '1990-05-12',
    cpf: '123.456.789-00',
    contato: '(67) 99999-8888'
  }
}

async function fetchTriagemAtual(
  pacienteId: string,
  filaId: string
): Promise<Triagem | null> {
  await new Promise(r => setTimeout(r, 250))
  if (!pacienteId || !filaId) return null
  return {
    pa: '120x80',
    hipertensao: 'não',
    diabetes: 'sim',
    alergia: 'não'
  }
}

export default function AtendimentoOdontologicoPage() {
  const router = useRouter()
  const params = useParams<{ idFila: string }>()
  const search = useSearchParams()

  const idFila = params?.idFila
  const pacienteId = search.get('pacienteId') || ''

  // estados
  const [carregando, setCarregando] = useState(true)
  const [dadosPaciente, setDadosPaciente] = useState<Paciente | null>(null)
  const [triagem, setTriagem] = useState<Triagem | null>(null)

  // Campos do atendimento
  const [evolucao, setEvolucao] = useState<string>('')
  const [prescricao, setPrescricao] = useState<string>('')

  // Seleções do Odontograma (por dente) — CONTROLADO
  const [odontoSelections, setOdontoSelections] = useState<ToothSelectionsMap>(
    {}
  )

  // Accordion controlado somente para Info+Triagem
  const [infoOpen, setInfoOpen] = useState<string | undefined>('info')

  useEffect(() => {
    let ativo = true
    setCarregando(true)
    Promise.all([
      fetchPacienteById(pacienteId),
      fetchTriagemAtual(pacienteId, idFila)
    ])
      .then(([pac, tri]) => {
        if (!ativo) return
        setDadosPaciente(pac)
        setTriagem(tri)
      })
      .finally(() => ativo && setCarregando(false))
    return () => {
      ativo = false
    }
  }, [pacienteId, idFila])

  // Ações
  const handleFinalizar = async () => {
    // TODO: enviar para API:
    // {
    //   idFila,
    //   pacienteId,
    //   evolucao,
    //   prescricao,
    //   odontograma: odontoSelections
    // }
    toast.success('Atendimento finalizado!')
    router.push('/atendimento')
  }

  const handleCancelar = () => {
    toast.message('Atendimento cancelado.')
    router.push('/atendimento')
  }

  const selectionsArray = Object.values(odontoSelections).filter(
    s => (s.procedures?.length || 0) > 0
  )

  if (carregando) {
    return (
      <div className="min-h-screen bg-[#f8f7f7] p-4">
        <div className="mx-auto w-full max-w-6xl space-y-6">
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => router.push('/atendimento')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Voltar para Fila
            </Button>
            <span className="text-sm text-muted-foreground">
              Carregando atendimento…
            </span>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-6 bg-muted rounded w-1/3" />
                <div className="h-4 bg-muted rounded w-1/2" />
                <div className="h-48 bg-muted rounded" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8f7f7] p-4">
      <div className="mx-auto w-full max-w-7xl">
        {/* CARD ÚNICO */}
        <Card className="w-full">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/atendimento')}
                className="w-full sm:w-auto"
              >
                <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
              </Button>
              <CardTitle className="text-xl sm:text-2xl">
                Atendimento Odontológico
              </CardTitle>
            </div>
            <div className="text-left sm:text-right text-xs text-muted-foreground">
              <p>
                Fila: <span className="font-medium">{idFila}</span>
              </p>
              <p>
                Paciente:{' '}
                <span className="font-medium">{dadosPaciente?.id}</span>
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Section 1 — Info Paciente + Triagem (colapsável) */}
            <div className="border rounded-lg">
              <Accordion
                type="single"
                collapsible
                value={infoOpen}
                onValueChange={setInfoOpen}
              >
                <AccordionItem value="info" className="border-b">
                  <AccordionTrigger className="px-4 py-3 text-base font-semibold">
                    Informações do Paciente e Triagem
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Paciente */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="sm:col-span-2">
                          <Label>Nome</Label>
                          <Input
                            value={dadosPaciente?.nome || ''}
                            readOnly
                            disabled
                          />
                        </div>
                        <div>
                          <Label>Data de Nascimento</Label>
                          <Input
                            value={dadosPaciente?.dataNascimento || ''}
                            readOnly
                            disabled
                          />
                        </div>
                        <div>
                          <Label>CPF</Label>
                          <Input
                            value={dadosPaciente?.cpf || ''}
                            readOnly
                            disabled
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <Label>Contato</Label>
                          <Input
                            value={dadosPaciente?.contato || ''}
                            readOnly
                            disabled
                          />
                        </div>
                      </div>

                      {/* Espaço responsivo (só em ≥ lg) */}
                      <div className="hidden lg:block" />

                      {/* Triagem */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2 sm:col-span-1">
                          <Label>PA</Label>
                          <Input value={triagem?.pa || ''} readOnly disabled />
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <Label>Hipertensão</Label>
                          <Input
                            value={triagem?.hipertensao || ''}
                            readOnly
                            disabled
                          />
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <Label>Diabetes</Label>
                          <Input
                            value={triagem?.diabetes || ''}
                            readOnly
                            disabled
                          />
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <Label>Alergia</Label>
                          <Input
                            value={triagem?.alergia || ''}
                            readOnly
                            disabled
                          />
                        </div>

                        <div className="col-span-2 flex flex-wrap gap-2 mt-2">
                          {triagem?.hipertensao === 'sim' && (
                            <Badge className="bg-rose-600">Hipertenso</Badge>
                          )}
                          {triagem?.diabetes === 'sim' && (
                            <Badge className="bg-amber-600">Diabético</Badge>
                          )}
                          {triagem?.alergia === 'sim' && (
                            <Badge className="bg-purple-600">Alergia</Badge>
                          )}
                          <Badge variant="secondary">
                            PA: {triagem?.pa || '—'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            {/* Section 2 — Odontograma (sem colapse) + Resumo */}
            <div className="border rounded-lg">
              <div className="px-4 py-3 text-base font-semibold border-b">
                Odontograma
              </div>

              {/* Odontograma sempre visível; contêiner responsivo sem overflow */}
              <div className="px-2 sm:px-4 pb-4 w-full">
                <div className="w-full max-w-full">
                  <Odontograma
                    value={odontoSelections}
                    onChange={setOdontoSelections}
                  />
                </div>
              </div>

              {/* Resumo de procedimentos por dente */}
              <div className="px-4 pb-4 pt-2 border-t space-y-2">
                <Label className="mb-2 block">
                  Procedimentos selecionados por dente
                </Label>
                {selectionsArray.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Nenhum procedimento selecionado no odontograma.
                  </p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {selectionsArray.map(sel => (
                      <div key={sel.tooth} className="flex flex-col gap-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge
                            variant="secondary"
                            className="font-mono"
                            title={`Dente ${sel.tooth} (Q${sel.quadrant})`}
                          >
                            {sel.tooth}
                          </Badge>
                          {sel.faces?.length > 0 && (
                            <Badge variant="outline" className="opacity-80">
                              Faces: {sel.faces.join('/')}
                            </Badge>
                          )}
                          {/* Remover todos deste dente (opcional) */}
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-6 px-2"
                            onClick={() =>
                              setOdontoSelections(prev => {
                                const next = { ...prev }
                                delete next[sel.tooth]
                                return next
                              })
                            }
                          >
                            Limpar dente
                          </Button>
                        </div>

                        {/* Procedimentos com “×” para remover individualmente */}
                        <div className="flex flex-wrap gap-2 pl-0 sm:pl-6">
                          {sel.procedures.map(p => (
                            <Badge
                              key={`${sel.tooth}-${p}`}
                              variant="secondary"
                              className="gap-1"
                            >
                              {p}
                              <button
                                type="button"
                                onClick={() => {
                                  setOdontoSelections(prev => {
                                    const next = { ...prev }
                                    const atual = next[sel.tooth]
                                    if (!atual) return prev
                                    const novas = atual.procedures.filter(
                                      proc => proc !== p
                                    )
                                    if (novas.length === 0) {
                                      delete next[sel.tooth]
                                    } else {
                                      next[sel.tooth] = {
                                        ...atual,
                                        procedures: novas
                                      }
                                    }
                                    return next
                                  })
                                }}
                                className="ml-1 rounded-full px-1 text-xs opacity-70 hover:opacity-100"
                                aria-label={`Remover ${p}`}
                                title="Remover procedimento"
                              >
                                ×
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Section 3 — Evolução / Tratamento / Prescrição */}
            <div className="border rounded-lg">
              <div className="px-4 py-3 text-base font-semibold border-b">
                Evolução / Tratamento / Prescrição
              </div>
              <div className="px-4 pb-4 grid grid-cols-1 mt-4 gap-4">
                <div>
                  <Label htmlFor="evolucao">Evolução e Condutas</Label>
                  <Textarea
                    id="evolucao"
                    className="mt-2 min-h-[140px]"
                    value={evolucao}
                    onChange={e => setEvolucao(e.target.value)}
                    placeholder="Descreva evolução, procedimentos realizados, materiais utilizados..."
                  />
                </div>
                <div>
                  <Label htmlFor="prescricao">Possível Prescrição</Label>
                  <Textarea
                    id="prescricao"
                    className="mt-2 min-h-[100px]"
                    value={prescricao}
                    onChange={e => setPrescricao(e.target.value)}
                    placeholder="Medicamentos prescritos e orientações pós-procedimento (se houver)."
                  />
                </div>
              </div>
            </div>

            {/* Botões de ação */}
            <div className="flex flex-col sm:flex-row gap-3 justify-end pt-2">
              <Button
                onClick={handleFinalizar}
                className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto"
              >
                Finalizar atendimento
              </Button>
              <Button
                variant="outline"
                className="border-destructive text-destructive hover:bg-destructive/10 w-full sm:w-auto"
                onClick={handleCancelar}
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
