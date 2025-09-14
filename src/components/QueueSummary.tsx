'use client'

import * as React from 'react'
import { Badge } from '@/components/ui/badge'
import type { AtendimentoFluxo } from '@/services/fluxoService'

type Props = {
  /** Lista já filtrada que você exibe na tela */
  items: AtendimentoFluxo[]
  /** Opcional: mostrar ou não o título “Resumo da Fila” */
  showTitle?: boolean
}

/**
 * Mostra:
 *  - Total de pacientes na fila (items.length)
 *  - Contagem por especialidade (somente filas com atendido == 0)
 * Cada paciente contribui no máximo 1x por especialidade.
 */
export function QueueSummary({ items, showTitle = false }: Props) {
  const totalPacientes = items.length

  // Mapa: espId -> { name, count }
  const counts = new Map<number, { name: string; count: number }>()

  for (const at of items) {
    if (!Array.isArray(at.filas)) continue

    // Evita contar o MESMO paciente 2x na MESMA especialidade (se houver duplicidade acidental)
    const seenEspForThisPatient = new Set<number>()

    for (const f of at.filas) {
      const espId = f?.fila?.especialidade_id
      const espNome = f?.fila?.especialidade?.nome
      const aguardando = f?.atendido === 0

      if (!aguardando || espId == null) continue
      if (seenEspForThisPatient.has(espId)) continue

      seenEspForThisPatient.add(espId)
      const prev = counts.get(espId)
      if (prev) {
        prev.count += 1
      } else {
        counts.set(espId, { name: espNome ?? 'Especialidade', count: 1 })
      }
    }
  }

  // Ordena: primeiro por maior contagem, depois por nome
  const list = Array.from(counts.entries())
    .map(([id, v]) => ({ id, ...v }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))

  return (
    <div className="space-y-2">
      {showTitle && <div className="text-sm font-medium">Resumo da fila</div>}

      <div className="text-sm">
        Total na fila:{' '}
        <span className="font-semibold text-foreground">{totalPacientes}</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {list.length === 0 ? (
          <span className="text-sm text-muted-foreground">
            Sem especialidades aguardando.
          </span>
        ) : (
          list.map(item => (
            <Badge
              key={item.id}
              variant="outline"
              className="whitespace-nowrap"
            >
              {item.name} ({item.count})
            </Badge>
          ))
        )}
      </div>
    </div>
  )
}
