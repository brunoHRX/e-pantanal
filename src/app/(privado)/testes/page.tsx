'use client'

import { useState } from 'react'

type LoadingKind = 'receita' | 'atestado' | null

export default function ReceituarioTestePage() {
  const [loading, setLoading] = useState<LoadingKind>(null)
  const [msg, setMsg] = useState<string | null>(null)

  async function generateAndDownload(
    endpoint: string,
    payload: any,
    prefix: string
  ) {
    setMsg(null)
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err?.error ?? `Erro ao gerar ${prefix}`)
    }

    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${prefix}_${Date.now()}.pdf`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleReceita = async () => {
    try {
      setLoading('receita')
      const payload = {
        paciente_nome: 'João da Silva',
        data_nascimento: '01/01/1990',
        data_hora: new Date().toLocaleString('pt-BR'),
        medico_nome: 'Dra. Maria Souza',
        crm: 'CRM-MS 12345',
        especialidade: 'Clínica Geral',
        medicacoes: [
          'Dipirona 500 mg — 1 comprimido a cada 8h por 3 dias',
          'Omeprazol 20 mg — 1 cápsula em jejum por 7 dias'
        ]
      }
      await generateAndDownload('/api/receituario-html', payload, 'receituario')
      setMsg('Receituário gerado com sucesso!')
    } catch (e: any) {
      setMsg(e?.message ?? 'Falha ao gerar Receituário')
    } finally {
      setLoading(null)
    }
  }

  const handleAtestado = async () => {
    try {
      setLoading('atestado')
      const payload = {
        paciente_nome: 'Maria Souza',
        data_atendimento: new Date().toLocaleDateString('pt-BR'), // dd/mm/aaaa
        dias_afastamento: '3',
        inicio_afastamento: new Date().toLocaleDateString('pt-BR'),
        diagnostico: 'Gripe viral',
        cid: 'J11',
        medico_nome: 'Dr. João Pedro',
        crm: 'CRM-MS 98765'
        // se quiser assinar/colocar logos via base64, o route já insere pelos arquivos do /public
      }
      await generateAndDownload('/api/atestado-html', payload, 'atestado')
      setMsg('Atestado gerado com sucesso!')
    } catch (e: any) {
      setMsg(e?.message ?? 'Falha ao gerar Atestado')
    } finally {
      setLoading(null)
    }
  }

  return (
    <main className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="w-full max-w-xl rounded-2xl border border-gray-200/60 bg-white/60 p-6 shadow-sm">
        <h1 className="text-2xl font-semibold mb-1">Testes de PDFs</h1>
        <p className="text-sm text-gray-500 mb-6">
          Clique em um botão para gerar o documento correspondente (HTML → PDF).
        </p>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleReceita}
            disabled={!!loading}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {loading === 'receita' ? 'Gerando...' : 'Gerar Receituário'}
          </button>

          <button
            type="button"
            onClick={handleAtestado}
            disabled={!!loading}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {loading === 'atestado' ? 'Gerando...' : 'Gerar Atestado'}
          </button>
        </div>

        {msg && (
          <div
            className={`mt-4 text-sm ${
              msg.toLowerCase().includes('sucesso')
                ? 'text-emerald-700'
                : 'text-red-600'
            }`}
          >
            {msg}
          </div>
        )}

        <div className="mt-6 text-xs text-gray-500">
          <p>
            Dica: ajuste os <code>payloads</code> nos handlers para refletir os
            dados reais do paciente/médico.
          </p>
        </div>
      </div>
    </main>
  )
}
