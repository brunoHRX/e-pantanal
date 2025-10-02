'use client'

import * as React from 'react'
import { Badge } from '@/components/ui/badge'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'
import { ChevronsUpDown } from 'lucide-react'

export type ProfessionalStatus = 'ATENDENDO' | 'OCIOSO'

export type ActiveProfessional = {
  id: number
  nome: string
  especialidade: string
  status: ProfessionalStatus
  /** ISO da data/hora em que entrou no status atual */
  statusDesde: string
  /** Nome do paciente em atendimento (se status === 'ATENDENDO') */
  pacienteAtual?: string | null
}

type Props = {
  profissionais: ActiveProfessional[]
  className?: string
  /** inicia aberto? */
  defaultOpen?: boolean
  /** opcional: título do bloco */
  title?: string
}

export function ActiveProfessionalsBar({
  profissionais,
  className,
  defaultOpen = true,
  title = 'Profissionais ativos'
}: Props) {
  const [open, setOpen] = React.useState(defaultOpen)

  const total = profissionais.length
  const atendendo = profissionais.filter(p => p.status === 'ATENDENDO').length
  const ociosos = total - atendendo

  return (
    <div className={className}>
      <Collapsible open={open} onOpenChange={setOpen}>
        {/* Cabeçalho */}
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm font-semibold">{title}</div>
            <div className="text-xs text-muted-foreground flex flex-wrap gap-x-3 gap-y-1">
              <span>
                Total: <b className="text-foreground">{total}</b>
              </span>
              <span>
                Atendendo: <b className="text-foreground">{atendendo}</b>
              </span>
              <span>
                Ociosos: <b className="text-foreground">{ociosos}</b>
              </span>
            </div>
          </div>

          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-1">
              {open ? 'Ocultar' : 'Exibir'}
              <ChevronsUpDown className="h-4 w-4" />
            </Button>
          </CollapsibleTrigger>
        </div>

        {/* Conteúdo (lista) */}
        <CollapsibleContent className="mt-2">
          {profissionais.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              Nenhum profissional ativo no momento.
            </div>
          ) : (
            <ul className="divide-y rounded border">
              {profissionais.map(p => (
                <ProfessionalRow key={p.id} prof={p} />
              ))}
            </ul>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}

/* === Item da lista (1 profissional por linha) === */
function ProfessionalRow({ prof }: { prof: ActiveProfessional }) {
  const elapsed = useElapsed(prof.statusDesde)
  const isAtendendo = prof.status === 'ATENDENDO'

  return (
    <li className="p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
      {/* lado esquerdo: nome + especialidade + paciente (quando atendendo) */}
      <div className="flex flex-wrap items-center gap-x-3 text-sm">
        <span className="font-medium truncate">{prof.nome}</span>
        <span className="text-muted-foreground truncate">
          ({prof.especialidade})
        </span>
        {isAtendendo && prof.pacienteAtual && (
          <span className="truncate">
            Paciente: <b>{prof.pacienteAtual}</b>
          </span>
        )}
      </div>

      {/* lado direito: status + tempo */}
      <div className="flex items-center gap-2">
        <StatusBadge status={prof.status} />
        <span className="text-xs tabular-nums text-muted-foreground">
          {elapsed}
        </span>
      </div>
    </li>
  )
}

/* === Badge de status === */
function StatusBadge({ status }: { status: ProfessionalStatus }) {
  const isAtendendo = status === 'ATENDENDO'
  const classes = isAtendendo
    ? 'bg-emerald-600 text-white border-emerald-600'
    : 'bg-amber-100 text-amber-800 border-amber-200'
  const label = isAtendendo ? 'Atendendo' : 'Ocioso'
  return <Badge className={classes}>{label}</Badge>
}

/** Cronômetro HH:MM:SS desde uma data ISO */
function useElapsed(sinceISO: string) {
  const [now, setNow] = React.useState<Date>(() => new Date())
  React.useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  const since = new Date(sinceISO)
  const diff = Math.max(0, Math.floor((now.getTime() - since.getTime()) / 1000))
  const h = Math.floor(diff / 3600)
  const m = Math.floor((diff % 3600) / 60)
  const s = diff % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(h)}:${pad(m)}:${pad(s)}`
}
