"use client"

import { useFieldArray, useFormContext } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Medicamento } from "@/services/medicamentoService"
import { Plus, Trash2 } from "lucide-react"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import AutocompletePortal from "@/components/autocomplete-portal"
import { useState } from "react"

type Props = {
  atendimentoIndex: number
  medicamentos: Medicamento[]
}

export default function MedicamentosField({
  atendimentoIndex,
  medicamentos
}: Props) {

  const { control, setValue } = useFormContext()
  const [novoProced, setNovoProced] = useState<Record<number, boolean>>({})
  const toggleNovoProced = (index: number) => {
    setNovoProced(prev => ({
      ...prev,
      [index]: !prev[index]
    }))
  }

  const { fields, append, remove: removeField } = useFieldArray({
    control,
    name: `atendimentos.${atendimentoIndex}.medicamentos`
  })

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
        <h4 className="font-semibold">Medicamentos</h4>

        <Button
          type="button"
          onClick={() => append({ nome: "", id: 0, frequencia: "", duracao: "" })}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {fields.map((f, i) => (
        <div key={f.id} className="grid grid-cols-[1fr_auto_1fr_1fr_auto] gap-3 items-center">
          {!novoProced[i] && <FormField
            control={control}
            name={`atendimentos.${atendimentoIndex}.medicamentos.${i}.id`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Medicamento</FormLabel>
                <FormControl>
                  <AutocompletePortal
                    id={`medicamento-${i}`}
                    items={medicamentos}
                    labelField="nome"
                    value={medicamentos.find(e => e.id === field.value)?.nome || ""}
                    placeholder="Digite o medicamento"
                    onChange={(v) => { field.onChange(v) }}
                    onSelect={(item) => {
                      setValue(`atendimentos.${atendimentoIndex}.medicamentos.${i}.id`, item.id)
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />}

          {novoProced[i] && (
            <FormField
              control={control}
              name={`atendimentos.${atendimentoIndex}.medicamentos.${i}.nome`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Medicamento</FormLabel>
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
          <FormField
              control={control}
              name={`atendimentos.${atendimentoIndex}.medicamentos.${i}.frequencia`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Frequência</FormLabel>
                  <FormControl>
                    <Input {...field} className="mt-1" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`atendimentos.${atendimentoIndex}.medicamentos.${i}.duracao`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duração</FormLabel>
                  <FormControl>
                    <Input {...field} className="mt-1" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          <Button
            type="button"
            className="self-end"
            size="icon"
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