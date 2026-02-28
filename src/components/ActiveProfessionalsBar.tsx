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
import { ProfissionaisAtivos } from '@/services/fluxoService'

type Props = {
  profissionais: ProfissionaisAtivos[]
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
  const atendendo = profissionais.filter(p => p.atendendo === true).length
  const ociosos = total - atendendo

  return (
    <div className={`w-full overflow-x-hidden ${className ?? ''}`}>
      <Collapsible open={open} onOpenChange={setOpen}>
        {/* Cabeçalho (empilha no mobile) */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between min-w-0">
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
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 self-start sm:self-auto"
            >
              {open ? 'Ocultar' : 'Exibir'}
              <ChevronsUpDown className="h-4 w-4" />
            </Button>
          </CollapsibleTrigger>
        </div>

        {/* Conteúdo (lista) */}
        <CollapsibleContent className="mt-2 overflow-x-hidden">
          {profissionais.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              Nenhum profissional ativo no momento.
            </div>
          ) : (
            <ul className="w-full box-border overflow-x-hidden divide-y rounded border">
              {profissionais.map(p => (
                <ProfessionalRow key={p.usuario_id} prof={p} />
              ))}
            </ul>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}

/* === Item da lista (1 profissional por linha, responsivo e à prova de overflow) === */
function ProfessionalRow({ prof }: { prof: ProfissionaisAtivos }) {
  const elapsed = useElapsed(prof.ultimo_atendimento ?? null);
  const isAtendendo = !!prof.atendendo
  const nomeProf = prof?.usuario?.nome ?? 'Profissional'
  const nomeEsp = prof?.usuario?.especialidade?.nome ?? 'Especialidade'
  const nomePac = prof?.paciente?.nome

  return (
    <li className="w-full box-border p-3 sm:p-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between overflow-x-hidden">
      {/* Esquerda: nome + especialidade + paciente */}
      <div className="min-w-0 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
        <span className="font-medium truncate max-w-[60vw] sm:max-w-[28rem]">
          {nomeProf}
        </span>
        <span className="text-muted-foreground truncate max-w-[50vw] sm:max-w-[18rem]">
          ({nomeEsp})
        </span>
        {isAtendendo && nomePac && (
          <span className="truncate max-w-[70vw] sm:max-w-[22rem]">
            Paciente: <b className="text-foreground">{nomePac}</b>
          </span>
        )}
      </div>

      {/* Direita: status + cronômetro */}
      <div className="flex items-center gap-2 self-start sm:self-auto">
        <StatusBadge status={isAtendendo} />
        <span className="text-xs tabular-nums text-muted-foreground">
          {elapsed}
        </span>
      </div>
    </li>
  )
}

/* === Badge de status === */
function StatusBadge({ status }: { status: boolean }) {
  const classes = status
    ? 'bg-emerald-600 text-white border-emerald-600'
    : 'bg-amber-100 text-amber-800 border-amber-200'
  const label = status ? 'Atendendo' : 'Ocioso'
  return (
    <Badge className={`h-5 px-2 text-[10px] sm:text-xs ${classes}`}>
      {label}
    </Badge>
  )
}

/** Cronômetro HH:MM:SS desde uma data ISO */
function useElapsed(sinceISO: string | null) {
  const [now, setNow] = React.useState<Date>(() => new Date());

  React.useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!sinceISO) return "-";

  const since = new Date(sinceISO);
  const diff = Math.max(
    0,
    Math.floor((now.getTime() - since.getTime()) / 1000)
  );

  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);
  const s = diff % 60;

  const pad = (n: number) => String(n).padStart(2, "0");

  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}
