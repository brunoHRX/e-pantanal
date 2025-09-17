'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { ArrowLeft, Printer, CheckCircle2, XCircle } from 'lucide-react'
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
// Mocks (trocar por backend)
// --------------------
async function fetchPacienteById(pacienteId: string): Promise<Paciente | null> {
  await new Promise(r => setTimeout(r, 150))
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
  await new Promise(r => setTimeout(r, 150))
  if (!pacienteId || !filaId) return null
  return {
    pa: '130x85',
    hipertensao: 'não',
    diabetes: 'não',
    alergia: 'não'
  }
}

// CIDs (mock). TODO: puxar do backend
const MOCK_CIDS: CIDItem[] = [
  { code: 'J00', description: 'Nasofaringite aguda (resfriado comum)' },
  {
    code: 'J06.9',
    description: 'Infecção aguda das vias aéreas superiores, não especificada'
  },
  { code: 'R51', description: 'Cefaleia' },
  { code: 'K21.0', description: 'DRGE com esofagite' },
  { code: 'I10', description: 'Hipertensão essencial (primária)' },
  { code: 'E11.9', description: 'Diabetes tipo 2 sem complicações' },
  { code: 'M54.5', description: 'Dor lombar baixa' },
  { code: 'B34.9', description: 'Infecção viral, não especificada' },
  {
    code: 'N39.0',
    description: 'Infecção do trato urinário, local não especificado'
  },
  { code: 'R50.9', description: 'Febre, não especificada' }
]

// Procedimentos (mock). TODO: puxar do backend
const PROCEDIMENTOS_DB = [
  'Atendimento Médico',
  'Consulta Ambulatorial',
  'Curativo Simples',
  'Sutura Simples',
  'Retorno Pós-Operatório',
  'Medicação Intramuscular',
  'Nebulização',
  'Aferição de Pressão Arterial',
  'Retirada de Pontos',
  'Eletrocardiograma (ECG)',
  'Administração de Medicação Oral'
] as const
type Procedimento = (typeof PROCEDIMENTOS_DB)[number]

// Medicações (mock). TODO: puxar do backend
const MEDICACOES_DB = [
  'Dipirona 500 mg',
  'Paracetamol 750 mg',
  'Ibuprofeno 400 mg',
  'Omeprazol 20 mg',
  'Amoxicilina 500 mg',
  'Azitromicina 500 mg',
  'Loratadina 10 mg',
  'Metformina 850 mg',
  'Losartana 50 mg',
  'Hidroclorotiazida 25 mg'
] as const
type Medicacao = (typeof MEDICACOES_DB)[number]

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

// --------------------
// Página
// --------------------
export default function AtendimentoConvencionalPage() {
  const router = useRouter()
  const params = useParams<{ idFila: string }>()
  const search = useSearchParams()

  const idFila = params?.idFila || ''
  const pacienteId = search.get('pacienteId') || ''

  // Estados base
  const [carregando, setCarregando] = useState(true)
  const [dadosPaciente, setDadosPaciente] = useState<Paciente | null>(null)
  const [triagem, setTriagem] = useState<Triagem | null>(null)

  // Evolução
  const [evolucao, setEvolucao] = useState('')

  // CIDs
  const [cidQuery, setCidQuery] = useState('')
  const [selectedCids, setSelectedCids] = useState<CIDItem[]>([])
  const filteredCids = useMemo(() => {
    // TODO: substituir por busca no backend
    const q = cidQuery.trim().toLowerCase()
    if (!q) return MOCK_CIDS.slice(0, 8)
    return MOCK_CIDS.filter(
      c =>
        c.code.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
    ).slice(0, 20)
  }, [cidQuery])
  const addCid = (cid: CIDItem) => {
    if (selectedCids.find(c => c.code === cid.code)) return
    if (selectedCids.length >= 5) {
      toast.warning('Você pode selecionar no máximo 5 CIDs.')
      return
    }
    setSelectedCids(prev => [...prev, cid])
    setDirty(true)
  }
  const removeCid = (code: string) => {
    setSelectedCids(prev => prev.filter(c => c.code !== code))
    setDirty(true)
  }

  // Procedimentos (agora com busca como o CID)
  const [procedQuery, setProcedQuery] = useState('')
  const [procedimentos, setProcedimentos] = useState<Procedimento[]>([
    'Atendimento Médico'
  ])
  const filteredProced = useMemo(() => {
    // TODO: substituir por busca no backend
    const q = procedQuery.trim().toLowerCase()
    if (!q) return PROCEDIMENTOS_DB.slice(0, 10)
    return PROCEDIMENTOS_DB.filter(p => p.toLowerCase().includes(q)).slice(
      0,
      20
    )
  }, [procedQuery])
  const addProced = (p: Procedimento) => {
    setProcedimentos(prev => (prev.includes(p) ? prev : [...prev, p]))
    setDirty(true)
  }
  const removeProced = (p: Procedimento) => {
    setProcedimentos(prev => prev.filter(i => i !== p))
    setDirty(true)
  }

  // Exames (checklist)
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
  const [exames, setExames] = useState<Record<Exame, boolean>>(() =>
    EXAMES_PRESETS.reduce(
      (acc, e) => ({ ...acc, [e]: false }),
      {} as Record<Exame, boolean>
    )
  )
  const toggleExame = (e: Exame) => {
    setExames(prev => ({ ...prev, [e]: !prev[e] }))
    setDirty(true)
  }

  // Prescrição: busca + tags + "Outra medicação"
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

  // Cronômetro
  const [elapsed, setElapsed] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Dirty / navegação segura
  const [dirty, setDirty] = useState(false)
  const setDirtyDebounced = useMemo(
    () => debounce(() => setDirty(true), 300),
    []
  )

  // Autosave
  const lsKey = `att-medico:${idFila}:${pacienteId}`
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
      setSelectedCids(data.selectedCids ?? [])
      setProcedimentos(data.procedimentos ?? ['Atendimento Médico'])
      setExames(data.exames ?? exames)
      setMedicacoes(data.medicacoes ?? [])
    } catch {}
  }

  // Simulação de salvar na API
  async function saveAtendimento(payload: any) {
    // TODO: ligar com server action / chamada Supabase
    await new Promise(r => setTimeout(r, 300))
    return { ok: true }
  }

  // Efeitos
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pacienteId, idFila])

  useEffect(() => {
    timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  useEffect(() => {
    const data = {
      evolucao,
      selectedCids,
      procedimentos,
      exames,
      medicacoes
    }
    saveLocal(data)
  }, [evolucao, selectedCids, procedimentos, exames, medicacoes, saveLocal])

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!dirty) return
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [dirty])

  // Ações
  const formatElapsed = (s: number) => {
    const mm = String(Math.floor(s / 60)).padStart(2, '0')
    const ss = String(s % 60).padStart(2, '0')
    return `${mm}:${ss}`
  }

  const handleImprimirReceita = () => {
    // TODO: chamar serviço/rota que gera a receita via template (doc/PDF/print)
    toast.message('Imprimir Receita (conectar ao template)')
  }

  const handleFinalizar = async () => {
    const examesSelecionados = Object.entries(exames)
      .filter(([, v]) => v)
      .map(([k]) => k)

    const payload = {
      idFila,
      pacienteId,
      evolucao: evolucao.trim(),
      procedimentos,
      cids: selectedCids, // [{code, description}]
      exames: examesSelecionados,
      prescricoes: medicacoes, // tags escolhidas + outras
      iniciadoEm: Date.now() - elapsed * 1000,
      duracaoSeg: elapsed
    }

    const vazio =
      !payload.evolucao &&
      procedimentos.length === 0 &&
      selectedCids.length === 0 &&
      examesSelecionados.length === 0 &&
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

        {/* CARD */}
        <Card>
          <CardHeader className="flex items-start justify-between gap-4">
            <CardTitle className="text-2xl">Atendimento Médico</CardTitle>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">
                ID Paciente:{' '}
                <span className="font-medium">{dadosPaciente?.id}</span>
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Section 1 — Info Paciente + Triagem */}
            <section className="border rounded-lg">
              <Accordion type="single" collapsible defaultValue="info">
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
                {/* Procedimentos (BUSCA + LISTA + TAGS) */}
                <div>
                  <Label className="mb-2 mt-2 block">Procedimentos</Label>
                  <Input
                    placeholder="Busque procedimento (ex: curativo, sutura...)"
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

                  {procedimentos.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {procedimentos.map(p => (
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

                  {/* TODO: substituir filteredProced por resultados do backend */}
                </div>

                {/* CIDs (BUSCA + LISTA + TAGS) */}
                <div>
                  <Label className="mb-2 mt-2 block">
                    Adicionar CID (máx. 5)
                  </Label>
                  <Input
                    placeholder="Busque por código (ex: J06.9) ou descrição (ex: cefaleia)"
                    value={cidQuery}
                    onChange={e => {
                      setCidQuery(e.target.value)
                      setDirtyDebounced()
                    }}
                  />

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

                  {/* TODO: substituir filteredCids por resultados do backend */}
                </div>
              </div>
            </section>

            {/* Section 3 — Evolução (w-full) */}
            <section className="border rounded-lg">
              <div className="px-4 py-3 text-base mt-2 font-semibold border-b">
                Evolução
              </div>
              <div className="px-4 pb-4 mt-2">
                <Textarea
                  className="w-full min-h-[140px]"
                  value={evolucao}
                  onChange={e => {
                    setEvolucao(e.target.value)
                    setDirtyDebounced()
                  }}
                  placeholder="Descreva evolução, condutas e orientações clínicas..."
                />
              </div>
            </section>

            {/* Section 4 — Prescrição (busca + outra) e Exames (lado a lado) */}
            <section className="border rounded-lg">
              <div className="px-4 py-3 text-base mt-2 font-semibold border-b">
                Prescrição & Exames
              </div>
              <div className="px-4 pb-4 grid mt-2 grid-cols-1 md:grid-cols-2 gap-6">
                {/* Prescrição */}
                <div>
                  <Label className="mb-2 mt-2 block">Buscar medicação</Label>
                  <Input
                    placeholder="Digite para buscar na base (ex: Dipirona 500 mg)"
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

                  {/* Tags de medicações escolhidas */}
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

                {/* Exames */}
                <div>
                  <Label className="mb-2 block">Solicitar Exames</Label>
                  <div className="grid sm:grid-cols-2 gap-3">
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

            {/* Rodapé — Botões finais */}
            <section className="flex flex-wrap gap-3 items-center justify-end pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={handleImprimirReceita}
                className="gap-2"
              >
                <Printer className="h-4 w-4" />
                Imprimir Receita
              </Button>

              <Button
                onClick={handleFinalizar}
                className="gap-2 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle2 className="h-4 w-4" />
                Finalizar Atendimento
              </Button>

              <Button
                variant="outline"
                className="gap-2 border-destructive text-destructive hover:bg-destructive/10"
                onClick={handleCancelar}
              >
                <XCircle className="h-4 w-4" />
                Cancelar
              </Button>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
