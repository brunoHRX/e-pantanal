'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
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
import { ArrowLeft, Printer, CheckCircle2, XCircle } from 'lucide-react'
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
  await new Promise(r => setTimeout(r, 200))
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
  await new Promise(r => setTimeout(r, 200))
  if (!pacienteId || !filaId) return null
  return {
    pa: '120x80',
    hipertensao: 'não',
    diabetes: 'sim',
    alergia: 'não'
  }
}

// Procedimentos Odontológicos (mock primário) — TODO: puxar do backend
const PROCED_ODONTO_DB = [
  'Profilaxia (limpeza)',
  'Raspagem supra gengival',
  'Restauração Amálgama',
  'Restauração Resina Composta',
  'Restauração Provisória',
  'Tratamento Endodôntico (canal)',
  'Curativo Endodôntico',
  'Extração Simples',
  'Extração de Terceiro Molar',
  'Cirurgia Periodontal',
  'Selante',
  'Aplicação de Flúor',
  'Cimentação de Coroa/Onlay/Inlay',
  'Ajuste Oclusal',
  'Radiografia Periapical',
  'Controle de Placa/Orientação'
] as const
type ProcedOdonto = (typeof PROCED_ODONTO_DB)[number]

// Medicações (mock) — TODO: puxar do backend
const MEDICACOES_DB = [
  'Dipirona 500 mg',
  'Paracetamol 750 mg',
  'Ibuprofeno 400 mg',
  'Amoxicilina 500 mg',
  'Azitromicina 500 mg',
  'Loratadina 10 mg',
  'Naproxeno 500 mg',
  'Nimesulida 100 mg',
  'Omeprazol 20 mg',
  'Dexametasona 4 mg'
] as const

// --------------------
// Helpers
// --------------------
const debounce = (fn: (...a: any[]) => void, ms = 500) => {
  let t: any
  return (...args: any[]) => {
    clearTimeout(t)
    t = setTimeout(() => fn(...args), ms)
  }
}

export default function AtendimentoOdontologicoPage() {
  const router = useRouter()
  const params = useParams<{ idFila: string }>()
  const search = useSearchParams()

  const idFila = params?.idFila || ''
  const pacienteId = search.get('pacienteId') || ''

  // estados base
  const [carregando, setCarregando] = useState(true)
  const [dadosPaciente, setDadosPaciente] = useState<Paciente | null>(null)
  const [triagem, setTriagem] = useState<Triagem | null>(null)

  // cronômetro
  const [elapsed, setElapsed] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // dirty / bloqueio saída
  const [dirty, setDirty] = useState(false)
  const setDirtyDebounced = useMemo(
    () => debounce(() => setDirty(true), 300),
    []
  )

  // autosave
  const lsKey = `att-odonto:${idFila}:${pacienteId}`
  const saveLocal = useMemo(
    () =>
      debounce((data: any) => {
        try {
          localStorage.setItem(lsKey, JSON.stringify(data))
        } catch {}
      }, 500),
    [lsKey]
  )
  const loadLocal = () => {
    try {
      const raw = localStorage.getItem(lsKey)
      if (!raw) return
      const data = JSON.parse(raw)
      setEvolucao(data.evolucao ?? '')
      setOdontoSelections(data.odontograma ?? {})
      setProcedSelecionados(data.procedSelecionados ?? [])
      setMedicacoes(data.medicacoes ?? [])
    } catch {}
  }

  // campos
  const [evolucao, setEvolucao] = useState<string>('')

  // odontograma controlado
  const [odontoSelections, setOdontoSelections] = useState<ToothSelectionsMap>(
    {}
  )

  // accordion infos
  const [infoOpen, setInfoOpen] = useState<string | undefined>('info')

  // Procedimentos Odonto — busca + lista + tags
  const [procedQuery, setProcedQuery] = useState('')
  const [procedSelecionados, setProcedSelecionados] = useState<ProcedOdonto[]>(
    []
  )
  const filteredProced = useMemo(() => {
    // TODO: substituir por busca no backend
    const q = procedQuery.trim().toLowerCase()
    if (!q) return PROCED_ODONTO_DB.slice(0, 12)
    return PROCED_ODONTO_DB.filter(p => p.toLowerCase().includes(q)).slice(
      0,
      30
    )
  }, [procedQuery])
  const addProced = (p: ProcedOdonto) => {
    setProcedSelecionados(prev => (prev.includes(p) ? prev : [...prev, p]))
    setDirty(true)
  }
  const removeProced = (p: ProcedOdonto) => {
    setProcedSelecionados(prev => prev.filter(i => i !== p))
    setDirty(true)
  }

  // Prescrição (igual ao atendimento médico): busca + tags + "Outra medicação"
  const [medQuery, setMedQuery] = useState('')
  const [medicacoes, setMedicacoes] = useState<string[]>([])
  const filteredMeds = useMemo(() => {
    // TODO: substituir por busca no backend
    const q = medQuery.trim().toLowerCase()
    if (!q) return MEDICACOES_DB.slice(0, 10)
    return MEDICACOES_DB.filter(m => m.toLowerCase().includes(q)).slice(0, 20)
  }, [medQuery])
  const addMedicacao = (m: string) => {
    setMedicacoes(prev => (prev.includes(m) ? prev : [...prev, m]))
    setMedQuery('')
    setDirty(true)
  }
  const removeMedicacao = (m: string) => {
    setMedicacoes(prev => prev.filter(x => x !== m))
    setDirty(true)
  }
  const [medOutra, setMedOutra] = useState('')
  const addOutraMedicacao = () => {
    const v = medOutra.trim()
    if (!v) return
    addMedicacao(v)
    setMedOutra('')
  }

  // carregar dados
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
        loadLocal()
      })
      .finally(() => ativo && setCarregando(false))
    return () => {
      ativo = false
    }
  }, [pacienteId, idFila])

  // cronômetro
  useEffect(() => {
    timerRef.current = setInterval(() => setElapsed(s => s + 1), 1000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  // autosave
  useEffect(() => {
    const data = {
      evolucao,
      odontograma: odontoSelections,
      procedSelecionados,
      medicacoes
    }
    saveLocal(data)
  }, [evolucao, odontoSelections, procedSelecionados, medicacoes, saveLocal])

  // bloquear saída se sujo
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!dirty) return
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [dirty])

  // atalhos
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isSave = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's'
      if (isSave) {
        e.preventDefault()
        void handleFinalizar()
      }
      if (e.key === 'Escape') {
        e.preventDefault()
        handleCancelar()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, []) // eslint-disable-line

  // utils
  const formatElapsed = (s: number) => {
    const mm = String(Math.floor(s / 60)).padStart(2, '0')
    const ss = String(s % 60).padStart(2, '0')
    return `${mm}:${ss}`
  }

  // simular salvar na API
  async function saveAtendimento(payload: any) {
    // TODO: ligar com server action / Supabase
    await new Promise(r => setTimeout(r, 300))
    return { ok: true }
  }

  // ações
  const handleImprimirReceita = () => {
    // TODO: rota que aplica Template e retorna PDF/print
    toast.message('Imprimir Receita (conectar ao template)')
  }

  const handleFinalizar = async () => {
    const payload = {
      idFila,
      pacienteId,
      evolucao: evolucao.trim(),
      odontograma: odontoSelections, // mapa por dente/faces/procedures
      procedimentosOdonto: procedSelecionados, // lista manual selecionada
      prescricoes: medicacoes, // meds por tag (inclui “Outra medicação”)
      iniciadoEm: Date.now() - elapsed * 1000,
      duracaoSeg: elapsed
    }

    const vazio =
      !payload.evolucao &&
      Object.keys(odontoSelections).length === 0 &&
      procedSelecionados.length === 0 &&
      medicacoes.length === 0

    if (vazio) {
      toast.warning(
        'O atendimento está vazio. Adicione informações antes de finalizar.'
      )
      return
    }

    const res = await saveAtendimento(payload)
    if (res?.ok) {
      setDirty(false)
      try {
        localStorage.removeItem(lsKey)
      } catch {}
      toast.success('Atendimento finalizado!')
      router.push('/atendimento')
    } else {
      toast.error('Não foi possível finalizar agora. Tente novamente.')
    }
  }

  const handleCancelar = () => {
    toast.message('Atendimento cancelado.')
    router.push('/atendimento')
  }

  // resumo odontograma
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
        {/* CABEÇALHO STICKY */}
        <div className="sticky top-0 z-10 mb-3">
          <div className="rounded-lg border bg-background/90 backdrop-blur px-3 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/atendimento')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
              </Button>
              <span className="text-sm text-muted-foreground">
                Paciente:{' '}
                <span className="font-medium">
                  {dadosPaciente?.nome || '—'}
                </span>{' '}
                · PA: <span className="font-medium">{triagem?.pa || '—'}</span>
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              Fila: <span className="font-medium">{idFila}</span> · Tempo:{' '}
              <span className="font-semibold">{formatElapsed(elapsed)}</span>
            </div>
          </div>
        </div>

        {/* CARD ÚNICO */}
        <Card className="w-full">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
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

                      {/* espaço */}
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

            {/* Section 2 — Procedimentos (BUSCA + LISTA + TAGS) ANTES do Odontograma */}
            <div className="border rounded-lg">
              <div className="px-4 py-3 text-base font-semibold border-b">
                Procedimentos Odontológicos
              </div>

              <div className="px-4 pb-4">
                <Label className="mb-2 mt-2 block">Buscar procedimento</Label>
                <Input
                  placeholder="Ex: restauração, extração, endodontia..."
                  value={procedQuery}
                  onChange={e => {
                    setProcedQuery(e.target.value)
                    setDirtyDebounced()
                  }}
                />
                <div className="mt-2 max-h-40 overflow-auto rounded-md border divide-y">
                  {filteredProced.length === 0 && (
                    <div className="px-3 py-2 text-sm text-muted-foreground">
                      Nenhum procedimento encontrado
                    </div>
                  )}
                  {filteredProced.map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => addProced(p)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-muted/60"
                    >
                      {p}
                    </button>
                  ))}
                </div>

                {procedSelecionados.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {procedSelecionados.map(p => (
                      <Badge key={p} variant="secondary" className="gap-1">
                        {p}
                        <button
                          type="button"
                          onClick={() => removeProced(p)}
                          className="ml-1 rounded-full px-1 text-xs opacity-70 hover:opacity-100"
                          aria-label={`Remover ${p}`}
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}

                {/* TODO: trocar filteredProced por resultados do backend */}
              </div>
            </div>

            {/* Section 3 — Odontograma + Resumo */}
            <div className="border rounded-lg">
              <div className="px-4 py-3 text-base font-semibold border-b">
                Odontograma
              </div>

              <div className="px-2 sm:px-4 pb-4 w-full">
                <div className="w-full max-w-full">
                  <Odontograma
                    value={odontoSelections}
                    onChange={v => {
                      setOdontoSelections(v)
                      setDirty(true)
                    }}
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
                                  setDirty(true)
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

            {/* Section 5 — Evolução / Tratamento */}
            <div className="border rounded-lg">
              <div className="px-4 py-3 text-base font-semibold border-b">
                Evolução / Tratamento
              </div>
              <div className="px-4 pb-4 mt-2">
                <Label htmlFor="evolucao">Evolução e Condutas</Label>
                <Textarea
                  id="evolucao"
                  className="mt-2 min-h-[140px]"
                  value={evolucao}
                  onChange={e => {
                    setEvolucao(e.target.value)
                    setDirtyDebounced()
                  }}
                  placeholder="Descreva evolução, procedimentos realizados, materiais utilizados..."
                />
              </div>
            </div>

            {/* Section 4 — Prescrição (busca + outra) */}
            <div className="border rounded-lg">
              <div className="px-4 py-3 text-base font-semibold border-b">
                Prescrição
              </div>
              <div className="px-4 pb-4 mt-2 grid grid-cols-1 gap-4">
                <div>
                  <Label className="mb-2 mt-2 block">Buscar medicação</Label>
                  <Input
                    placeholder="Digite para buscar na base (ex: Amoxicilina 500 mg)"
                    value={medQuery}
                    onChange={e => {
                      setMedQuery(e.target.value)
                      setDirtyDebounced()
                    }}
                  />
                  <div className="mt-2 max-h-40 overflow-auto rounded-md border divide-y">
                    {filteredMeds.length === 0 && (
                      <div className="px-3 py-2 text-sm text-muted-foreground">
                        Nenhuma medicação encontrada
                      </div>
                    )}
                    {filteredMeds.map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => addMedicacao(m)}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-muted/60"
                      >
                        {m}
                      </button>
                    ))}
                  </div>

                  {/* Tags selecionadas */}
                  {medicacoes.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {medicacoes.map(m => (
                        <Badge key={m} variant="secondary" className="gap-1">
                          {m}
                          <button
                            type="button"
                            onClick={() => removeMedicacao(m)}
                            className="ml-1 rounded-full px-1 text-xs opacity-70 hover:opacity-100"
                            aria-label={`Remover ${m}`}
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Outra medicação */}
                  <div className="mt-4">
                    <Label className="mb-2 block">Outra medicação</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Ex: Nimesulida 100 mg 12/12h por 3 dias"
                        value={medOutra}
                        onChange={e => setMedOutra(e.target.value)}
                      />
                      <Button type="button" onClick={addOutraMedicacao}>
                        Adicionar
                      </Button>
                    </div>
                  </div>

                  {/* TODO: trocar filteredMeds por resultados do backend */}
                </div>
              </div>
            </div>

            {/* Rodapé — Botões */}
            <div className="flex flex-col sm:flex-row gap-3 justify-end pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={handleImprimirReceita}
                className="gap-2 w-full sm:w-auto"
              >
                <Printer className="h-4 w-4" />
                Imprimir Receita
              </Button>

              <Button
                onClick={handleFinalizar}
                className="gap-2 bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto"
              >
                <CheckCircle2 className="h-4 w-4" />
                Finalizar atendimento
              </Button>

              <Button
                variant="outline"
                className="gap-2 border-destructive text-destructive hover:bg-destructive/10 w-full sm:w-auto"
                onClick={handleCancelar}
              >
                <XCircle className="h-4 w-4" />
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
