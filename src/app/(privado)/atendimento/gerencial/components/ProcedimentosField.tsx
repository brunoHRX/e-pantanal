"use client"

import { useFieldArray, useFormContext } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Procedimento } from "@/services/procedimentoService"
import { Plus, Trash2 } from "lucide-react"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import AutocompletePortal from "@/components/autocomplete-portal"
import { useState } from "react"
import { ESPECIALIDADE_ODONTO_ID } from "@/utils/constants"

type Props = {
  atendimentoIndex: number
  procedimentos: Procedimento[]
  tipo: number
}

export default function ProcedimentosField({
  atendimentoIndex,
  procedimentos,
  tipo
}: Props) {

  const { control, setValue } = useFormContext()
  const [novoProced, setNovoProced] = useState<Record<number, boolean>>({})
  const { fields, append, remove: removeField } = useFieldArray({
    control,
    name: `atendimentos.${atendimentoIndex}.procedimentos`
  })

  const toggleNovoProced = (index: number) => {
    setNovoProced(prev => ({
      ...prev,
      [index]: !prev[index]
    }))
  }

  const remove = (i: number) => {
    removeField(i)
    setNovoProced(prev => {
      const next: Record<number, boolean> = {}
      Object.entries(prev).forEach(([k, v]) => {
        const idx = Number(k)
        if (idx < i) next[idx] = v
        else if (idx > i) next[idx - 1] = v
      })
      return next
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between">
        <h4 className="font-semibold">Procedimentos</h4>
        <Button
          type="button"
          onClick={() => append({ nome: "", dente: "", id: 0 })}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {fields.map((f, i) => (
        <div key={f.id} className={`grid ${tipo === ESPECIALIDADE_ODONTO_ID ? "grid-cols-[1fr_auto_1fr_auto]" : "grid-cols-[1fr_auto_auto]"} gap-2 items-center`}>

          {!novoProced[i] && <FormField
            control={control}
            name={`atendimentos.${atendimentoIndex}.procedimentos.${i}.id`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Procedimento</FormLabel>
                <FormControl>
                  <AutocompletePortal
                    id={`procedimento-${i}`}
                    items={procedimentos}
                    labelField="nome"
                    value={procedimentos.find(e => e.id === field.value)?.nome || ""}
                    placeholder="Digite o procedimento"
                    onChange={(v) => { field.onChange(v) }}
                    onSelect={(item) => {
                      setValue(`atendimentos.${atendimentoIndex}.procedimentos.${i}.id`, item.id)
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />}

          {novoProced[i] && (
            <FormField
              control={control}
              name={`atendimentos.${atendimentoIndex}.procedimentos.${i}.nome`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Procedimento</FormLabel>
                  <FormControl>
                    <Input {...field} className="mt-1" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <Button
            type="button"
            className="self-end"
            onClick={() => toggleNovoProced(i)}
          >
            {!novoProced[i] ? 'Novo' : 'Buscar'}
          </Button>


          {tipo === ESPECIALIDADE_ODONTO_ID && (
            <FormField
              control={control}
              name={`atendimentos.${atendimentoIndex}.procedimentos.${i}.dente`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dentes</FormLabel>
                  <FormControl>
                    <Input {...field} className="mt-1" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <Button
            type="button"
            className="self-end"
            variant="destructive"
            onClick={() => remove(i)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ))}
    </div>
  )
}