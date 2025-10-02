'use client'

import React, { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue
} from '@/components/ui/select'
import { toast } from 'sonner'

export interface Especialidade {
  id: number
  nome: string
}

interface EncaminharModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  atendimentoId: number
  pacienteId: number
  especialidades: Especialidade[]
  onConfirm?: (payload: {
    atendimentoId: number
    pacienteId: number
    especialidadeId: number
    motivo: string | null
  }) => Promise<void> | void
}

export default function EncaminharModal({
  open,
  onOpenChange,
  atendimentoId,
  pacienteId,
  especialidades,
  onConfirm
}: EncaminharModalProps) {
  const [selectedId, setSelectedId] = useState<string>('')
  const [motivo, setMotivo] = useState<string>('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setSelectedId('')
      setMotivo('')
    }
  }, [open])

  const handleConfirm = async () => {
    if (!selectedId) {
      toast.warning('Selecione a especialidade.')
      return
    }
    try {
      setLoading(true)
      const payload = {
        atendimentoId,
        pacienteId,
        especialidadeId: Number(selectedId),
        motivo: motivo.trim() || null
      }
      if (onConfirm) {
        await onConfirm(payload)
      } else {
        // fallback mock
        await new Promise(r => setTimeout(r, 500))
        toast.success('Encaminhamento enviado (mock).')
      }
      onOpenChange(false)
    } catch (e: any) {
      toast.error(e?.message ?? 'Erro ao encaminhar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Encaminhar paciente</DialogTitle>
          <DialogDescription>
            Selecione a especialidade de destino e informe o motivo (opcional).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="mb-2 block">Especialidade</Label>
            <Select value={selectedId} onValueChange={setSelectedId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a especialidade" />
              </SelectTrigger>
              <SelectContent>
                {especialidades.map(e => (
                  <SelectItem key={e.id} value={String(e.id)}>
                    {e.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-2 block">Motivo (opcional)</Label>
            <Textarea
              placeholder="Ex.: necessidade de avaliação especializada"
              value={motivo}
              onChange={e => setMotivo(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="mt-2">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </DialogClose>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={!selectedId || loading}
          >
            {loading ? 'Enviando...' : 'Encaminhar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
