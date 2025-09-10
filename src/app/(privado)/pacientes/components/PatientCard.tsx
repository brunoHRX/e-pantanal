// src/app/patients/components/PatientCard.tsx
'use client'

import React, { KeyboardEvent } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { format, parseISO, isValid, differenceInYears } from 'date-fns'
import { id, ptBR } from 'date-fns/locale'
import { Patient } from '@/types/Patient'
import { toast } from 'sonner'
import { startAtendimento } from '@/services/patientService'

interface PatientCardProps {
  paciente: Patient
  onUpdate?: (id: number) => void
  clickToEdit?: boolean
}

function maskCPF(cpf?: string) {
  if (!cpf) return '—'
  const digits = cpf.replace(/\D/g, '')
  if (digits.length < 11) return cpf
  return `***.***.***-${digits.slice(-3)}`
}

function safeDate(iso?: string) {
  if (!iso) return null
  try {
    const d = parseISO(iso)
    if (!isValid(d)) return null
    return d
  } catch {
    return null
  }
}
function safeDateLabel(iso?: string) {
  const d = safeDate(iso)
  return d ? format(d, 'dd/MM/yyyy', { locale: ptBR }) : '—'
}
function ageFromISO(iso?: string) {
  const d = safeDate(iso)
  if (!d) return null
  const age = differenceInYears(new Date(), d)
  return age >= 0 ? age : null
}

export const PatientCard: React.FC<PatientCardProps> = ({
  paciente,
  onUpdate,
  clickToEdit = true
}) => {
  const nome = paciente?.nome || 'Sem nome'
  const cpfMasked = maskCPF(paciente?.cpf)
  const nascLabel = safeDateLabel(paciente?.dataNascimento)
  const idade = ageFromISO(paciente?.dataNascimento)
  const sexo = paciente?.sexo || '—'
  const mae = paciente?.filiacao1 || '—'
  const local = paciente?.fazendaReferencia || '—'
  const tipoSangue = paciente?.tipoSanguineo?.toUpperCase() || '—'

  const handleEdit = () => {
    if (onUpdate && typeof paciente?.id === 'number') onUpdate(paciente.id)
  }

  const handleKey = (e: KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && clickToEdit) {
      e.preventDefault()
      handleEdit()
    }
  }

  async function handleAtendimento (id: number) {
    try {
      await startAtendimento(id)
      toast.success("Atendimento iniciado.")
    } catch (err) {
      toast.error("Paciente já iniciou atendimento.")
    }
  }

  return (
    <Card
      className={`w-full h-full ${
        clickToEdit ? 'cursor-pointer hover:shadow-md transition-shadow' : ''
      }`}
      onClick={clickToEdit ? handleEdit : undefined}
      onKeyDown={clickToEdit ? handleKey : undefined}
      role={clickToEdit ? 'button' : undefined}
      tabIndex={clickToEdit ? 0 : -1}
      aria-label={clickToEdit ? `Abrir edição de ${nome}` : undefined}
    >
      {/* Cabeçalho mais compacto */}
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <CardTitle className="leading-tight text-base md:text-lg">
              {nome}
            </CardTitle>
            <p className="text-xs text-muted-foreground">CPF: {cpfMasked}</p>
          </div>
          <div className="flex flex-wrap gap-1">
            {sexo !== '—' && (
              <Badge variant="secondary" className="text-[10px] py-0.5">
                {sexo}
              </Badge>
            )}
            {tipoSangue !== '—' && (
              <Badge variant="outline" className="text-[10px] py-0.5">
                {tipoSangue}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      {/* Conteúdo em coluna única + botão fixo no canto inferior direito */}
      <CardContent className="pt-0">
        <div className="flex flex-col text-sm gap-1.5 min-h-[120px]">
          <div className="truncate">
            <span className="font-medium">Data de Nascimento:</span> {nascLabel}
            {idade !== null && (
              <span className="text-muted-foreground"> • {idade} anos</span>
            )}
          </div>

          <div className="truncate">
            <span className="font-medium">Nome da Mãe:</span> {mae}
          </div>

          <div className="truncate">
            <span className="font-medium">Local:</span> {local}
          </div>

          {/* Spacer para empurrar o botão pra base */}
          <div className="mt-auto"></div>

          <div className="flex justify-end">
            <Button
              size="sm"
              variant="outline"
              onClick={e => {
                e.stopPropagation()
                handleAtendimento(paciente.id)
              }}
              disabled={!(onUpdate && typeof paciente?.id === 'number')}
            >
              Iniciar atendimento
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
