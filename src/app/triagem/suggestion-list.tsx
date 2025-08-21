'use client'

import { format, parseISO, isValid } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Patient } from '@/services/patientService'
import { cn } from '@/lib/utils'

function maskCPF(cpf?: string) {
  if (!cpf) return '—'
  const d = cpf.replace(/\D/g, '')
  if (d.length < 11) return cpf
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9, 11)}`
}
function safeDateLabel(iso?: string) {
  if (!iso) return '—'
  try {
    const dt = parseISO(iso)
    if (!isValid(dt)) return '—'
    return format(dt, 'dd/MM/yyyy', { locale: ptBR })
  } catch {
    return '—'
  }
}

export function SuggestionList({
  id,
  items,
  activeIndex,
  onHover,
  onSelect
}: {
  id?: string
  items: Patient[]
  activeIndex: number
  onHover: (i: number) => void
  onSelect: (p: Patient) => void
}) {
  return (
    <div
      id={id}
      role="listbox"
      className="absolute z-20 mt-1 max-h-80 w-full overflow-auto rounded-md border bg-popover shadow"
    >
      {items.map((p, i) => (
        <button
          key={p.id ?? i}
          role="option"
          aria-selected={i === activeIndex}
          className={cn(
            'w-full text-left p-3 border-b last:border-b-0',
            i === activeIndex ? 'bg-muted' : 'bg-popover'
          )}
          onMouseEnter={() => onHover(i)}
          onClick={() => onSelect(p)}
        >
          <div className="font-semibold leading-tight">
            {p.nome ?? 'Sem nome'}
          </div>
          <div className="mt-1 text-xs text-muted-foreground flex flex-wrap gap-x-4">
            <span>CPF {maskCPF(p.cpf)}</span>
            <span>Prontuário {p.id ?? '—'}</span>
          </div>
          <div className="mt-1 text-xs">
            <span className="font-medium">Nascimento</span>{' '}
            {safeDateLabel(p.dataNascimento)}
          </div>
          <div className="mt-0.5 text-xs">
            <span className="font-medium">Nome da mãe</span>{' '}
            {p.filiacao1 ?? '—'}
          </div>
        </button>
      ))}
    </div>
  )
}
