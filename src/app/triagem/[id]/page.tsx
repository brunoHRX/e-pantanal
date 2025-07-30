'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'

type TriagemFormData = {
  nomePaciente: string
  idade: string
  prontuario: string
  peso: string

  situacao: string
  sinaisVitais: {
    temperatura: string
    fr: string
    sato2: string
    pa: string
    fc: string
  }
  comorbidadeOp: string // Incapaz, Não Possui, Sim
  comorbidadeDesc?: string
  obsComorbidade?: string

  medicacao24h: string
  alergia: string // 'não' ou 'sim'
  quaisAlergias?: string

  // Sistema
  coletadoPor: string
  dataHora: string
}

export default function TriagemPage() {
  const usuario = 'Usuário em Sessão' // Puxe da sessão/autenticação real
  const [dataHora] = useState(() => new Date().toLocaleString('pt-BR'))

  const form = useForm<TriagemFormData>({
    defaultValues: {
      nomePaciente: '',
      idade: '',
      prontuario: '',
      peso: '',
      situacao: '',
      sinaisVitais: {
        temperatura: '',
        fr: '',
        sato2: '',
        pa: '',
        fc: ''
      },
      comorbidadeOp: 'Não Possui',
      comorbidadeDesc: '',
      medicacao24h: '',
      alergia: 'não',
      quaisAlergias: '',
      coletadoPor: usuario,
      dataHora: dataHora
    }
  })

  const { register, handleSubmit, watch, formState, setValue } = form
  const { isSubmitting } = formState

  // Condicional: mostrar caixa para qual comorbidade
  const comorbidadeOp = watch('comorbidadeOp')
  const temAlergia = watch('alergia') === 'sim'

  async function onSubmit(data: TriagemFormData) {
    // Pode enviar para API aqui
    toast.success('Triagem salva!')
    // ...
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-10">
      <Card className="w-full max-w-3xl shadow-lg">
        <CardHeader>
          <CardTitle>Ficha de Triagem Clínica</CardTitle>
          <div className="text-xs text-slate-500 mt-2">
            Preenchido por: <b>{usuario}</b> <span className="mx-1">|</span>
            Data/hora: <b>{dataHora}</b>
          </div>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Dados do Paciente */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label>Nome do Paciente</Label>
                <Input
                  {...register('nomePaciente', { required: true })}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Idade</Label>
                <Input
                  {...register('idade', { required: true })}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Prontuário</Label>
                <Input
                  {...register('prontuario', { required: true })}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Peso (kg)</Label>
                <Input {...register('peso')} className="mt-2" />
              </div>
            </div>

            <Separator />

            {/* Situação/Queixa */}
            <div>
              <Label>Situação / Queixa Principal</Label>
              <Textarea
                {...register('situacao')}
                placeholder="Descreva o motivo do atendimento, queixa principal..."
                className="mt-2"
              />
            </div>

            <Separator />

            {/* Sinais Vitais */}
            <div>
              <Label>Sinais Vitais e Parâmetros Relevantes</Label>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mt-2">
                <div>
                  <Label>Temperatura (°C)</Label>
                  <Input
                    {...register('sinaisVitais.temperatura')}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>FR (irpm)</Label>
                  <Input {...register('sinaisVitais.fr')} className="mt-2" />
                </div>
                <div>
                  <Label>SATO² (%)</Label>
                  <Input {...register('sinaisVitais.sato2')} className="mt-2" />
                </div>
                <div>
                  <Label>PA (mmHg)</Label>
                  <Input
                    {...register('sinaisVitais.pa')}
                    placeholder="Ex: 120/80"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>FC (bpm)</Label>
                  <Input {...register('sinaisVitais.fc')} className="mt-2" />
                </div>
              </div>
            </div>

            <Separator />

            {/* Comorbidades */}
            <div>
              <Label>Comorbidades</Label>
              <div className="flex flex-col md:flex-row gap-3 mt-2">
                <select
                  {...register('comorbidadeOp')}
                  className="border rounded px-3 py-2"
                >
                  <option value="Incapaz ou não sabe referir">
                    Incapaz ou não sabe referir
                  </option>
                  <option value="Não Possui">Não Possui</option>
                  <option value="Sim">Sim</option>
                </select>
                {comorbidadeOp === 'Sim' && (
                  <Input
                    {...register('comorbidadeDesc')}
                    placeholder="Descreva a comorbidade (ex: Diabetes, HAS, etc.)"
                  />
                )}
              </div>
            </div>

            <Separator />

            {/* Medicação e Uso nas últimas 24h */}
            <div>
              <Label>Medicação e Uso nas Últimas 24h</Label>
              <Input
                {...register('medicacao24h')}
                placeholder="Ex: Dipirona, Paracetamol, etc."
                className="mt-2"
              />
            </div>

            <Separator />

            {/* Alergias */}
            <div>
              <Label>Alergias</Label>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    value="não"
                    {...register('alergia')}
                    className="accent-teal-600"
                  />
                  Não
                </label>
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    value="sim"
                    {...register('alergia')}
                    className="accent-teal-600"
                  />
                  Sim
                </label>
                {temAlergia && (
                  <Input
                    {...register('quaisAlergias')}
                    placeholder="Quais alergias?"
                  />
                )}
              </div>
            </div>

            <Separator />

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              Salvar Triagem
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
