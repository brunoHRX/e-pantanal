'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { differenceInYears, format, parseISO, isValid } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Patient } from '@/services/patientService'
import { X } from 'lucide-react'

function maskCPF(cpf?: string) {
  if (!cpf) return '—'
  const d = cpf.replace(/\D/g, '')
  if (d.length < 11) return cpf
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9, 11)}`
}
function safeDate(iso?: string) {
  if (!iso) return null
  try {
    const dt = parseISO(iso)
    return isValid(dt) ? dt : null
  } catch {
    return null
  }
}
function safeDateLabel(iso?: string) {
  const dt = safeDate(iso)
  return dt ? format(dt, 'dd/MM/yyyy', { locale: ptBR }) : '—'
}
function ageFromISO(iso?: string) {
  const dt = safeDate(iso)
  if (!dt) return null
  const age = differenceInYears(new Date(), dt)
  return age >= 0 ? age : null
}

export function SelectedPatientCard({
  paciente,
  onClear,
  onTriagem
}: {
  paciente: Patient
  onClear?: () => void
  onTriagem?: () => void
}) {
  const nasc = safeDateLabel(paciente?.dataNascimento)
  const idade = ageFromISO(paciente?.dataNascimento)
  const sexo = paciente?.sexo || '—'
  const tipoSangue = paciente?.tipoSanguineo?.toUpperCase() || '—'

  return (
    <Card className="relative">
      <CardHeader className="py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-0.5">
            <CardTitle className="leading-tight text-base">
              {paciente?.nome || 'Sem nome'}
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              CPF: {maskCPF(paciente?.cpf)} • Prontuário: {paciente?.id ?? '—'}
            </p>
          </div>

          <div className="flex items-center gap-1">
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
            {onClear && (
              <Button
                size="icon"
                variant="ghost"
                onClick={onClear}
                className="ml-1"
                title="Remover seleção"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-start justify-between gap-4">
          <div className="text-sm leading-relaxed">
            <div>
              <span className="font-medium">Nascimento:</span> {nasc}
              {idade !== null && (
                <span className="text-muted-foreground"> • {idade} anos</span>
              )}
            </div>
            <div>
              <span className="font-medium">Nome da Mãe:</span>{' '}
              {paciente?.filiacao1 || '—'}
            </div>
            {paciente?.fazendaReferencia && (
              <div className="truncate">
                <span className="font-medium">Local:</span>{' '}
                {paciente.fazendaReferencia}
              </div>
            )}
          </div>

          <div className="shrink-0">
            <Button
              size="sm"
              onClick={onTriagem} // 👈 agora ligado corretamente
              title="Ir para triagem"
              className="whitespace-nowrap"
            >
              Realizar triagem
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
