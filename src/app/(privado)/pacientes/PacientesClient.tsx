'use client'

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition
} from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PatientCard } from './components/PatientCard'
import { SearchIcon, SquarePlus, X } from 'lucide-react'
import { getAllPatients, Patient } from '@/services/patientService'

function stripDiacritics(s: string) {
  return s.normalize('NFD').replace(/\p{Diacritic}/gu, '')
}

export default function PacientesClient() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [query, setQuery] = useState<string>(searchParams.get('q') ?? '')
  const [results, setResults] = useState<Patient[]>([])
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  function newRegistration() {
    router.push('/pacientes/novoPaciente')
  }
  function handleUpdate(id: number) {
    router.push(`/pacientes/novoPaciente?id=${id}`)
  }

  async function runSearch(q: string) {
    setError(null)
    try {
      const dados = await getAllPatients()
      const qNorm = stripDiacritics(q.toLowerCase().trim())
      const filtrados = qNorm
        ? dados.filter(
            p =>
              stripDiacritics((p.nome ?? '').toLowerCase()).includes(qNorm) ||
              String(p.id ?? '').includes(qNorm)
          )
        : dados

      setResults(
        filtrados.map(p => ({
          ...p,
          fazendaReferencia: p.fazendaReferencia ?? ''
        }))
      )
    } catch (err) {
      setError((err as Error).message)
      setResults([])
    } finally {
      setSearched(true)
    }
  }

  function handleSearchClick() {
    startTransition(() => {
      const sp = new URLSearchParams(Array.from(searchParams.entries()))
      if (query) sp.set('q', query)
      else sp.delete('q')
      router.replace(`?${sp.toString()}`)
    })
    runSearch(query)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSearchClick()
    }
  }

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      startTransition(() => {
        const sp = new URLSearchParams(Array.from(searchParams.entries()))
        if (query) sp.set('q', query)
        else sp.delete('q')
        router.replace(`?${sp.toString()}`)
      })
      runSearch(query)
    }, 300)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  useEffect(() => {
    runSearch(searchParams.get('q') ?? '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loading = isPending

  const headerRight = useMemo(
    () =>
      results.length > 0 ? (
        <span className="text-sm text-muted-foreground">
          {results.length} resultado(s)
        </span>
      ) : null,
    [results.length]
  )

  function clearQuery() {
    setQuery('')
  }

  return (
    <div className="p-6 overflow-y-auto">
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-bold">
            Painel de Pacientes
          </CardTitle>
          {headerRight}
        </CardHeader>

        <CardContent className="flex flex-col gap-2 md:flex-row">
          <div className="relative flex-1">
            <Input
              placeholder="Pesquise por nome ou ID do prontuário"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pr-10"
              aria-label="Campo de busca de pacientes"
            />
            {query && (
              <button
                aria-label="Limpar busca"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-muted"
                onClick={clearQuery}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <Button onClick={handleSearchClick} className="flex items-center">
            <SearchIcon className="mr-1 h-4 w-4" />
            Buscar
          </Button>

          <Button
            onClick={newRegistration}
            className="flex items-center bg-pakistan_green-600"
          >
            <SquarePlus className="mr-1 h-4 w-4" />
            Novo Cadastro
          </Button>
        </CardContent>
      </Card>

      {error && (
        <p className="mb-4 text-center text-sm text-destructive">
          Erro: {error}
        </p>
      )}

      {!searched && (
        <div className="grid gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      )}

      {searched && results.length === 0 && !loading && !error && (
        <p className="text-center text-sm text-muted-foreground">
          Nenhum paciente encontrado.
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
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
