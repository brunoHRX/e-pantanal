"use client"

import { FormProvider, useFieldArray, UseFormReturn } from "react-hook-form"
import { Button } from "@/components/ui/button"
import AtendimentoCard from "./AtendimentoCard"
import { AtendimentoGerencialFormType } from "@/types/Gerencial"
import { Usuario } from "@/types/Usuario"
import { Procedimento } from "@/types/Procedimento"
import { Medicamento } from "@/types/Medicamento"
import { Especialidade } from "@/types/Especialidade"


type Props = {
    form: UseFormReturn<AtendimentoGerencialFormType>
    medicos: Usuario[],
    procedimentos: Procedimento[],
    medicamentos: Medicamento[],
    especialidades: Especialidade[],
}

export default function AtendimentoForm({
    form,
    medicos,
    procedimentos,
    medicamentos,
    especialidades
}: Props) {
    const { control } = form
    const { fields, append, remove } = useFieldArray({
        control,
        name: "atendimentos"
    })

    return (

        <div className="space-y-6">


            {fields.map((f, i) => (

                <AtendimentoCard
                    key={f.id}
                    index={i}
                    remove={remove}
                    medicos={medicos}
                    procedimentos={procedimentos}
                    medicamentos={medicamentos}
                    especialidades={especialidades}
                />

            ))}


            <Button
                type="button"
                onClick={() => append({
                    id: 0,
                    especialidade_id: 0,
                    medico_id: 0,
                    medico_nome: '',
                    medico_registro: '',
                    medico_especialidade_id: 0,
                    procedimentos: [],
                    medicamentos: []
                })}
            >

                Novo Atendimento

            </Button>

        </div>

    )

}