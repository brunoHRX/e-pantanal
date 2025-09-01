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
// Mocks de fetch (trocar por API/Supabase)
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

const PROCEDIMENTOS_PRESETS = [
  'Exodontia Raiz Residual',
  'Exodontia de semi inclusos',
  'Exodontia Inclusos',
  'Exodontia de decíduos',
  'Tratamento endodôntico em decíduos',
  'Sutura',
  'Anestesia Dental',
  'Radiografia Periapical',
  'Prescrição medicamentoso',
  'Remoção de cárie'
] as const

type Procedimento = (typeof PROCEDIMENTOS_PRESETS)[number]

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

  // Campos do atendimento odontológico
  const [evolucao, setEvolucao] = useState<string>('')
  const [prescricao, setPrescricao] = useState<string>('')
  const [assinatura, setAssinatura] = useState<string | null>(null)

  // Procedimentos selecionados
  const [procedimentos, setProcedimentos] = useState<Procedimento[]>([])

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
    // TODO: enviar para API: { idFila, pacienteId, evolucao, prescricao, assinatura, procedimentos }
    toast.success('Atendimento finalizado!')
    router.push('/atendimento')
  }

  const handleCancelar = () => {
    toast.message('Atendimento cancelado.')
    router.push('/atendimento')
  }

  const toggleProcedimento = (p: Procedimento) => {
    setProcedimentos(prev =>
      prev.includes(p) ? prev.filter(i => i !== p) : [...prev, p]
    )
  }

  if (carregando) {
    return (
      <div className="min-h-screen bg-[#f8f7f7] p-4">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center gap-3 pt-2">
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
      <div className="max-w-6xl mx-auto">
        {/* CARD ÚNICO */}
        <Card>
          <CardHeader className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/atendimento')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
              </Button>
              <CardTitle className="text-2xl">
                Atendimento Odontológico
              </CardTitle>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">
                Fila: <span className="font-medium">{idFila}</span>
              </p>
              <p className="text-xs text-muted-foreground">
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
                defaultValue={['info'] as any}
              >
                <AccordionItem value="info" className="border-b">
                  <AccordionTrigger className="px-4 py-3 text-base font-semibold">
                    Informações do Paciente e Triagem
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="px-4 pb-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
                      {/* Bloco Paciente */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
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
                        <div className="col-span-2">
                          <Label>Contato</Label>
                          <Input
                            value={dadosPaciente?.contato || ''}
                            readOnly
                            disabled
                          />
                        </div>
                      </div>

                      {/* Separador responsivo (opcional) */}
                      <div className="hidden lg:block" />

                      {/* Bloco Triagem Resumo */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>PA</Label>
                          <Input value={triagem?.pa || ''} readOnly disabled />
                        </div>
                        <div>
                          <Label>Hipertensão</Label>
                          <Input
                            value={triagem?.hipertensao || ''}
                            readOnly
                            disabled
                          />
                        </div>
                        <div>
                          <Label>Diabetes</Label>
                          <Input
                            value={triagem?.diabetes || ''}
                            readOnly
                            disabled
                          />
                        </div>
                        <div>
                          <Label>Alergia</Label>
                          <Input
                            value={triagem?.alergia || ''}
                            readOnly
                            disabled
                          />
                        </div>

                        {/* Chips de sinalização rápida */}
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

            {/* Section 2 — Odontograma + Procedimentos (odontograma colapsável) */}
            <div className="border rounded-lg">
              <Accordion type="single" collapsible>
                <AccordionItem value="odonto">
                  <AccordionTrigger className="px-4 py-3 text-base font-semibold">
                    Odontograma
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="px-4 pb-4">
                      <div className="flex flex-col items-center">
                        <Odontograma />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {/* Procedimentos (sempre visível abaixo do trigger) */}
              <div className="px-4 pb-4 pt-2 border-t">
                <Label className="mb-2 block">Procedimentos</Label>
                <div className="flex flex-wrap gap-2">
                  {PROCEDIMENTOS_PRESETS.map(p => {
                    const active = procedimentos.includes(p)
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => toggleProcedimento(p)}
                        className={`text-sm px-3 py-1.5 rounded-full border transition ${
                          active
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-background text-foreground border-muted-foreground/30 hover:bg-muted'
                        }`}
                        aria-pressed={active}
                      >
                        {p}
                      </button>
                    )
                  })}
                </div>

                {procedimentos.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {procedimentos.map(p => (
                      <Badge key={p} variant="secondary" className="gap-1">
                        {p}
                        <button
                          type="button"
                          onClick={() => toggleProcedimento(p)}
                          className="ml-1 rounded-full px-1 text-xs opacity-70 hover:opacity-100"
                          aria-label={`Remover ${p}`}
                          title="Remover"
                        >
                          ×
                        </button>
                      </Badge>
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
              <div className="px-4 pb-4 grid grid-cols-1 gap-4">
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

            {/* Rodapé — Assinatura Digital + Ações */}
            <div className="border rounded-lg">
              <div className="px-4 py-3 text-base font-semibold border-b">
                Assinatura Digital
              </div>
              <div className="px-4 pb-4">
                <div className="border-2 border-dashed rounded-lg p-10 text-center text-slate-400">
                  Componente de assinatura digital aqui
                </div>
              </div>
            </div>

            {/* Botões de ação (apenas Finalizar e Cancelar) */}
            <div className="flex flex-wrap gap-3 justify-end pt-2">
              <Button
                onClick={handleFinalizar}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Finalizar atendimento
              </Button>
              <Button
                variant="outline"
                className="border-destructive text-destructive hover:bg-destructive/10"
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
