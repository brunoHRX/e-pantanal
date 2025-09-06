'use client'

import React, { useState } from 'react'
import { nomesDentes } from '@/utils/odontograma'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem
} from '@/components/ui/dropdown-menu'
import { ChevronsUpDown } from 'lucide-react'

export const FACES = [
  { key: 'V', label: 'Vestibular' },
  { key: 'M', label: 'Mesial' },
  { key: 'D', label: 'Distal' },
  { key: 'L', label: 'Lingual/Palatina' },
  { key: 'O', label: 'Oclusal/Incisal' }
] as const
export type FaceKey = (typeof FACES)[number]['key']

export const PROCEDIMENTOS_ODONTO = [
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
export type ProcedimentoOdonto = (typeof PROCEDIMENTOS_ODONTO)[number]

export type ToothSelection = {
  tooth: number
  quadrant: number
  faces: FaceKey[]
  procedures: ProcedimentoOdonto[]
  notes?: string
}
export type ToothSelectionsMap = Record<number, ToothSelection>

function getQuadrantFromFDI(num: number) {
  return Math.floor(num / 10)
}

export type OdontogramaQuadranteProps = {
  numeros: number[]
  titulo: string
  /** 'auto' = responsivo; também aceita 'normal' | 'grande' */
  tamanho?: 'auto' | 'normal' | 'grande'
  outlineGroup?: boolean
  selections?: ToothSelectionsMap
  onChange?: (partial: ToothSelectionsMap) => void
  /** Quando true, o dente NÃO abre modal (somente visual) */
  readOnlyTooth?: boolean
}

export const OdontogramaQuadrante: React.FC<OdontogramaQuadranteProps> = ({
  numeros,
  titulo,
  tamanho = 'auto',
  outlineGroup = false,
  selections = {},
  onChange,
  readOnlyTooth = false
}) => {
  const [openDente, setOpenDente] = useState<number | null>(null)
  const [tempFaces, setTempFaces] = useState<FaceKey[]>([])
  const [tempProcs, setTempProcs] = useState<ProcedimentoOdonto[]>([])
  const [tempNotes, setTempNotes] = useState('')

  const openForTooth = (num: number) => {
    const sel = selections[num]
    setTempFaces(sel?.faces || [])
    setTempProcs(sel?.procedures || [])
    setTempNotes(sel?.notes || '')
    setOpenDente(num)
  }

  const toggleFace = (f: FaceKey) =>
    setTempFaces(prev =>
      prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]
    )

  const toggleProc = (p: ProcedimentoOdonto) =>
    setTempProcs(prev =>
      prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
    )

  const handleSalvar = () => {
    if (openDente === null) return
    const num = openDente
    const partial: ToothSelectionsMap = {
      [num]: {
        tooth: num,
        quadrant: getQuadrantFromFDI(num),
        faces: tempFaces,
        procedures: tempProcs,
        notes: tempNotes
      }
    }
    onChange?.(partial)
    setOpenDente(null)
  }

  // ===== tamanhos responsivos =====
  const denteSize =
    tamanho === 'grande'
      ? 'w-14 h-16 sm:w-16 sm:h-20'
      : tamanho === 'normal'
      ? 'w-10 h-12 sm:w-12 sm:h-14'
      : 'w-9 h-10 xs:w-10 xs:h-12 sm:w-12 sm:h-14 md:w-14 md:h-16'

  const faceSize =
    tamanho === 'grande'
      ? 'w-10 h-10 sm:w-11 sm:h-11'
      : tamanho === 'normal'
      ? 'w-7 h-7 sm:w-8 sm:h-8'
      : 'w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 md:w-10 md:h-10'

  const minWidthClass =
    tamanho === 'grande'
      ? 'min-w-[56px] sm:min-w-[64px]'
      : tamanho === 'normal'
      ? 'min-w-[44px] sm:min-w-[52px]'
      : 'min-w-[38px] xs:min-w-[44px] sm:min-w-[50px] md:min-w-[56px]'

  return (
    <div className="flex flex-col items-center my-1">
      {titulo && (
        <span className="font-semibold mb-1 text-slate-700 text-sm sm:text-base">
          {titulo}
        </span>
      )}

      <div className="flex flex-row gap-1.5 sm:gap-2.5 md:gap-3">
        {numeros.map(num => {
          const sel = selections[num]
          const selecionado =
            !!sel &&
            ((sel.faces?.length ?? 0) > 0 ||
              (sel.procedures?.length ?? 0) > 0 ||
              (sel.notes?.trim()?.length ?? 0) > 0)

          return (
            <div key={num} className="flex flex-col items-center">
              <span className="text-[10px] sm:text-xs mb-1">{num}</span>

              <button
                type="button"
                onClick={() => {
                  if (!readOnlyTooth) openForTooth(num)
                }}
                aria-disabled={readOnlyTooth}
                className={[
                  'group rounded-lg flex flex-col items-center focus:outline-none transition',
                  minWidthClass,
                  readOnlyTooth ? 'cursor-default' : 'cursor-pointer',
                  outlineGroup && selecionado
                    ? 'outline-2 outline-teal-500'
                    : 'outline-none'
                ].join(' ')}
              >
                <img
                  src={`/odontograma/dente_${num}.svg`}
                  alt={`Dente ${num}`}
                  className={`${denteSize} mx-auto z-10`}
                  draggable={false}
                />
                <div className="h-0.5" />
                <img
                  src={`/odontograma/superior_dente.svg`}
                  alt="Faces do dente"
                  className={`${faceSize} mx-auto opacity-70`}
                  draggable={false}
                />
                {selecionado && (
                  <span className="mt-1 text-[9px] text-teal-700">●</span>
                )}
              </button>

              {/* Modal do dente */}
              <Dialog
                open={openDente === num}
                onOpenChange={v => !v && setOpenDente(null)}
              >
                <DialogTrigger asChild>
                  <span />
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>
                      Dente {num} — {nomesDentes[num] || 'Dente'} (Q
                      {getQuadrantFromFDI(num)})
                    </DialogTitle>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div className="flex items-center justify-center">
                      <img
                        src={`/odontograma/dente_${num}.svg`}
                        alt={`Dente ${num}`}
                        className="w-16 h-20"
                      />
                    </div>

                    {/* Procedimentos (multiselect) */}
                    <div>
                      <Label className="mb-1 block">Procedimentos</Label>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-between"
                          >
                            {tempProcs.length > 0
                              ? `${tempProcs.length} selecionado(s)`
                              : 'Selecionar procedimentos'}
                            <ChevronsUpDown className="h-4 w-4 opacity-60" />
                          </Button>
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
                            <Badge
                              key={p}
                              variant="secondary"
                              className="gap-1"
                            >
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

                    {/* Faces (multi) */}
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

                    {/* Notas */}
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
                    <Button onClick={handleSalvar}>Salvar</Button>
                    <Button
                      variant="outline"
                      onClick={() => setOpenDente(null)}
                    >
                      Cancelar
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )
        })}
      </div>
    </div>
  )
}
