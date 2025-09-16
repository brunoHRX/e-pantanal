'use client'

import { Badge } from '@/components/ui/badge'

export function QueueLegend() {
  return (
    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-2">
      <div className="flex items-center gap-1">
        <Badge className="bg-black text-white border-black h-4 px-2">
          Ativo
        </Badge>
        <span>Especialidade atual</span>
      </div>
      <div className="flex items-center gap-1">
        <Badge className="border border-zinc-500 text-zinc-700 bg-transparent h-4 px-2">
          Pendente
        </Badge>
        <span>Aguardando atendimento</span>
      </div>
      <div className="flex items-center gap-1">
        <Badge className="border border-green-800 text-green-800 bg-green-100 h-4 px-2">
          Atendendo
        </Badge>
        <span>Em atendimento</span>
      </div>
      <div className="flex items-center gap-1">
        <Badge className="bg-zinc-100 text-zinc-500 border-zinc-200 opacity-70 h-4 px-2">
          Expirado
        </Badge>
        <span>Já atendido</span>
      </div>
    </div>
  )
}
