'use client'

import React, { useMemo, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { X } from 'lucide-react'
import type { Medicamento } from '@/services/medicamentoService'

export interface PrescricaoItem {
  medicamento: Medicamento | { id: number; nome: string } // suporta item manual
  qtd: string
  um: string
  freq: string
}

interface PrescricaoEditorProps {
  medicamentos: Medicamento[]
  value: PrescricaoItem[]
  onChange: (items: PrescricaoItem[]) => void
  onDirty?: () => void
}

const UMS_SUGERIDAS = ['cp', 'mg', 'ml', 'gts', 'amp', 'sachê', 'un']

export default function PrescricaoEditor({
  medicamentos,
  value,
  onChange,
  onDirty
}: PrescricaoEditorProps) {
  // busca
  const [query, setQuery] = useState('')
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return medicamentos.slice(0, 12)
    return medicamentos
      .filter(m => m.nome.toLowerCase().includes(q))
      .slice(0, 24)
  }, [query, medicamentos])

  const addMedicamento = (m: Medicamento) => {
    if (value.some(v => 'id' in v.medicamento && v.medicamento.id === m.id)) {
      toast.info('Medicação já adicionada.')
      return
    }
    const novo: PrescricaoItem = {
      medicamento: m,
      qtd: '',
      um: '',
      freq: ''
    }
    onChange([...value, novo])
    onDirty?.()
    setQuery('')
  }

  // “Outra medicação” (manual)
  const [manual, setManual] = useState('')
  const addManual = () => {
    const nome = manual.trim()
    if (!nome) return
    const novo: PrescricaoItem = {
      medicamento: { id: Date.now(), nome }, // id temporário local
      qtd: '',
      um: '',
      freq: ''
    }
    onChange([...value, novo])
    onDirty?.()
    setManual('')
  }

  const removeIndex = (idx: number) => {
    const next = value.slice()
    next.splice(idx, 1)
    onChange(next)
    onDirty?.()
  }

  const setField = (idx: number, field: keyof PrescricaoItem, val: string) => {
    const next = value.slice()
    ;(next[idx] as any)[field] = val
    onChange(next)
    onDirty?.()
  }

  return (
    <div className="space-y-4">
      <div>
        <Label className="mb-2 block">Buscar medicação</Label>
        <Input
          placeholder="Digite para buscar (ex: Amoxicilina 500 mg)"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <div className="mt-2 max-h-40 overflow-auto rounded-md border divide-y">
          {filtered.length === 0 ? (
            <div className="px-3 py-2 text-sm text-muted-foreground">
              Nenhuma medicação encontrada
            </div>
          ) : (
            filtered.map(m => (
              <button
                key={m.id}
                type="button"
                onClick={() => addMedicamento(m)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-muted/60"
                title="Adicionar"
              >
                {m.nome}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Outra medicação */}
      <div>
        <Label className="mb-2 block">Outra medicação</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Ex: Nimesulida 100 mg"
            value={manual}
            onChange={e => setManual(e.target.value)}
          />
          <Button type="button" onClick={addManual}>
            Adicionar
          </Button>
        </div>
      </div>

      {/* Linhas de prescrição (uma por medicação) */}
      <div className="space-y-2">
        <Label className="block">Itens de prescrição</Label>

        {value.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhuma medicação adicionada.
          </p>
        ) : (
          <div className="space-y-2">
            {value.map((it, idx) => (
              <div
                key={
                  'id' in it.medicamento
                    ? it.medicamento.id
                    : `${(it.medicamento as { nome: string }).nome}-${idx}`
                }
                className="grid grid-cols-1 md:grid-cols-[minmax(180px,1fr)_80px_100px_170px_auto] gap-2 items-center border rounded-md p-2"
                aria-label={`linha-prescricao-${idx}`}
              >
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="whitespace-nowrap">
                    {'nome' in it.medicamento
                      ? it.medicamento.nome
                      : String(it.medicamento)}
                  </Badge>
                </div>

                <Input
                  placeholder="QTD"
                  inputMode="numeric"
                  value={it.qtd}
                  onChange={e => setField(idx, 'qtd', e.target.value)}
                  aria-label="Quantidade (QTD)"
                  title="Quantidade (QTD)"
                />

                <Input
                  placeholder="U.M"
                  list={`um-sugestoes-${idx}`}
                  value={it.um}
                  onChange={e => setField(idx, 'um', e.target.value)}
                  aria-label="Unidade de Medida (U.M)"
                  title="Unidade de Medida (U.M)"
                />
                <datalist id={`um-sugestoes-${idx}`}>
                  {UMS_SUGERIDAS.map(u => (
                    <option value={u} key={u} />
                  ))}
                </datalist>

                <Input
                  placeholder="Frequência (ex: 8/8h)"
                  value={it.freq}
                  onChange={e => setField(idx, 'freq', e.target.value)}
                  aria-label="Frequência"
                  title="Frequência"
                />

                <Button
                  type="button"
                  variant="outline"
                  className="justify-self-end"
                  onClick={() => removeIndex(idx)}
                  aria-label="Remover medicação"
                  title="Remover"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
