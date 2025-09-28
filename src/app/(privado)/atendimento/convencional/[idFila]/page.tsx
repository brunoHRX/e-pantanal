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
import { Cid, getAll as getAllCids} from '@/services/cidsService'
import { Medicamento, getAll as getAllMedicamentos } from '@/services/medicamentoService'
import { Exame, getAll as getAllExames } from '@/services/examesService'
import { Procedimento, getAll as getAllProcedimentos } from '@/services/procedimentoService'
import { AtendimentoFluxo } from '@/types/Fluxo'
import { getAtendimentoById } from '@/services/fluxoService'
import { safeDateLabel } from '@/utils/functions'
import { Atendimento } from '@/types/Atendimento'
import { finalizarAtendimento } from '@/services/atendimentoService'

const debounce = (fn: (...a: any[]) => void, ms = 500) => {
  let t: any
  return (...args: any[]) => {
    clearTimeout(t)
    t = setTimeout(() => fn(...args), ms)
  }
}

export default function AtendimentoConvencionalPage() {
  const router = useRouter()
  const [carregando, setCarregando] = useState(true)
  const [atendimento, setAtendimento] = useState<AtendimentoFluxo>()
  const [evolucao, setEvolucao] = useState<string>("")

  // CID
  const [cids, setCids] = useState<Cid[]>([])
  async function searchCids() {
    try {
      const dados = await getAllCids()
      setCids(dados)
    } catch (err) {
      toast.error((err as Error).message)
    }
  }
  const [cidQuery, setCidQuery] = useState('')
  const [selectedCids, setSelectedCids] = useState<Cid[]>([])  
  const filteredCids = useMemo(() => {
    const q = cidQuery.trim().toLowerCase()
    if (!q) return cids.slice(0, 8)
    return cids.filter(
      c =>
        c.nome.toLowerCase().includes(q) ||
        c.descricao.toLowerCase().includes(q)
    ).slice(0, 20)
  }, [cidQuery])
  const addCid = (id: Cid) => {
    if (selectedCids.includes(id)) return
    if (selectedCids.length >= 5) {
      toast.warning('Você pode selecionar no máximo 5 CIDs.')
      return
    }
    setSelectedCids(prev => [...prev, id])
    setDirty(true)
  }
  const removeCid = (id: Cid) => {
    if (selectedCids.includes(id)) setSelectedCids(prev => prev.filter(c => c !== id))
    setDirty(true)
  }

  // MEDICAMENTOS
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([])
  async function searchMedicamentos() {
    try {
      const dados = await getAllMedicamentos()
      setMedicamentos(dados)
    } catch (err) {
      toast.error((err as Error).message)
    }
  }
  const [medQuery, setMedQuery] = useState('')
  const [selectedMeds, setSelectedMeds] = useState<Medicamento[]>([])
  const filteredMeds = useMemo(() => {
    const q = medQuery.trim().toLowerCase()
    if (!q) return medicamentos.slice(0, 10)
    return medicamentos.filter(m => m.nome.toLowerCase().includes(q)).slice(0, 20)
  }, [medQuery])  
  const addMed = (id: Medicamento) => {
    if (selectedMeds.includes(id)) return
    setSelectedMeds(prev => [...prev, id])
    setDirty(true)
  }
  const removeMed = (id: Medicamento) => {
    if (selectedMeds.includes(id)) setSelectedMeds(prev => prev.filter(c => c !== id))
    setDirty(true)
  }

  // PROCEDIMENTOS
  const [procedimentos, setProcedimentos] = useState<Procedimento[]>([])
  async function searchProcedimentos() {
    try {
      const dados = await getAllProcedimentos()
      setProcedimentos(dados)
    } catch (err) {
      toast.error((err as Error).message)
    }
  }
  const [procedQuery, setProcedQuery] = useState('')
  const [selectedProceds, setSelectedProceds] = useState<Procedimento[]>([])
  const filteredProced = useMemo(() => {
    const q = procedQuery.trim().toLowerCase()
    if (!q) return procedimentos.slice(0, 10)
    return procedimentos.filter(p => p.nome.toLowerCase().includes(q)).slice(
      0,
      20
    )
  }, [procedQuery])
  const addProced = (procedimento: Procedimento) => {
    if (selectedProceds.includes(procedimento)) return
    setSelectedProceds(prev => [...prev, procedimento])
    setDirty(true)
  }
  const removeProced = (procedimento: Procedimento) => {
    if (selectedProceds.includes(procedimento)) setSelectedProceds(prev => prev.filter(c => c !== procedimento))
    setDirty(true)
  }

  //EXAMES
  const [exames, setExames] = useState<Exame[]>([])
  async function searchExames() {
    try {
      const dados = await getAllExames()
      setExames(dados)
    } catch (err) {
      toast.error((err as Error).message)
    }
  }
  const [selectedExames, setSelectedExames] = useState<Exame[]>([])
  const toggleExame = (exame: Exame) => {
    if (selectedExames.includes(exame)) 
    {
      setSelectedExames(prev => prev.filter(c => c !== exame))
    } else 
    {
      setSelectedExames(prev => [...prev, exame])
    }
    setDirty(true)
  }  

  useEffect(() => {
    timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000)
    searchCids()
    searchMedicamentos()
    searchProcedimentos()
    searchExames()
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  useEffect(() => {
    runSearch()
  }, []) 

  useEffect(() => {
    runSearch()
  }, [cids, medicamentos, procedimentos, exames])

  async function runSearch() {
    setCarregando(true)
    try {
      const dados = await getAtendimentoById(21)
      setAtendimento(dados)
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setCarregando(false)
    }
    setCarregando(false)
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
  const lsKey = `att-medico:${0}:${0}`
  const saveLocal = useMemo(
    () =>
      debounce((data: any) => {
        try {
          localStorage.setItem(lsKey, JSON.stringify(data))
        } catch {}
      }, 500),
    [lsKey]
  )

  // Ações
  const formatElapsed = (s: number) => {
    const mm = String(Math.floor(s / 60)).padStart(2, '0')
    const ss = String(s % 60).padStart(2, '0')
    return `${mm}:${ss}`
  }

  const handleImprimirReceita = () => {
    toast.message('Imprimir Receita (conectar ao template)')
  }

  const handleFinalizar = async () => {
    if (atendimento) {
      const atendimentoRealizado: Atendimento = {
        id: atendimento.id,
        evolucao: evolucao,
        procedimentos: selectedProceds.map(p => p.id),
        cids: selectedCids.map(p => p.id),
        medicamentos: selectedMeds.map(p => p.id),
        exames: selectedExames.map(p => p.id),
      }

      try {
        await finalizarAtendimento(atendimentoRealizado);
        toast.success("Atendimento realizado!")
        // router.push('/atendimento')
      } catch {
        toast.error("Finalização do atendimento falhou!")
      } finally {        
        setCarregando(false)
      }
    }
    console.log("procedimentos");
    console.log(selectedProceds);
    console.log("cids");
    console.log(selectedCids);
    console.log("medicacoes");
    console.log(selectedMeds);
    console.log("exames");    
    console.log(selectedExames);    
    console.log("evolucao" + evolucao);
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
                  {atendimento?.paciente.nome || '—'}
                </span>{' '}
                · PA: <span className="font-medium">{atendimento?.triagem?.pa || '—'}</span>
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              Fila: <span className="font-medium">{atendimento?.fila?.nome}</span> · Tempo:{' '}
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
                            value={safeDateLabel(atendimento?.paciente?.dataNascimento) || ''}
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
                          <Input value={atendimento?.triagem?.pa || ''} readOnly disabled />
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
                          {/* {triagem?.hipertensao === 'sim' && (
                            <Badge className="bg-rose-600">Hipertenso</Badge>
                          )} */}
                          {atendimento?.triagem?.comorbidades !== '' && (
                            <Badge className="bg-amber-600">Comorbidade</Badge>
                          )}
                          {atendimento?.triagem?.alergias !== '' && (
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
                            aria-label={`Remover ${p}`}
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
                        key={m.id}
                        type="button"
                        onClick={() => addMed(m)}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-muted/60"
                      >
                        {m.nome}
                      </button>
                    ))}
                  </div>

                  {/* Tags de medicações escolhidas */}
                  {selectedMeds.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {selectedMeds.map(m => (
                        <Badge key={m.id} variant="secondary" className="gap-1">
                          {m.nome}
                          <button
                            type="button"
                            onClick={() => removeMed(m)}
                            className="ml-1 rounded-full px-1 text-xs opacity-70 hover:opacity-100"
                            aria-label={`Remover ${m.id}`}
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Exames */}
                <div>
                  <Label className="mb-2 block">Solicitar Exames</Label>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {exames.map(ex => (
                      <label
                        key={ex.id}
                        className="inline-flex items-center gap-2 text-sm"
                      >
                        <Checkbox
                          checked={selectedExames.includes(ex)}
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
