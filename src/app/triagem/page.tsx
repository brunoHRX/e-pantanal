'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SearchIcon, X } from 'lucide-react'
import { getAllPatients, Patient } from '@/services/patientService'
import { SelectedPatientCard } from './selected-patient-card'
import { SuggestionList } from './suggestion-list'
import { useRouter } from 'next/navigation'

function stripDiacritics(s: string) {
  return s.normalize('NFD').replace(/\p{Diacritic}/gu, '')
}

export default function SelecionarPacienteTriagemPage() {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Patient[]>([])
  const [all, setAll] = useState<Patient[]>([])
  const [selected, setSelected] = useState<Patient | null>(null)
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState<number>(-1)
  const [loading, startTransition] = useTransition()
  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const boxRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    startTransition(async () => {
      const dados = await getAllPatients()
      setAll(dados)
    })
  }, [])

  const runFilter = (q: string) => {
    const qNorm = stripDiacritics(q.trim().toLowerCase())
    if (!qNorm) {
      setSuggestions([])
      setOpen(false)
      setActiveIndex(-1)
      return
    }
    const isCpfLike = /\d{3,}/.test(qNorm.replace(/\D/g, ''))
    const filtered = all.filter(p => {
      const nome = stripDiacritics((p.nome ?? '').toLowerCase())
      const cpf = p.cpf ?? ''
      const id = String(p.id ?? '')
      if (nome.includes(qNorm)) return true
      if (
        isCpfLike &&
        cpf.replace(/\D/g, '').includes(qNorm.replace(/\D/g, ''))
      )
        return true
      if (id.includes(qNorm)) return true
      return false
    })
    setSuggestions(filtered.slice(0, 20))
    setOpen(true)
    setActiveIndex(filtered.length ? 0 : -1)
  }

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => runFilter(query), 250)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node))
        setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleSelect(p: Patient) {
    setSelected({ ...p, fazendaReferencia: p.fazendaReferencia ?? '' })
    setOpen(false)
    setActiveIndex(-1)
  }

  function clearSelection() {
    setSelected(null)
    setQuery('')
    setSuggestions([])
    setOpen(false)
    setActiveIndex(-1)
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || suggestions.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex(i => (i + 1) % suggestions.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex(i => (i - 1 + suggestions.length) % suggestions.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (activeIndex >= 0) handleSelect(suggestions[activeIndex])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div className="p-6">
      <Card ref={boxRef} className="mb-4 relative">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-bold">
            Selecionar Paciente para Triagem
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col gap-2">
          {/* TOOLBAR INLINE */}
          <div className="relative flex items-center gap-2">
            <div className="relative flex-1">
              <Input
                placeholder="Digite nome do cidadão, CPF ou prontuário"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onFocus={() => query && setOpen(true)}
                onKeyDown={onKeyDown}
                className="pr-10"
                aria-expanded={open}
                aria-controls="suggestion-list"
                aria-autocomplete="list"
              />
              {query && (
                <button
                  aria-label="Limpar busca"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-muted"
                  onClick={() => setQuery('')}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              {/* dropdown */}
              {open && suggestions.length > 0 && (
                <SuggestionList
                  id="suggestion-list"
                  items={suggestions}
                  activeIndex={activeIndex}
                  onHover={setActiveIndex}
                  onSelect={handleSelect}
                />
              )}
              {open && suggestions.length === 0 && query && (
                <div className="absolute z-20 mt-1 w-full rounded-md border bg-popover p-3 text-sm text-muted-foreground shadow">
                  Nenhum paciente encontrado.
                </div>
              )}
            </div>

            {/* Botões ao lado do input */}
            <Button
              onClick={() => runFilter(query)}
              disabled={loading}
              size="sm"
              className="shrink-0"
            >
              <SearchIcon className="mr-1 h-4 w-4" />
              Buscar
            </Button>
            {selected && (
              <Button
                variant="outline"
                onClick={clearSelection}
                size="sm"
                className="shrink-0"
              >
                Limpar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* CARD COMPACTO */}
      {selected ? (
        <SelectedPatientCard
          paciente={selected}
          onClear={clearSelection}
          onTriagem={() => router.push(`/triagem/nova?id=${selected.id}`)} // NÃO ligar agora
        />
      ) : (
        <p className="text-sm text-muted-foreground">
          Selecione um paciente acima para iniciar a triagem.
        </p>
      )}
    </div>
  )
}
