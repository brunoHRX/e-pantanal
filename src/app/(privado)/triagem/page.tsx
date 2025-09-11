'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getAllPatients, Patient } from '@/services/triagemService'
import { useRouter } from 'next/navigation'
import { ageFromISO, maskCPF, safeDateLabel } from '@/utils/functions'
import { Badge } from '@/components/ui/badge'

export default function SelecionarPacienteTriagemPage() {
  const router = useRouter()
  const [all, setAll] = useState<Patient[]>([])
  const [loading, startTransition] = useTransition()
  const boxRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    startTransition(async () => {
      const dados = await getAllPatients()
      setAll(dados)
    })
  }, []);

  return (
    <div className="p-6">
      <Card ref={boxRef} className="mb-4 relative">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-bold">
            Selecionar Paciente para Triagem
          </CardTitle>
        </CardHeader>
      </Card>
      
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {all.map((paciente, index) => (
          <Card className="relative" key={paciente.id}>
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
                  {paciente.sexo !== '—' && (
                    <Badge variant="secondary" className="text-[10px] py-0.5">
                      {paciente.sexo}
                    </Badge>
                  )}
                  {paciente.tipoSanguineo !== '—' && (
                    <Badge variant="outline" className="text-[10px] py-0.5">
                      {paciente.tipoSanguineo}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
      
            <CardContent className="pt-0">
              <div className="flex items-start justify-between gap-4">
                <div className="text-sm leading-relaxed">
                  <div>
                    <span className="font-medium">Nascimento:</span> {safeDateLabel(paciente.dataNascimento)}
                    {paciente.dataNascimento !== null && (
                      <span className="text-muted-foreground"> • {ageFromISO(paciente.dataNascimento)} anos</span>
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
                {/* {index === 0 && ( */}
                  <div className="shrink-0">
                    <Button
                      size="sm"
                      onClick={() => router.push(`/triagem/novo?id=${paciente.id}`)}
                      title="Ir para triagem"
                      className="whitespace-nowrap"
                    >
                      Realizar triagem
                    </Button>
                  </div>
                {/* )} */}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
