'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion'

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

interface CIDItem {
  code: string
  description: string
}

// --------------------
// Mocks de fetch (trocar por API/Supabase)
// --------------------
async function fetchPacienteById(pacienteId: string): Promise<Paciente | null> {
  await new Promise(r => setTimeout(r, 200))
  if (!pacienteId) return null
  return {
    id: pacienteId,
    nome: 'Carlos Ferreira',
    dataNascimento: '1986-03-22',
    cpf: '987.654.321-00',
    contato: '(67) 98888-7777'
  }
}

async function fetchTriagemAtual(
  pacienteId: string,
  filaId: string
): Promise<Triagem | null> {
  await new Promise(r => setTimeout(r, 200))
  if (!pacienteId || !filaId) return null
  return {
    pa: '130x85',
    hipertensao: 'não',
    diabetes: 'não',
    alergia: 'não'
  }
}

// Mock curto de CIDs (substitua por consulta real depois)
const MOCK_CIDS: CIDItem[] = [
  { code: 'J00', description: 'Nasofaringite aguda (resfriado comum)' },
  {
    code: 'J06.9',
    description: 'Infecção aguda das vias aéreas superiores, não especificada'
  },
  { code: 'R51', description: 'Cefaleia' },
  {
    code: 'K21.0',
    description: 'Doença do refluxo gastroesofágico com esofagite'
  },
  { code: 'I10', description: 'Hipertensão essencial (primária)' },
  { code: 'E11.9', description: 'Diabetes mellitus tipo 2 sem complicações' },
  { code: 'M54.5', description: 'Dor lombar baixa' },
  { code: 'B34.9', description: 'Infecção viral, não especificada' },
  {
    code: 'N39.0',
    description: 'Infecção do trato urinário, local não especificado'
  },
  { code: 'R50.9', description: 'Febre, não especificada' }
]

// Procedimentos de exemplo (médicos)
const PROCEDIMENTOS_PRESETS = [
  'Atendimento Médico', // padrão
  'Consulta Ambulatorial',
  'Curativo Simples',
  'Sutura Simples',
  'Retorno Pós-Operatório',
  'Medicação Intramuscular',
  'Nebulização',
  'Aferição de Pressão Arterial',
  'Retirada de Pontos'
] as const

type Procedimento = (typeof PROCEDIMENTOS_PRESETS)[number]

// Exames (checklist curto)
const EXAMES_PRESETS = [
  'Hemograma completo',
  'Glicemia em jejum',
  'Perfil lipídico',
  'Urina tipo 1',
  'PCR (Proteína C-reativa)',
  'Raio-X de tórax',
  'Eletrocardiograma (ECG)'
] as const

type Exame = (typeof EXAMES_PRESETS)[number]

export default function AtendimentoConvencionalPage() {
  const router = useRouter()
  const params = useParams<{ idFila: string }>()
  const search = useSearchParams()

  const idFila = params?.idFila
  const pacienteId = search.get('pacienteId') || ''

  // Estados
  const [carregando, setCarregando] = useState(true)
  const [dadosPaciente, setDadosPaciente] = useState<Paciente | null>(null)
  const [triagem, setTriagem] = useState<Triagem | null>(null)

  const [evolucao, setEvolucao] = useState('')
  const [prescricao, setPrescricao] = useState('')

  // Procedimentos
  const [procedimentos, setProcedimentos] = useState<Procedimento[]>([
    'Atendimento Médico'
  ])
  const toggleProcedimento = (p: Procedimento) => {
    setProcedimentos(prev =>
      prev.includes(p) ? prev.filter(i => i !== p) : [...prev, p]
    )
  }

  // CIDs (até 5)
  const [cidQuery, setCidQuery] = useState('')
  const [selectedCids, setSelectedCids] = useState<CIDItem[]>([])
  const filteredCids = useMemo(() => {
    const q = cidQuery.trim().toLowerCase()
    if (!q) return MOCK_CIDS.slice(0, 6)
    return MOCK_CIDS.filter(
      c =>
        c.code.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
    ).slice(0, 10)
  }, [cidQuery])

  const addCid = (cid: CIDItem) => {
    if (selectedCids.find(c => c.code === cid.code)) return
    if (selectedCids.length >= 5) {
      toast.warning('Você pode selecionar no máximo 5 CIDs.')
      return
    }
    setSelectedCids(prev => [...prev, cid])
  }
  const removeCid = (code: string) =>
    setSelectedCids(prev => prev.filter(c => c.code !== code))

  // Exames checklist
  const [exames, setExames] = useState<Record<Exame, boolean>>(() => {
    return EXAMES_PRESETS.reduce(
      (acc, e) => ({ ...acc, [e]: false }),
      {} as Record<Exame, boolean>
    )
  })
  const toggleExame = (e: Exame) =>
    setExames(prev => ({ ...prev, [e]: !prev[e] }))

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
    const examesSelecionados = Object.entries(exames)
      .filter(([, v]) => v)
      .map(([k]) => k)

    // TODO: enviar para API
    // payload exemplo:
    // {
    //   idFila,
    //   pacienteId,
    //   evolucao,
    //   prescricao,
    //   procedimentos,
    //   cids: selectedCids, // [{code, description}, ...]
    //   exames: examesSelecionados
    // }

    toast.success('Atendimento finalizado!')
    router.push('/atendimento')
  }

  const handleCancelar = () => {
    toast.message('Atendimento cancelado.')
    router.push('/atendimento')
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
                Atendimento Convencional
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
            {/* Section 1 — Info Paciente + Triagem (colapsável, igual ao Odonto) */}
            <section className="border rounded-lg">
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
                      {/* Paciente */}
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

                      <div className="hidden lg:block" />

                      {/* Triagem */}
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

                        {/* Badges iguais ao Odonto */}
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
            </section>

            {/* Section 2 — Procedimentos & CIDs */}
            <section className="border rounded-lg">
              <div className="px-4 py-3 text-base font-semibold border-b">
                Procedimentos & CIDs
              </div>

              <div className="px-4 pb-4 grid gap-6 md:grid-cols-2">
                {/* Procedimentos */}
                <div>
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
                          title={p}
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
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* CIDs */}
                <div>
                  <Label className="mb-2 block">Adicionar CID (máx. 5)</Label>
                  <Input
                    placeholder="Busque por código (ex: J06.9) ou descrição (ex: cefaleia)"
                    value={cidQuery}
                    onChange={e => setCidQuery(e.target.value)}
                  />

                  {/* Sugestões */}
                  <div className="mt-2 max-h-40 overflow-auto rounded-md border divide-y">
                    {filteredCids.length === 0 && (
                      <div className="px-3 py-2 text-sm text-muted-foreground">
                        Nenhum resultado
                      </div>
                    )}
                    {filteredCids.map(cid => (
                      <button
                        key={cid.code}
                        type="button"
                        onClick={() => addCid(cid)}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-muted/60"
                      >
                        <span className="font-mono font-medium mr-2">
                          {cid.code}
                        </span>
                        {cid.description}
                      </button>
                    ))}
                  </div>

                  {/* Tags selecionadas */}
                  {selectedCids.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {selectedCids.map(cid => (
                        <Badge
                          key={cid.code}
                          variant="secondary"
                          className="gap-1"
                        >
                          <span className="font-mono">{cid.code}</span> —{' '}
                          {cid.description}
                          <button
                            type="button"
                            onClick={() => removeCid(cid.code)}
                            className="ml-1 rounded-full px-1 text-xs opacity-70 hover:opacity-100"
                            aria-label={`Remover ${cid.code}`}
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Section 3 — Evolução / Prescrição / Solicitação de Exames */}
            <section className="border rounded-lg">
              <div className="px-4 py-3 text-base font-semibold border-b">
                Evolução / Prescrição / Exames
              </div>
              <div className="px-4 pb-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="evolucao">Evolução</Label>
                  <Textarea
                    id="evolucao"
                    className="mt-2 min-h-[140px]"
                    value={evolucao}
                    onChange={e => setEvolucao(e.target.value)}
                    placeholder="Descreva evolução, condutas, orientações clínicas..."
                  />
                </div>

                <div>
                  <Label htmlFor="prescricao">Prescrição</Label>
                  <Textarea
                    id="prescricao"
                    className="mt-2 min-h-[140px]"
                    value={prescricao}
                    onChange={e => setPrescricao(e.target.value)}
                    placeholder="Medicamentos e posologias (se houver)."
                  />
                </div>

                {/* Exames (checklist) */}
                <div className="md:col-span-2">
                  <Label className="mb-2 block">Solicitar Exames</Label>
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {EXAMES_PRESETS.map(ex => (
                      <label
                        key={ex}
                        className="inline-flex items-center gap-2 text-sm"
                      >
                        <Checkbox
                          checked={exames[ex]}
                          onCheckedChange={() => toggleExame(ex)}
                        />
                        <span>{ex}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Rodapé — Assinatura Digital (opcional futura) e Ações */}
            <section className="flex flex-wrap gap-3 justify-end pt-2">
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
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
