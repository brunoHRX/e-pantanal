// components/OdontogramaQuadrante.tsx
'use client'

import React, { useState } from 'react'
import { nomesDentes } from '@/utils/odontograma'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

type OdontogramaQuadranteProps = {
  numeros: number[]
  titulo: string
  tamanho?: 'normal' | 'grande'
  outlineGroup?: boolean
}

export const OdontogramaQuadrante: React.FC<OdontogramaQuadranteProps> = ({
  numeros,
  titulo,
  tamanho = 'normal',
  outlineGroup = false
}) => {
  const [openDente, setOpenDente] = useState<number | null>(null)
  const [anotacoes, setAnotacoes] = useState<Record<number, string>>({})
  const [campoAnotacao, setCampoAnotacao] = useState('')

  const handleClickDente = (denteNum: number) => {
    setCampoAnotacao(anotacoes[denteNum] || '')
    setOpenDente(denteNum)
  }

  const handleSalvar = () => {
    if (openDente !== null) {
      setAnotacoes(old => ({ ...old, [openDente]: campoAnotacao }))
      setOpenDente(null)
    }
  }

  // Definindo tamanhos
  const denteSize = tamanho === 'grande' ? 'w-14 h-16' : 'w-10 h-12'
  const faceSize = tamanho === 'grande' ? 'w-10 h-10' : 'w-7 h-7'

  return (
    <div className="flex flex-col items-center my-2">
      {titulo && (
        <span className="font-semibold mb-2 text-slate-700">{titulo}</span>
      )}
      <div className="flex flex-row gap-4">
        {numeros.map(num => {
          const selecionado = !!anotacoes[num] || openDente === num
          return (
            <div key={num} className="flex flex-col items-center">
              <span className="text-xs mb-1">{num}</span>
              {/* Dente SVG */}
              <div>
                <button
                  type="button"
                  onClick={() => handleClickDente(num)}
                  className={`
                  group rounded-lg flex flex-col items-center focus:outline-none transition
                  ${
                    outlineGroup && selecionado
                      ? 'outline-2 outline-teal-500'
                      : 'outline-none'
                  }
                `}
                  style={{ minWidth: 52, padding: 2 }}
                >
                  <img
                    src={`/odontograma/dente_${num}.svg`}
                    alt={`Dente ${num}`}
                    className={`${denteSize} mx-auto z-10`}
                    draggable={false}
                  />
                  <div className="h-1" />
                  <img
                    src={`/odontograma/superior_dente.svg`}
                    alt="Faces do dente"
                    className={`${faceSize} mx-auto opacity-70`}
                    draggable={false}
                  />
                </button>
              </div>
              {/* Modal do dente */}
              <Dialog
                open={openDente === num}
                onOpenChange={() => setOpenDente(null)}
              >
                <DialogTrigger asChild>
                  <span />
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      Dente {num} - {nomesDentes[num] || 'Dente'}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="flex flex-col gap-2">
                    <img
                      src={`/odontograma/dente_${num}.svg`}
                      alt={`Dente ${num}`}
                      className="w-16 h-20 mx-auto"
                    />
                    <label htmlFor="anotacao" className="text-sm font-medium">
                      Anotações para o dente
                    </label>
                    <Textarea
                      id="anotacao"
                      value={campoAnotacao}
                      onChange={e => setCampoAnotacao(e.target.value)}
                      placeholder="Descreva observações, diagnósticos, etc..."
                      className="resize-none min-h-[80px]"
                    />
                  </div>
                  <DialogFooter>
                    <Button onClick={handleSalvar}>Salvar</Button>
                    <Button
                      variant="outline"
                      onClick={() => setOpenDente(null)}
                    >
                      Cancelar
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )
        })}
      </div>
    </div>
  )
}
