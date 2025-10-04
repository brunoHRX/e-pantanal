'use client'

import React, { useMemo, useState } from 'react'
import { OdontogramaQuadrante } from './OdontogramaQuadrante'
import { Button } from '@/components/ui/button'
import { ToothSelection } from '@/services/atendimentoService'
import { Procedimento } from '@/types/Procedimento'

export type OdontogramaProps = {
  /** Estado controlado vindo do pai (mapa por número do dente) */
  value?: ToothSelection[]
  procedimentosOdontologicos: Procedimento[]
  /** Disparado quando o usuário salva alterações em um dente */
  onChange?: (next: ToothSelection) => void
  /** Tipo inicial apenas visual */
  defaultTipo?: 'permanente' | 'deciduos'
}

/**
 * Componente controlado:
 * - usa `value` como fonte da verdade
 * - chama `onChange` somente em handlers (nunca durante render)
 * - tamanhos RESPONSIVOS no próprio componente (sem causar scroll)
 */
export default function Odontograma({
  value = [],
  procedimentosOdontologicos = [],
  onChange,
  defaultTipo = 'permanente'
}: OdontogramaProps) {
  const [tipo, setTipo] = useState<'permanente' | 'deciduos'>(defaultTipo)

  const applyPartial = (partial: ToothSelection) => {
    onChange?.(partial)
  }

  const grupos = useMemo(() => {
    if (tipo === 'permanente') {
      return [
        { numeros: [18, 17, 16, 15, 14, 13, 12, 11], titulo: 'Sup. Direito' },
        { numeros: [21, 22, 23, 24, 25, 26, 27, 28], titulo: 'Sup. Esquerdo' },
        { numeros: [48, 47, 46, 45, 44, 43, 42, 41], titulo: 'Inf. Direito' },
        { numeros: [31, 32, 33, 34, 35, 36, 37, 38], titulo: 'Inf. Esquerdo' }
      ]
    }
    return [
      { numeros: [55, 54, 53, 52, 51], titulo: 'Sup. Direito Decíduo' },
      { numeros: [61, 62, 63, 64, 65], titulo: 'Sup. Esquerdo Decíduo' },
      { numeros: [85, 84, 83, 82, 81], titulo: 'Inf. Direito Decíduo' },
      { numeros: [71, 72, 73, 74, 75], titulo: 'Inf. Esquerdo Decíduo' }
    ]
  }, [tipo])

  return (
    <div className="w-full mt-2 flex flex-col items-center gap-4">
      {/* Alternância */}
      <div className="flex gap-2 mb-2">
        <Button
          type="button"
          variant={tipo === 'permanente' ? 'default' : 'outline'}
          onClick={() => setTipo('permanente')}
        >
          Permanente
        </Button>
        <Button
          type="button"
          variant={tipo === 'deciduos' ? 'default' : 'outline'}
          onClick={() => setTipo('deciduos')}
        >
          Decíduos
        </Button>
      </div>

      {/* Quadrantes em 2 linhas (responsivo) */}
      <div className="space-y-3 w-full">
        <div className="flex flex-row justify-center items-start gap-2 sm:gap-4 md:gap-6">
          <OdontogramaQuadrante
            numeros={grupos[0].numeros}
            titulo={grupos[0].titulo}
            tamanho="auto" // <= responsivo
            outlineGroup
            procedimentosOdonto={procedimentosOdontologicos}
            selections={value ?? {}}
            onChange={applyPartial}
          />
          <div className="hidden sm:block w-[1px] bg-gray-300 h-[90px] sm:h-[100px] md:h-[110px] rounded-full mx-1" />
          <OdontogramaQuadrante
            numeros={grupos[1].numeros}
            titulo={grupos[1].titulo}
            tamanho="auto"
            outlineGroup
            procedimentosOdonto={procedimentosOdontologicos}
            selections={value ?? {}}
            onChange={applyPartial}
          />
        </div>

        <div className="flex flex-row justify-center items-start gap-2 sm:gap-4 md:gap-6">
          <OdontogramaQuadrante
            numeros={grupos[2].numeros}
            titulo={grupos[2].titulo}
            tamanho="auto"
            outlineGroup
            procedimentosOdonto={procedimentosOdontologicos}
            selections={value ?? {}}
            onChange={applyPartial}
          />
          <div className="hidden sm:block w-[1px] bg-gray-300 h-[90px] sm:h-[100px] md:h-[110px] rounded-full mx-1" />
          <OdontogramaQuadrante
            numeros={grupos[3].numeros}
            titulo={grupos[3].titulo}
            tamanho="auto"
            outlineGroup
            procedimentosOdonto={procedimentosOdontologicos}
            selections={value ?? {}}
            onChange={applyPartial}
          />
        </div>
      </div>
    </div>
  )
}
