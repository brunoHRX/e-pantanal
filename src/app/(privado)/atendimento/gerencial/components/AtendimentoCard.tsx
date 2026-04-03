"use client"

import { UseFieldArrayRemove, useFormContext } from "react-hook-form"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import ProcedimentosField from "./ProcedimentosField"
import MedicamentosField from "./MedicamentosField"
import { Usuario } from "@/types/Usuario"
import { Procedimento } from "@/types/Procedimento"
import { Medicamento } from "@/types/Medicamento"
import { Especialidade } from "@/types/Especialidade"
import { useState } from "react"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import AutocompletePortal from "@/components/autocomplete-portal"
import { Plus } from "lucide-react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

type Props = {
    index: number,
    remove: UseFieldArrayRemove,
    medicos: Usuario[],
    procedimentos: Procedimento[],
    medicamentos: Medicamento[],
    especialidades: Especialidade[],
}

export default function AtendimentoCard({
    index,
    remove,
    medicos,
    procedimentos,
    medicamentos,
    especialidades
}: Props) {
    const { watch, setValue, control } = useFormContext()
    const tipo = watch(`atendimentos.${index}.especialidade_id`)
    const [novoMedico, setNovoMedico] = useState(false)

    return (
        <Card>
            <CardHeader className="flex justify-between">
                <CardTitle>Atendimento</CardTitle>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button type="button" variant="destructive">Remover</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Remover atendimento?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Esta ação não pode ser desfeita. O atendimento será removido do formulário.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => remove(index)}>Remover</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardHeader>

            <CardContent className="space-y-6">
                {/** especialidade */}
                <FormField
                    control={control}
                    name={`atendimentos.${index}.especialidade_id`}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Tipo atendimento</FormLabel>
                            <FormControl>
                                <AutocompletePortal
                                    id={`tipo-${index}`}
                                    items={especialidades}
                                    labelField="nome"
                                    value={especialidades.find(e => e.id === field.value)?.nome || ""}
                                    placeholder="Digite a especialidade"
                                    onChange={(v) => { field.onChange(v) }}
                                    onSelect={(item) => { setValue(`atendimentos.${index}.especialidade_id`, item.id) }}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />
                
                {/** medico */}
                <div className="flex gap-2">
                    <div className="flex-1">
                        <FormField
                            control={control}
                            name={`atendimentos.${index}.medico_id`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Médico</FormLabel>
                                    <FormControl>
                                        <AutocompletePortal
                                            id={`medico-${index}`}
                                            items={medicos}
                                            labelField="usuario"
                                            value={medicos.find(e => e.id === field.value)?.usuario || ""}
                                            placeholder="Digite o médico"
                                            onChange={(v) => { field.onChange(v) }}
                                            onSelect={(item) => { setValue(`atendimentos.${index}.medico_id`, item.id) }}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>
                    <Button
                        type="button"
                        className="self-end"
                        onClick={() => setNovoMedico(v => !v)}
                    >
                        {novoMedico ? 'Buscar' : 'Novo'}
                    </Button>
                </div>
                {novoMedico && (
                    <div className="grid grid-cols-3 gap-3">
                        <FormField
                            control={control}
                            name={`atendimentos.${index}.medico_nome`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nome</FormLabel>
                                    <FormControl>
                                        <Input {...field} className="mt-1" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={control}
                            name={`atendimentos.${index}.medico_registro`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Registro (CRM / CRO)</FormLabel>
                                    <FormControl>
                                        <Input {...field} className="mt-1" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={control}
                            name={`atendimentos.${index}.medico_especialidade_id`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tipo atendimento</FormLabel>
                                    <FormControl>
                                        <AutocompletePortal
                                            id={`medico-esp-${index}`}
                                            items={especialidades}
                                            labelField="nome"
                                            value={especialidades.find(e => e.id === field.value)?.nome || ""}
                                            placeholder="Digite a especialidade"
                                            onChange={(v) => { field.onChange(v) }}
                                            onSelect={(item) => { setValue(`atendimentos.${index}.medico_especialidade_id`, item.id) }}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>
                )}

                <ProcedimentosField atendimentoIndex={index} procedimentos={procedimentos} tipo={tipo} />
                <MedicamentosField atendimentoIndex={index} medicamentos={medicamentos} />
            </CardContent>
        </Card>
    )
}