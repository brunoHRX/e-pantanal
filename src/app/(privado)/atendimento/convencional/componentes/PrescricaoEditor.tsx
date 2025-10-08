'use client'

import React, { useMemo, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { X } from 'lucide-react'
import type {
  Medicamento,
  ReceitaMedicamento
} from '@/services/medicamentoService'
import { composeLinhaReceita } from '@/utils/prescricao'

interface PrescricaoEditorProps {
  medicamentos: Medicamento[]
  value: ReceitaMedicamento[]
  onChange: (items: ReceitaMedicamento[]) => void
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
  const [lastId, setLastId] = useState<number>(0)
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
    const novo: ReceitaMedicamento = {
      medicamento: m,
      duracao: 0,
      unidade_medida: '',
      observacao: '',
      frequencia: ''
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
    const novo: ReceitaMedicamento = {
      medicamento: { id: lastId, nome, ativo: true }, // id temporário local
      duracao: 0,
      unidade_medida: '',
      frequencia: '',
      observacao: ''
    }
    onChange([...value, novo])
    onDirty?.()
    setManual('')
    setLastId(lastId - 1)
  }

  const removeIndex = (idx: number) => {
    const next = value.slice()
    next.splice(idx, 1)
    onChange(next)
    onDirty?.()
  }

  const setField = (
    idx: number,
    field: keyof ReceitaMedicamento,
    val: string
  ) => {
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
          <>
            {/* Cabeçalho (desktop/tablet) */}
            <div className="hidden md:grid grid-cols-[minmax(180px,1fr)_80px_100px_170px_auto] gap-2 items-center px-2">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Medicação
              </div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide text-center">
                Qtd
              </div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide text-center">
                U.M
              </div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Posologia
              </div>
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide text-right">
                Ações
              </div>
            </div>

            <div className="space-y-2">
              {value.map((it, idx) => {
                const linhaPronta = composeLinhaReceita(it)

                return (
                  <div
                    key={
                      'id' in it.medicamento
                        ? it.medicamento.id
                        : `${(it.medicamento as { nome: string }).nome}-${idx}`
                    }
                    className="grid grid-cols-1 md:grid-cols-[minmax(180px,1fr)_80px_100px_170px_auto] gap-2 items-center border rounded-md p-2"
                    aria-label={`linha-prescricao-${idx}`}
                  >
                    {/* Medicação */}
                    <div className="flex flex-col gap-1">
                      <span className="md:hidden text-[11px] font-medium text-muted-foreground">
                        Medicação
                      </span>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className="whitespace-nowrap"
                        >
                          {'nome' in it.medicamento
                            ? it.medicamento.nome
                            : String(it.medicamento)}
                        </Badge>
                      </div>
                    </div>

                    {/* Qtd */}
                    <div className="flex flex-col gap-1">
                      <span className="md:hidden text-[11px] font-medium text-muted-foreground">
                        Qtd
                      </span>
                      <Input
                        placeholder="QTD"
                        inputMode="numeric"
                        value={it.duracao ?? ''}
                        onChange={e => setField(idx, 'duracao', e.target.value)}
                        aria-label="Quantidade (QTD)"
                        title="Quantidade (QTD)"
                        className="text-center md:text-left"
                      />
                    </div>

                    {/* U.M */}
                    <div className="flex flex-col gap-1">
                      <span className="md:hidden text-[11px] font-medium text-muted-foreground">
                        U.M
                      </span>
                      <Input
                        placeholder="U.M"
                        list={`um-sugestoes-${idx}`}
                        value={it.unidade_medida ?? ''}
                        onChange={e =>
                          setField(idx, 'unidade_medida', e.target.value)
                        }
                        aria-label="Unidade de Medida (U.M)"
                        title="Unidade de Medida (U.M)"
                      />
                      <datalist id={`um-sugestoes-${idx}`}>
                        {UMS_SUGERIDAS.map(u => (
                          <option value={u} key={u} />
                        ))}
                      </datalist>
                    </div>

                    {/* Posologia (texto livre) – usa o campo 'frequencia' do tipo */}
                    <div className="flex flex-col gap-1">
                      <span className="md:hidden text-[11px] font-medium text-muted-foreground">
                        Posologia
                      </span>
                      <Input
                        placeholder='Ex.: "1 cp a cada 12h por 7 dias"'
                        value={it.frequencia ?? ''}
                        onChange={e =>
                          setField(idx, 'frequencia', e.target.value)
                        }
                        aria-label="Posologia"
                        title="Posologia"
                      />
                    </div>

                    {/* Ações */}
                    <div className="flex items-start md:items-center justify-between md:justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => removeIndex(idx)}
                        aria-label="Remover medicação"
                        title="Remover"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Observação (linha inteira) */}
                    <div className="md:col-span-5">
                      <span className="md:hidden text-[11px] font-medium text-muted-foreground">
                        Observação
                      </span>
                      <Input
                        placeholder="Observação (opcional)"
                        value={it.observacao ?? ''}
                        onChange={e =>
                          setField(idx, 'observacao', e.target.value)
                        }
                        aria-label="Observação"
                        title="Observação"
                      />
                    </div>

                    {/* Preview da linha pronta da receita */}
                    <div className="md:col-span-5 text-xs text-muted-foreground">
                      <span className="font-medium">Linha da receita: </span>
                      {linhaPronta}
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
