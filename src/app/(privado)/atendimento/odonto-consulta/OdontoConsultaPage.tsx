'use client'

import React, { useEffect, useMemo, useState } from 'react'
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
import { ArrowLeft, Plus } from 'lucide-react'

import Odontograma from './componntes/Odontograma'
import {
  FACES,
  PROCEDIMENTOS_ODONTO,
  type FaceKey,
  type ProcedimentoOdonto,
  type ToothSelectionsMap
} from './componntes/OdontogramaQuadrante'

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Button as UIButton } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { nomesDentes } from '@/utils/odontograma'

// --------------------
// Tipos (mocks)
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
  return { pa: '120x80', hipertensao: 'não', diabetes: 'sim', alergia: 'não' }
}

// --------------------
// Helpers de dentes (labels + quadrante)
// --------------------
const PERMANENTES = [
  18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28, 48, 47, 46,
  45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38
]
const DECIDUOS = [
  55, 54, 53, 52, 51, 61, 62, 63, 64, 65, 85, 84, 83, 82, 81, 71, 72, 73, 74, 75
]
const quadrantOf = (num: number) => Math.floor(num / 10)
const isDeciduo = (num: number) => {
  const q = quadrantOf(num)
  return q === 5 || q === 6 || q === 7 || q === 8
}

// posição (1..8) → nome permanente
const POSICAO_NOME: Record<number, string> = {
  1: 'Incisivo Central',
  2: 'Incisivo Lateral',
  3: 'Canino',
  4: '1º Pré-Molar',
  5: '2º Pré-Molar',
  6: '1º Molar',
  7: '2º Molar',
  8: '3º Molar'
}

function fallbackToothName(num: number): string {
  const pos = (num % 10) as keyof typeof POSICAO_NOME
  if (isDeciduo(num)) {
    // série decídua (5–8): 1..5
    const mapaDeciduo: Record<number, string> = {
      1: 'Incisivo Central Decíduo',
      2: 'Incisivo Lateral Decíduo',
      3: 'Canino Decíduo',
      4: '1º Molar Decíduo',
      5: '2º Molar Decíduo',
      6: 'Molar Decíduo',
      7: 'Molar Decíduo',
      8: 'Molar Decíduo',
      0: 'Dente Decíduo'
    }
    return mapaDeciduo[pos] || 'Dente Decíduo'
  }
  return POSICAO_NOME[pos] || 'Dente'
}

function toothDisplayName(num: number): string {
  return nomesDentes[num] || fallbackToothName(num)
}

function toothLabel(num: number) {
  return `${num} — ${toothDisplayName(num)} (Q${quadrantOf(num)})`
}

// --------------------
// Página
// --------------------
export default function AtendimentoOdontoConsultaPage() {
  const router = useRouter()
  const params = useParams<{ idFila: string }>()
  const search = useSearchParams()
  const idFila = params?.idFila
  const pacienteId = search.get('pacienteId') || ''

  // estados
  const [carregando, setCarregando] = useState(true)
  const [dadosPaciente, setDadosPaciente] = useState<Paciente | null>(null)
  const [triagem, setTriagem] = useState<Triagem | null>(null)

  // atendimento
  const [evolucao, setEvolucao] = useState('')
  const [prescricao, setPrescricao] = useState('')

  // seleção consolidada (por dente)
  const [odontoSelections, setOdontoSelections] = useState<ToothSelectionsMap>(
    {}
  )

  // accordion Info+Triagem
  const [infoOpen, setInfoOpen] = useState<string | undefined>('info')

  // modal "Adicionar procedimento"
  const [addOpen, setAddOpen] = useState(false)
  const [toothPick, setToothPick] = useState<number | ''>('') // nº do dente
  const [tempFaces, setTempFaces] = useState<FaceKey[]>([])
  const [tempProcs, setTempProcs] = useState<ProcedimentoOdonto[]>([])
  const [tempNotes, setTempNotes] = useState('')

  useEffect(() => {
    let alive = true
    setCarregando(true)
    Promise.all([
      fetchPacienteById(pacienteId),
      fetchTriagemAtual(pacienteId, idFila)
    ])
      .then(([p, t]) => {
        if (!alive) return
        setDadosPaciente(p)
        setTriagem(t)
      })
      .finally(() => alive && setCarregando(false))
    return () => {
      alive = false
    }
  }, [pacienteId, idFila])

  const selectionsArray = useMemo(
    () =>
      Object.values(odontoSelections).filter(
        s => (s.procedures?.length || 0) > 0
      ),
    [odontoSelections]
  )

  // ações
  const handleFinalizar = async () => {
    // TODO: salvar {idFila, pacienteId, evolucao, prescricao, odontograma: odontoSelections}
    toast.success('Atendimento finalizado!')
    router.push('/atendimento')
  }
  const handleCancelar = () => {
    toast.message('Atendimento cancelado.')
    router.push('/atendimento')
  }

  // modal add
  const openAdd = () => {
    setToothPick('')
    setTempFaces([])
    setTempProcs([])
    setTempNotes('')
    setAddOpen(true)
  }
  const toggleFace = (f: FaceKey) =>
    setTempFaces(prev =>
      prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]
    )
  const toggleProc = (p: ProcedimentoOdonto) =>
    setTempProcs(prev =>
      prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
    )
  const saveAdd = () => {
    if (toothPick === '' || tempProcs.length === 0) {
      toast.error('Selecione o dente e ao menos um procedimento.')
      return
    }
    setOdontoSelections(prev => ({
      ...prev,
      [toothPick as number]: {
        tooth: toothPick as number,
        quadrant: quadrantOf(toothPick as number),
        faces: tempFaces,
        procedures: tempProcs,
        notes: tempNotes
      }
    }))
    setAddOpen(false)
  }

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
                Atendimento Odontológico (Consulta)
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
            {/* Info + Triagem */}
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

                      <div className="hidden lg:block" />

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

            {/* Odontograma (somente visual; alternância liberada, dentes bloqueados) */}
            <div className="border rounded-lg">
              <div className="px-4 py-3 text-base font-semibold border-b">
                Odontograma (referência visual)
              </div>
              <div className="px-2 sm:px-4 pb-4 w-full">
                <div className="w-full max-w-full">
                  <Odontograma
                    value={odontoSelections}
                    onChange={() => {
                      /* no-op (visual) */
                    }}
                    readOnlyTooth
                  />
                </div>
              </div>
            </div>

            {/* Resumo + Adicionar procedimento */}
            <div className="border rounded-lg">
              <div className="px-4 py-3 text-base font-semibold border-b flex items-center justify-between gap-2">
                <span>Procedimentos por dente</span>
                <Button size="sm" onClick={openAdd} className="gap-2">
                  <Plus className="h-4 w-4" /> Adicionar procedimento
                </Button>
              </div>

              <div className="px-4 pb-4 pt-2 space-y-2">
                {selectionsArray.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Nenhum procedimento adicionado ainda.
                  </p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {selectionsArray.map(sel => (
                      <div key={sel.tooth} className="flex flex-col gap-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge
                            variant="secondary"
                            className="font-mono"
                            title={toothLabel(sel.tooth)}
                          >
                            {sel.tooth}
                          </Badge>
                          <span className="text-sm">
                            {toothDisplayName(sel.tooth)} (Q{sel.quadrant})
                          </span>
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
                                      x => x !== p
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

            {/* Evolução / Prescrição */}
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

            {/* Ações */}
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

      {/* MODAL: Adicionar procedimento (escolher dente) */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Adicionar procedimento</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Selecionar dente */}
            <div>
              <Label className="mb-1 block">Selecionar dente</Label>
              <select
                className="w-full rounded-md border px-3 py-2 text-sm"
                value={toothPick}
                onChange={e =>
                  setToothPick(e.target.value ? Number(e.target.value) : '')
                }
              >
                <option value="">— escolha o dente —</option>
                <optgroup label="Permanentes">
                  {PERMANENTES.map(n => (
                    <option key={n} value={n}>
                      {toothLabel(n)}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Decíduos">
                  {DECIDUOS.map(n => (
                    <option key={n} value={n}>
                      {toothLabel(n)}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* Procedimentos (multiselect via dropdown) */}
            <div>
              <Label className="mb-1 block">Procedimentos</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <UIButton
                    variant="outline"
                    className="w-full justify-between"
                  >
                    {tempProcs.length > 0
                      ? `${tempProcs.length} selecionado(s)`
                      : 'Selecionar procedimentos'}
                    <span className="opacity-60">▾</span>
                  </UIButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="w-[var(--radix-dropdown-menu-trigger-width)] max-h-64 overflow-auto"
                >
                  {PROCEDIMENTOS_ODONTO.map(p => (
                    <DropdownMenuCheckboxItem
                      key={p}
                      checked={tempProcs.includes(p)}
                      onCheckedChange={() => toggleProc(p)}
                    >
                      {p}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {tempProcs.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {tempProcs.map(p => (
                    <Badge key={p} variant="secondary" className="gap-1">
                      {p}
                      <button
                        type="button"
                        onClick={() => toggleProc(p)}
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

            {/* Faces */}
            <div>
              <Label className="mb-1 block">Faces</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {FACES.map(f => (
                  <label
                    key={f.key}
                    className="inline-flex items-center gap-2 text-sm"
                  >
                    <Checkbox
                      checked={tempFaces.includes(f.key)}
                      onCheckedChange={() => toggleFace(f.key)}
                    />
                    <span>{f.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Observações */}
            <div>
              <Label htmlFor="notes" className="mb-1 block">
                Observações
              </Label>
              <Textarea
                id="notes"
                value={tempNotes}
                onChange={e => setTempNotes(e.target.value)}
                placeholder="Observações, materiais, particularidades..."
                className="resize-none min-h-[80px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button onClick={saveAdd}>Salvar</Button>
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
