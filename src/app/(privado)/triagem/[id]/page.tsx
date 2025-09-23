'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { getPatientById, TriagemFormData, Especialidade, submitTriagem } from '@/services/patientService'
import { differenceInMonths, parseISO, isValid } from 'date-fns'
import { X } from 'lucide-react'
import { getAll } from '@/services/especialidadeService'

/** ===== Helpers ===== **/
function safeDate(iso?: string) {
  if (!iso) return null
  try {
    const d = parseISO(iso)
    return isValid(d) ? d : null
  } catch {
    return null
  }
}
function formatAgeYearsMonths(iso?: string) {
  const birth = safeDate(iso)
  if (!birth) return ''
  const totalMonths = differenceInMonths(new Date(), birth)
  if (totalMonths < 0) return ''
  const years = Math.floor(totalMonths / 12)
  const months = totalMonths % 12
  const y = years === 1 ? '1 ano' : `${years} anos`
  const m = months === 0 ? '' : ` e ${months} ${months === 1 ? 'mês' : 'meses'}`
  return `${y}${m}`
}

function DisplayField({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="mt-2 w-full rounded border px-3 py-2 text-sm bg-background">
        {value && value.trim() ? value : '—'}
      </div>
    </div>
  )
}

/** ===== Página ===== **/
export default function TriagemPage() {
  const router = useRouter()
  const [userName, setUserName] = useState("");
  const [dataHora, setDataHora] = useState<string | null>(null)
  const [allEspecialidades, setallEspecialidades] = useState<Especialidade[]>([])
  const searchParams = useSearchParams()
  const params = useParams() as { id?: string }

  const pacienteId = useMemo(() => {
    const q = searchParams.get('id')
    return Number(q ?? params?.id ?? NaN)
  }, [searchParams, params])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<TriagemFormData>({
    defaultValues: {
      nomePaciente: '',
      idade: '',
      prontuario: 0,
      especialidades: [], // << objetos
      situacao: '',
      sinaisVitais: {
        peso: '',
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
      prioridade: '',
      coletadoPor: userName,
      dataHora: new Date().toLocaleString('pt-BR')
    }
  })

  const { register, handleSubmit, watch, formState, reset, setValue } = form
  const { isSubmitting } = formState
  const temAlergia = watch('alergia') === 'sim'
  const especialidades = watch('especialidades') || []

  // select controlado por id do preset
  const [especialidadeSelecionadaId, setEspecialidadeSelecionadaId] = useState<number>()

  async function handleLoadEspecialidades() {    
    const resEspecialidades = await getAll();
    setallEspecialidades(resEspecialidades);
  }

  useEffect(() => {
    handleLoadEspecialidades();
    const storedUser = localStorage.getItem("userData");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserName(user.usuario.toUpperCase());
    }
    setDataHora(new Date().toLocaleString('pt-BR'));
    async function load() {
      if (!Number.isFinite(pacienteId)) {
        setError('ID do paciente não informado.')
        return
      }
      setLoading(true)
      setError(null)
      try {
        const p = await getPatientById(String(pacienteId))
        const idadeFmt = formatAgeYearsMonths(p?.dataNascimento)
        reset(prev => ({
          ...prev,
          nomePaciente: p?.nome ?? '',
          idade: idadeFmt,
          prontuario: p?.id ?? 0,
          coletadoPor: userName,
          dataHora: new Date().toLocaleString('pt-BR')
        }))
      } catch (e) {
        setError((e as Error).message || 'Falha ao carregar paciente.')
      } finally {
        setLoading(false)
      }
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pacienteId])

  function addEspecialidade() {
    const id = especialidadeSelecionadaId
    if (!id) return
    const chosen = allEspecialidades.find(e => e.id === id)
    if (!chosen) return
    if (especialidades.some(e => e.id === id)) return // evita duplicado
    setValue('especialidades', [...especialidades, chosen], {
      shouldDirty: true
    })
    setEspecialidadeSelecionadaId(0)
  }

  function removeEspecialidade(id: number) {
    setValue(
      'especialidades',
      especialidades.filter(e => e.id !== id),
      { shouldDirty: true }
    )
  }

  async function onSubmit(data: TriagemFormData) {
    setLoading(true)
    setError(null)
    try {        
      await submitTriagem(data)
      toast.success('Triagem salva!')      
    } catch (e) {
      toast.success((e as Error).message || 'Falha ao salvar triagem.')
    } finally {
      setLoading(false)
      router.push(`/triagem`)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-10">
      <Card className="w-full max-w-3xl shadow-lg">
        <CardHeader>
          <CardTitle>Ficha de Triagem Clínica</CardTitle>
          <div className="text-xs text-slate-500 mt-2">
            Preenchido por: <b>{userName}</b> <span className="mx-1">|</span>
            Data/hora: <b>{dataHora}</b>
            {Number.isFinite(pacienteId) && (
              <>
                {' '}
                <span className="mx-1">|</span> Paciente ID: <b>{pacienteId}</b>{' '}
              </>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {loading && (
            <p className="text-sm text-muted-foreground">
              Carregando paciente…
            </p>
          )}
          {error && (
            <p className="text-sm text-destructive mb-4">Erro: {error}</p>
          )}

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Nome/Idade (texto outlined) + Prontuário readonly */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <DisplayField
                  label="Nome do Paciente"
                  value={watch('nomePaciente')}
                />
                <input type="hidden" {...register('nomePaciente')} />
              </div>
              <div>
                <DisplayField label="Idade" value={watch('idade')} />
                <input type="hidden" {...register('idade')} />
              </div>
              <div>
                <Label>Prontuário</Label>
                <Input {...register('prontuario')} className="mt-2" readOnly />
              </div>
            </div>

            <Separator />

            {/* Especialidades (múltiplas) */}
            <div>
              <Label>Áreas de atendimento</Label>
              <div className="mt-2 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <select
                    className="border rounded px-3 py-2 min-w-[200px]"
                    value={especialidadeSelecionadaId}
                    onChange={e =>
                      setEspecialidadeSelecionadaId(Number(e.target.value))
                    }
                  >
                    <option value="">Selecionar...</option>
                    {allEspecialidades.map(opt => (
                      <option key={opt.id} value={opt.id}>
                        {opt.nome}
                      </option>
                    ))}
                  </select>
                  <Button type="button" size="sm" onClick={addEspecialidade}>
                    Adicionar
                  </Button>
                </div>

                {especialidades.length > 0 && (
                  <>
                    <Separator />
                    <div className="flex flex-wrap gap-2">
                      {especialidades.map(esp => (
                        <span
                          key={esp.id}
                          className="inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs"
                        >
                          {esp.nome}
                          <button
                            type="button"
                            className="ml-1 rounded hover:bg-muted p-0.5"
                            aria-label={`Remover ${esp.nome}`}
                            onClick={() => removeEspecialidade(esp.id)}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>
              {/* Não precisa de hidden input; RHF já mantém 'especialidades' no state */}
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

            {/* Sinais Vitais (Peso primeiro) */}
            <div>
              <Label>Sinais Vitais e Parâmetros Relevantes</Label>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mt-2">
                <div className="md:col-span-1 col-span-2">
                  <Label>Peso (kg)</Label>
                  <Input {...register('sinaisVitais.peso')} className="mt-2" />
                </div>
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
                {watch('comorbidadeOp') === 'Sim' && (
                  <Input
                    {...register('comorbidadeDesc')}
                    placeholder="Descreva a comorbidade (ex: Diabetes, HAS, etc.)"
                  />
                )}
              </div>
            </div>

            <Separator />

            {/* Medicação últimas 24h */}
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
              <div className="flex flex-wrap items-center gap-4 mt-2">
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

            {/* Prioridade */}
            <div>
              <Label>Prioridade</Label>
              <div className="flex flex-col md:flex-row gap-3 mt-2">
                <select
                  {...register('prioridade')}
                  className="border rounded px-3 py-2"
                >
                  <option value="baixa">Baixa</option>
                  <option value="media">Média</option>
                  <option value="alta">Alta</option>
                  <option value="urgente">Urgente</option>
                </select>
              </div>
            </div>

            <Separator />

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || loading}
            >
              Salvar Triagem
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
