'use client'
import { useState } from 'react'

export default function BotaoReceitaHTML() {
  const [loading, setLoading] = useState(false)

  const handle = async () => {
    setLoading(true)
    try {
      const payload = {
        paciente_nome: 'João da Silva',
        data_nascimento: '01/01/1990',
        data_hora: '03/10/2025 10:30',
        medico_nome: 'Dra. Maria Souza',
        crm: 'CRM-MS 12345',
        especialidade: 'Clínica Geral',
        medicacoes: [
          'Dipirona 500 mg — 1 comprimido de 8/8h por 3 dias',
          'Omeprazol 20 mg — 1 cápsula em jejum por 7 dias'
        ]
      }

      const res = await fetch('/documentos/receituario-html', {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' }
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error ?? 'Erro ao gerar PDF')
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `receituario_${Date.now()}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e: any) {
      alert(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handle}
      disabled={loading}
      className="px-3 py-2 rounded-md bg-emerald-600 text-white"
    >
      {loading ? 'Gerando...' : 'Gerar PDF (HTML → PDF)'}
    </button>
  )
}
