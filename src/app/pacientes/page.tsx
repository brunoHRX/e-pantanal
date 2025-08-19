'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PatientCard } from './components/PatientCard'
import { SearchIcon, SquarePlus } from 'lucide-react'

import { getAllPatients, Patient } from '@/services/patientService'

export default function PacientesPage() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Patient[]>([])
  const [searched, setSearched] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function newRegistration() {
    router.push('/pacientes/novoPaciente')
  }

  function handleUpdate(id: number) {
    router.push(`/pacientes/novoPaciente?id=${id}`)
  }

  async function handleSearch() {
    setLoading(true)
    setError(null)

    try {
      const dados = await getAllPatients() // converte p/ tipo com extras
      const filtrados = dados.filter(p =>
        p.nome.toLowerCase().includes(query.toLowerCase())
      )
      console.log(filtrados);
      
      setResults(filtrados)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSearched(true)
      setLoading(false)
    }
  }

  return (
    <div className="p-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl font-bold mb-4">
            Painel de Pacientes
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-2">
          <Input
            placeholder="Pesquise por nome ou prontuário"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="flex-1"
          />
          <Button
            onClick={handleSearch}
            disabled={loading}
            className="flex items-center py-2 px-4"
          >
            <SearchIcon className="mr-1 h-4 w-4" />{' '}
            {loading ? 'Buscando…' : 'Buscar'}
          </Button>
          <Button
            onClick={newRegistration}
            className="flex items-center bg-pakistan_green-600"
          >
            <SquarePlus className="mr-1 h-4 w-4" /> Novo Cadastro
          </Button>
        </CardContent>
      </Card>

      {error && (
        <p className="text-center text-sm text-destructive">Erro: {error}</p>
      )}

      {searched && !loading && results.length === 0 && (
        <p className="text-center text-sm text-muted-foreground">
          Nenhum paciente encontrado.
        </p>
      )}

      <div className="grid gap-4">
        {results.map(paciente => (
          <PatientCard
            key={paciente.id}
            paciente={{
              ...paciente,
              fazendaReferencia: paciente.fazendaReferencia ?? ''
            }}
            onUpdate={handleUpdate}
          />
        ))}
      </div>
    </div>
  )
}
