'use client'

import React, { useState } from 'react'
import { OdontogramaQuadrante } from './OdontogramaQuadrante'
import { Button } from '@/components/ui/button'

export default function Odontograma() {
  const [tipo, setTipo] = useState<'permanente' | 'deciduos'>('permanente')

  return (
    <div className="w-full flex flex-col items-center gap-4">
      {/* Botões de alternância */}
      <div className="flex gap-2 mb-4">
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

      {/* Renderização dos quadrantes/linhas */}
      {tipo === 'permanente' ? (
        <div className="space-y-4">
          {/* Superior */}
          <div className="flex flex-row justify-center gap-8 items-start">
            <OdontogramaQuadrante
              numeros={[18, 17, 16, 15, 14, 13, 12, 11]}
              titulo="Sup. Direito"
              tamanho="grande"
              outlineGroup
            />
            <div className="w-[2px] bg-gray-300 h-[110px] rounded-full mx-1" />
            <OdontogramaQuadrante
              numeros={[21, 22, 23, 24, 25, 26, 27, 28]}
              titulo="Sup. Esquerdo"
              tamanho="grande"
              outlineGroup
            />
          </div>
          {/* Inferior */}
          <div className="flex flex-row justify-center gap-8 items-start">
            <OdontogramaQuadrante
              numeros={[48, 47, 46, 45, 44, 43, 42, 41]}
              titulo="Inf. Direito"
              tamanho="grande"
              outlineGroup
            />
            <div className="w-[2px] bg-gray-300 h-[110px] rounded-full mx-1" />
            <OdontogramaQuadrante
              numeros={[31, 32, 33, 34, 35, 36, 37, 38]}
              titulo="Inf. Esquerdo"
              tamanho="grande"
              outlineGroup
            />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Decíduos linha 1 */}
          <div className="flex flex-row justify-center gap-8 items-start">
            <OdontogramaQuadrante
              numeros={[55, 54, 53, 52, 51]}
              titulo="Sup. Direito Decíduo"
              tamanho="grande"
              outlineGroup
            />
            <div className="w-[2px] bg-gray-300 h-[100px] rounded-full mx-1" />
            <OdontogramaQuadrante
              numeros={[61, 62, 63, 64, 65]}
              titulo="Sup. Esquerdo Decíduo"
              tamanho="grande"
              outlineGroup
            />
          </div>
          {/* Decíduos linha 2 */}
          <div className="flex flex-row justify-center gap-8 items-start">
            <OdontogramaQuadrante
              numeros={[85, 84, 83, 82, 81]}
              titulo="Inf. Direito Decíduo"
              tamanho="grande"
              outlineGroup
            />
            <div className="w-[2px] bg-gray-300 h-[100px] rounded-full mx-1" />
            <OdontogramaQuadrante
              numeros={[71, 72, 73, 74, 75]}
              titulo="Inf. Esquerdo Decíduo"
              tamanho="grande"
              outlineGroup
            />
          </div>
        </div>
      )}
    </div>
  )
}
