'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import {
  ArrowLeft,
  Printer,
  CheckCircle2,
  XCircle,
  FileText,
  Send
} from 'lucide-react'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion'

import { Cid, getAll as getAllCids } from '@/services/cidsService'
import {
  Medicamento,
  ReceitaMedicamento,
  getAll as getAllMedicamentos
} from '@/services/medicamentoService'
import { Exame, getAll as getAllExames } from '@/services/examesService'
import {
  Procedimento,
  getAll as getAllProcedimentos
} from '@/services/procedimentoService'
import {
  Especialidade,
  getAll as getAllEspecialidades
} from '@/services/especialidadeService'
import { AtendimentoFluxo } from '@/types/Fluxo'
import { getAtendimentoById } from '@/services/fluxoService'
import { generateAndDownload, safeDateLabel, safeDateTimeLabel } from '@/utils/functions'
import { Atendimento } from '@/types/Atendimento'
import { ToothSelection, finalizarAtendimento, EncaminhamentoMedico, encaminharAtendimento } from '@/services/atendimentoService'

import Odontograma from '../componentes/Odontograma'

// NOVO: componente de prescrição
import PrescricaoEditor from '../componentes/PrescricaoEditor'

import EncaminharModal from '@/components/EncaminharModal'

// --------------------
// Utils
// --------------------
const debounce = (fn: (...a: any[]) => void, ms = 500) => {
  let t: any
  return (...args: any[]) => {
    clearTimeout(t)
    t = setTimeout(() => fn(...args), ms)
  }
}

export default function AtendimentoConvencionalPage() {
  const router = useRouter()
  const [userName, setUserName] = useState("");
  const [userCRM, setCRM] = useState("");
  const [userEspecialidadeDesc, setEspecialidadeDesc] = useState("");
  const [userTipoAtendimento, setUserTipoAtendimento] = useState<string>("");
  const [userEspecialidade, setUserEspecialidade] = useState<number>();
  // --------------------
  // Estados principais
  // --------------------
  
  const { idFila } = useParams<{ idFila: string }>() 
  const [carregando, setCarregando] = useState(true)
  const [atendimento, setAtendimento] = useState<AtendimentoFluxo>()
  const [evolucao, setEvolucao] = useState<string>('')

  // mostrar/ocultar odontograma (quando procedimento id === 4)
  const [odontogramaOpen, setOdontogramaOpen] = useState<boolean>(false)

  // --------------------
  // Listas (Services)
  // --------------------
  // CIDs
  const [cids, setCids] = useState<Cid[]>([])
  const [cidQuery, setCidQuery] = useState('')
  const [selectedCids, setSelectedCids] = useState<Cid[]>([])
  const filteredCids = useMemo(() => {
    const q = cidQuery.trim().toLowerCase()
    const base = cids ?? []
    if (!q) return base.slice(0, 8)
    return base
      .filter(
        c =>
          c.nome.toLowerCase().includes(q) ||
          c.descricao.toLowerCase().includes(q)
      )
      .slice(0, 20)
  }, [cidQuery, cids])

  const addCid = (cid: Cid) => {
    if (selectedCids.some(c => c.id === cid.id)) return
    if (selectedCids.length >= 5) {
      toast.warning('Você pode selecionar no máximo 5 CIDs.')
      return
    }
    setSelectedCids(prev => [...prev, cid])
    setDirty(true)
  }
  const removeCid = (cid: Cid) => {
    if (!selectedCids.some(c => c.id === cid.id)) return
    setSelectedCids(prev => prev.filter(c => c.id !== cid.id))
    setDirty(true)
  }

  // Medicamentos (somente lista para o componente de prescrição)
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([])

  // Procedimentos
  const [procedimentos, setProcedimentos] = useState<Procedimento[]>([])
  const [procedQuery, setProcedQuery] = useState('')
  const [selectedProceds, setSelectedProceds] = useState<Procedimento[]>([])
  const filteredProced = useMemo(() => {
    const q = procedQuery.trim().toLowerCase()
    const base = procedimentos ?? []
    if (!q) return base.slice(0, 10)
    return base.filter(p => p.nome.toLowerCase().includes(q)).slice(0, 20)
  }, [procedQuery, procedimentos])

  const addProced = (procedimento: Procedimento) => {
    if (selectedProceds.some(p => p.id === procedimento.id)) return
    const next = [...selectedProceds, procedimento]
    setSelectedProceds(next)

    // mantém regra de abrir odontograma se procedimento id === 4
    if (next.some(p => p.id === 4) || procedimento.id === 4) {
      setOdontogramaOpen(true)
    } else {
      setOdontogramaOpen(false)
    }
    setDirty(true)
  }
  const removeProced = (procedimento: Procedimento) => {
    if (!selectedProceds.some(p => p.id === procedimento.id)) return
    const next = selectedProceds.filter(p => p.id !== procedimento.id)
    setSelectedProceds(next)
    if (procedimento.id === 4 || !next.some(p => p.id === 4)) {
      setOdontogramaOpen(false)
    }
    setDirty(true)
  }

  // Encaminhar
  const [encOpen, setEncOpen] = useState(false)
  const [especialidades, setEspecialidades] = useState<Especialidade[]>([])

  // Exames
  const [exames, setExames] = useState<Exame[]>([])
  const [selectedExames, setSelectedExames] = useState<Exame[]>([])
  const toggleExame = (exame: Exame) => {
    if (selectedExames.some(e => e.id === exame.id)) {
      setSelectedExames(prev => prev.filter(e => e.id !== exame.id))
    } else {
      setSelectedExames(prev => [...prev, exame])
    }
    setDirty(true)
  }

  // --------------------
  // Prescrição (componente)
  // --------------------
  const [prescricoes, setPrescricoes] = useState<ReceitaMedicamento[]>([])

  // --------------------
  // Odontograma
  // --------------------
  const [odontoSelections, setOdontoSelections] = useState<ToothSelection[]>([])
  const selectionsArray = Object.values(odontoSelections).filter(
    s => (s.procedures?.length || 0) > 0
  )
  const addOdonto = (tooth: ToothSelection) => {
    setOdontoSelections(prev => {
        const exists = prev.some(
          p => p.tooth === tooth.tooth && p.quadrant === tooth.quadrant
        )
    
        if (exists) {
          return prev.map(p =>
            p.tooth === tooth.tooth && p.quadrant === tooth.quadrant ? tooth : p
          )
        }
    
        return [...prev, tooth]
    })
    setDirty(true)
  }

  const removeOdonto = (tooth: ToothSelection) => {
    setOdontoSelections(prev =>
      prev.filter(
        p => !(p.tooth === tooth.tooth && p.quadrant === tooth.quadrant)
      )
    )
    setDirty(true)
  }
  
  const removeOdontoProcedimento = (tooth: ToothSelection, toothProc: number) => {
    setOdontoSelections(prev => {
      const arr = Array.isArray(prev) ? prev : []
  
      const next = arr.map(p => {
        if (p.tooth === tooth.tooth && p.quadrant === tooth.quadrant) {
          return {
            ...p,
            procedures: p.procedures.filter(proc => proc.id !== toothProc)
          }
        }
        return p
      })
  
      return next
    })  
    setDirty(true)
  }
  // --------------------
  // Cronômetro / atalhos / navegação segura
  // --------------------
  const [elapsed, setElapsed] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const [dirty, setDirty] = useState(false)
  const setDirtyDebounced = useMemo(
    () => debounce(() => setDirty(true), 300),
    []
  )

  useEffect(() => {
    timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000)

    // atalhos: Ctrl/Cmd+S (finalizar) e Esc (cancelar)
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

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      window.removeEventListener('keydown', onKey)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // bloquear saída se houver alterações
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!dirty) return
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [dirty])

  // --------------------
  // Carregamento inicial
  // --------------------
  useEffect(() => {    
    if(!idFila) return
    const storedUser = localStorage.getItem("userData");
    console.log(storedUser);
    
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserName(user.usuario.toUpperCase());
      setCRM(user.crm.toUpperCase());
      setEspecialidadeDesc(user.crm.toUpperCase());
    }
    handleSearch()
  }, [idFila, userEspecialidade])

  const handleSearch = async () => {
    setCarregando(true)    
    const storedUser = localStorage.getItem("userData");    
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserTipoAtendimento(user.tipo_atendimento);
      setUserEspecialidade(user.especialidade_id);
    }

    try {
      // Ajuste aqui para o ID correto do atendimento
      const [a, c, m, p, e, esp] = await Promise.all([
        getAtendimentoById(Number(idFila)),
        getAllCids(),
        getAllMedicamentos(),
        getAllProcedimentos(),
        getAllExames(),
        getAllEspecialidades()
      ])
      setAtendimento(a)
      setCids(c)
      setMedicamentos(m)
      setProcedimentos(p)
      setExames(e)
      setEspecialidades(esp)
      if (userEspecialidade && userTipoAtendimento) {
        const selecionados = p.filter(proc => proc.especialidade_id == userEspecialidade)
        
        const idEspecialidade = userTipoAtendimento === "medico" ? 1 : 2
        const relacionados = p.filter(proc => proc.especialidade_id == idEspecialidade)

        const unicos = [...selecionados, ...relacionados]
          .filter((v, i, arr) => arr.findIndex(o => o.id === v.id) === i)
          
        setSelectedProceds(unicos)
      }
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setCarregando(false)
    }
  }

  // --------------------
  // Autosave
  // --------------------
  const lsKey = useMemo(() => {
    const filaId = atendimento?.fila?.id ?? 0
    const pacienteId = atendimento?.paciente?.id ?? 0
    return `att-medico:${filaId}:${pacienteId}`
  }, [atendimento?.fila?.id, atendimento?.paciente?.id])

  const saveLocal = useMemo(
    () =>
      debounce((data: any) => {
        try {
          localStorage.setItem(lsKey, JSON.stringify(data))
        } catch {}
      }, 500),
    [lsKey]
  )

  // carregar do localStorage quando atendimento disponível
  useEffect(() => {
    if (!lsKey) return
    try {
      const raw = localStorage.getItem(lsKey)
      if (!raw) return
      const data = JSON.parse(raw)
      setEvolucao(data.evolucao ?? '')
      setSelectedCids(data.selectedCids ?? [])
      setSelectedProceds(data.selectedProceds ?? [])
      setSelectedExames(data.selectedExames ?? [])
      setPrescricoes(data.prescricoes ?? [])
      // se havia procedimento id 4, reabrir odontograma
      if ((data.selectedProceds ?? []).some((p: Procedimento) => p.id === 4)) {
        setOdontogramaOpen(true)
      }
    } catch {}
  }, [lsKey])

  // salvar sempre que algo relevante mudar
  useEffect(() => {
    const snapshot = {
      evolucao,
      selectedCids,
      selectedProceds,
      selectedExames,
      prescricoes,
      odontoSelections
    }
    saveLocal(snapshot)
  }, [
    evolucao,
    selectedCids,
    selectedProceds,
    selectedExames,
    prescricoes,
    odontoSelections,
    saveLocal
  ])

  // --------------------
  // UI helpers / ações
  // --------------------
  const formatElapsed = (s: number) => {
    const mm = String(Math.floor(s / 60)).padStart(2, '0')
    const ss = String(s % 60).padStart(2, '0')
    return `${mm}:${ss}`
  }

  const handleImprimirReceita = async () => {
    try {
      if (atendimento) {
        const especialidadedDesc = especialidades.find(e => e.id === userEspecialidade)?.nome ?? ""
        var medicacoesList: string[] = []
        prescricoes.forEach(element => {
          const medicacao = element.medicamento.nome.toUpperCase() + " - a cada " + element.frequencia + " horas por " + element.duracao + " dias."
          medicacoesList.push(medicacao);
        });
        const payload = {
          paciente_nome: atendimento.paciente.nome,
          data_nascimento: safeDateLabel(atendimento.paciente.dataNascimento),
          data_hora: safeDateTimeLabel(new Date().toISOString()),
          medico_nome: 'Dr(a). ' + userName,
          crm: userCRM,
          especialidade: especialidadedDesc,
          medicacoes: medicacoesList
        }
        await generateAndDownload('/api/receituario-html', payload, 'receituario')
        toast.message('Receituário gerado com sucesso!')
      }
    } catch (e: any) {
      toast.error(e?.message ?? 'Falha ao gerar Receituário')
    }
  }

  const handleFinalizar = async () => {
    
    if (!atendimento) return

    // montar itens de prescrição detalhados

    const atendimentoRealizado: Atendimento = {
      id: atendimento.id,
      evolucao,
      procedimentos: selectedProceds.map(p => p.id),
      cids: selectedCids.map(p => p.id),
      medicamentos: prescricoes,
      exames: selectedExames.map(p => p.id),
      procedimentosOdontologicos: odontoSelections,
    }
    
    const vazio =
      !evolucao.trim() &&
      selectedProceds.length === 0 &&
      selectedCids.length === 0 &&
      selectedExames.length === 0 &&
      prescricoes.length === 0

    if (vazio) {
      toast.warning(
        'O atendimento está vazio. Adicione informações antes de finalizar.'
      )
      return
    }

    try {
      await finalizarAtendimento(atendimentoRealizado)
      setDirty(false)
      try {
        localStorage.removeItem(lsKey)
      } catch {}
      toast.success('Atendimento realizado!')
      router.push('/atendimento')
    } catch {
      toast.error('Finalização do atendimento falhou!')
    } finally {
      setCarregando(false)
    }
  }

  const handleCancelar = () => {
    toast.message('Atendimento cancelado.')
    router.push('/atendimento')
  }

  const handleImprimirAtestado = async () => {
    try {
      if (atendimento) {
        const entrada = new Date(atendimento.entrada)
        entrada.setDate(entrada.getDate() + 1)

        const inicio_afastamento = safeDateLabel(entrada.toISOString())
        const payload = {
          paciente_nome: atendimento.paciente.nome,
          data_atendimento: safeDateLabel(atendimento.entrada), // dd/mm/aaaa
          // dias_afastamento: '3',
          inicio_afastamento: inicio_afastamento,
          // diagnostico: 'Gripe viral',
          // cid: 'J11',
          medico_nome: 'Dr(a). ' + userName,
          crm: userCRM
        }
        await generateAndDownload('/api/atestado-html', payload, 'atestado')
        toast.message('Atestado gerado com sucesso!')
      }
    } catch (e: any) {
      toast.error(e?.message ?? 'Falha ao imprimir atestado.')
    }
  }

  const handleEncaminhar = async () => {
    try {
      setEncOpen(true)
    } catch (e: any) {
      toast.error(e?.message ?? 'Falha ao encaminhar.')
    }
  }
  
  const handleEncaminhamentoMedico = async (encaminhamento: EncaminhamentoMedico) => {
    setCarregando(true)
    try {
      await encaminharAtendimento(encaminhamento)
      toast.success('Atendimento encaminhado!')
    } catch {
      toast.error('Encaminhamento do atendimento falhou!')
    } finally {
      setCarregando(false)
    }
  }

  // --------------------
  // Render
  // --------------------
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
                  {atendimento?.paciente?.nome || '—'}
                </span>{' '}
                · PA:{' '}
                <span className="font-medium">
                  {atendimento?.triagem?.pa || '—'}
                </span>
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              Fila:{' '}
              <span className="font-medium">
                {atendimento?.fila?.nome || '—'}
              </span>{' '}
              · Tempo:{' '}
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
                <span className="font-medium">{atendimento?.paciente?.id}</span>
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
                            value={atendimento?.paciente?.nome || ''}
                            readOnly
                            disabled
                          />
                        </div>
                        <div>
                          <Label>Data de Nascimento</Label>
                          <Input
                            value={
                              safeDateLabel(
                                atendimento?.paciente?.dataNascimento
                              ) || ''
                            }
                            readOnly
                            disabled
                          />
                        </div>
                        <div>
                          <Label>CPF</Label>
                          <Input
                            value={atendimento?.paciente?.cpf || ''}
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
                          <Input
                            value={atendimento?.triagem?.pa || ''}
                            readOnly
                            disabled
                          />
                        </div>
                        <div>
                          <Label>Comorbidades</Label>
                          <Input
                            value={atendimento?.triagem?.comorbidades || ''}
                            readOnly
                            disabled
                          />
                        </div>
                        <div>
                          <Label>Alergia</Label>
                          <Input
                            value={atendimento?.triagem?.alergias || ''}
                            readOnly
                            disabled
                          />
                        </div>

                        <div className="col-span-2 flex flex-wrap gap-2 mt-2">
                          {atendimento?.triagem?.comorbidades && (
                            <Badge className="bg-amber-600">Comorbidade</Badge>
                          )}
                          {atendimento?.triagem?.alergias && (
                            <Badge className="bg-purple-600">Alergia</Badge>
                          )}
                          <Badge variant="secondary">
                            PA: {atendimento?.triagem?.pa || '—'}
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
                        key={p.id}
                        type="button"
                        onClick={() => addProced(p)}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-muted/60"
                      >
                        {p.nome}
                      </button>
                    ))}
                  </div>

                  {selectedProceds.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {selectedProceds.map(p => (
                        <Badge key={p.id} variant="secondary" className="gap-1">
                          {p.nome}
                          <button
                            type="button"
                            onClick={() => removeProced(p)}
                            className="ml-1 rounded-full px-1 text-xs opacity-70 hover:opacity-100"
                            aria-label={`Remover ${p.nome}`}
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
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
                        key={cid.id}
                        type="button"
                        onClick={() => addCid(cid)}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-muted/60"
                      >
                        <span className="font-mono font-medium mr-2">
                          {cid.nome}
                        </span>
                        {cid.descricao}
                      </button>
                    ))}
                  </div>

                  {selectedCids.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {selectedCids.map(cid => (
                        <Badge
                          key={cid.id}
                          variant="secondary"
                          className="gap-1"
                        >
                          <span className="font-mono">{cid.nome}</span> —{' '}
                          {cid.descricao}
                          <button
                            type="button"
                            onClick={() => removeCid(cid)}
                            className="ml-1 rounded-full px-1 text-xs opacity-70 hover:opacity-100"
                            aria-label={`Remover ${cid.id}`}
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

            {/* ODONTOGRAMA opcional (apenas quando id=4 presente) */}
            {odontogramaOpen && (
              <section className="border rounded-lg">
                <div className="px-4 py-3 text-base font-semibold border-b">
                  Odontograma
                </div>

                <div className="px-2 sm:px-4 pb-4 w-full">
                  <div className="w-full max-w-full">
                    <Odontograma
                      value={odontoSelections}
                      procedimentosOdontologicos = {procedimentos.filter(proc => proc.especialidade_id == 2)}
                      onChange={v => {
                        addOdonto(v);
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
                                removeOdonto(sel)
                              }
                            >
                              Limpar dente
                            </Button>
                          </div>

                          <div className="flex flex-wrap gap-2 pl-0 sm:pl-6">
                            {sel.procedures.map(p => (
                              <Badge
                                key={`${sel.tooth}-${p.id}`}
                                variant="secondary"
                                className="gap-1"
                                onClick={() => {
                                  removeOdontoProcedimento(sel, p.id)
                                  setDirty(true)
                                }}
                              >
                                {p.nome}
                                <button
                                  type="button"
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
              </section>
            )}

            {/* Section — Evolução (w-full) */}
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

            {/* Section — Prescrição & Exames (vertical: Prescrição acima, Exames abaixo) */}
            <section className="border rounded-lg">
              <div className="px-4 py-3 text-base mt-2 font-semibold border-b">
                Prescrição & Exames
              </div>

              {/* Stack vertical */}
              <div className="px-4 pb-4 mt-2 space-y-6">
                {/* Prescrição (fica em cima) */}
                <div>
                  <PrescricaoEditor
                    medicamentos={medicamentos}
                    value={prescricoes}
                    onChange={setPrescricoes}
                    onDirty={() => setDirty(true)}
                  />
                </div>

                {/* Exames (fica embaixo) */}
                <div>
                  <Label className="mb-2 block">Solicitar Exames</Label>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {exames.map(ex => (
                      <label
                        key={ex.id}
                        className="inline-flex items-center gap-2 text-sm"
                      >
                        <Checkbox
                          checked={selectedExames.some(e => e.id === ex.id)}
                          onCheckedChange={() => toggleExame(ex)}
                        />
                        <span>{ex.nome}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Rodapé — Botões finais */}
            <section className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
              {/* Grupo de impressões/ações rápidas (à esquerda em telas largas) */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleImprimirReceita}
                  className="gap-2 transition-colors hover:bg-gray-500 hover:text-gray-300"
                >
                  <Printer className="h-4 w-4" />
                  Imprimir Receita
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleImprimirAtestado}
                  className="gap-2 transition-colors hover:bg-gray-500 hover:text-gray-300"
                >
                  <FileText className="h-4 w-4" />
                  Imprimir Atestado
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleEncaminhar}
                  className="gap-2 transition-colors hover:bg-gray-500 hover:text-gray-300"
                >
                  <Send className="h-4 w-4" />
                  Encaminhar
                </Button>
              </div>

              {/* Ações de conclusão (à direita em telas largas) */}
              <div className="flex flex-col sm:flex-row gap-3 justify-end">
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
              </div>
            </section>
          </CardContent>
        </Card>
      </div>

      <EncaminharModal
        open={encOpen}
        onOpenChange={setEncOpen}
        atendimentoId={atendimento?.id ?? 0}
        pacienteId={atendimento?.paciente?.id ?? 0}
        especialidades={especialidades}
        onConfirm={async payload => {
          handleEncaminhamentoMedico(payload);
        }}
      />
    </div>
  )
}
