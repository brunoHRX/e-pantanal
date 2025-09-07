'use client'

import React from 'react'
import { useEffect, useMemo, useRef, useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SearchIcon, SquarePlus, Trash2, X } from 'lucide-react'
import { stripDiacritics } from '@/utils/functions'
import { Procedimento, getAll, deleteElement, updateElement, createElement, getElementById } from '@/services/procedimentoService'
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from '@tanstack/react-table'
import { useForm } from 'react-hook-form'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

export default function Page() {
  const titulo = 'Painel de procedimentos';

  const router = useRouter()
  const searchParams = useSearchParams()

  const [query, setQuery] = useState<string>(searchParams.get('q') ?? '')
  const [results, setResults] = useState<Procedimento[]>([])
  const [resultById, setResultById] = useState<Procedimento>()
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const debounceRef = useRef<NodeJS.Timeout | null>(null)  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [updateMode, setUpdateMode] = useState(false)
  const loading = isPending
  function clearQuery() { setQuery('') }
  
  const form = useForm<Procedimento & { [key: string]: any }>({
    defaultValues: {
      id: 0,
      nome: '',
      especialidade_id: 0
    }
  })

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
      handleSearch(query)
    }, 300)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  useEffect(() => {
    handleSearch(searchParams.get('q') ?? '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleSearch(q: string) {
    setError(null)
    try {
      const dados = await getAll()
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
    handleSearch(query)
  }

  async function handleDelete(id: number) {
    setError(null)
    setSearched(false)
    try {
      await deleteElement(id);
    } catch (err) {
      setError((err as Error).message)
      setResults([])
    } finally {
      setSearched(true)
    }
  }

  async function handleUpdate(id: number) {
    setError(null)
    setSearched(false)
    setUpdateMode(true)
    try {
      const response = await getElementById(id);
      setResultById(response);
      form.reset({
        id: response.id,
        nome: response.nome,
        especialidade_id: response.especialidade_id
      })
    } catch (err) {
      setError((err as Error).message)
      setResults([])
    } finally {
      setIsModalOpen(true);
      setSearched(true)
    }
  }

  async function handleInsert() {    
    form.reset();
    setUpdateMode(false)
    setIsModalOpen(true);
  }

  async function onSubmit(data: Procedimento) {
    setSearched(false);
    try {
      if (data.id != 0) {
        await updateElement(data);
      } else {
        await createElement(data);
      }    
    } catch (err) {
        console.log(err);            
    } finally {
        handleSearchClick();
        form.reset();
        setSearched(true);
        setIsModalOpen(false);
    }
  }

  const colunas = React.useMemo<ColumnDef<Procedimento>[]>(
    () => [
      { accessorKey: "id", header: "ID" },
      { accessorKey: "nome", header: "Nome" },
      { accessorKey: "especialidade_id", header: "Especialidade" },
      {
        id: "actions",
        header: "Ações",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleUpdate(row.original.id)}
            >
              Editar
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleDelete(row.original.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ),
      },
    ],
    [router]
  )

  return (
    <div className="p-6">
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-bold">{titulo}</CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col gap-2 md:flex-row">
          <div className="relative flex-1">
            <Input
              placeholder="Pesquise por nome ou ID"
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
            onClick={handleInsert}
            className="flex items-center bg-pakistan_green-600"
          >
            <SquarePlus className="mr-1 h-4 w-4" />
            Novo registro
          </Button>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardContent className="flex flex-col md:flex-row">
          <div className="relative flex-1">
            <DataTable<Procedimento>
              columns={colunas}
              data={results}
              globalFilterAccessorKey={["nome", "id"]}
              searchPlaceholder="Pesquisar por nome ou código de barras"
              loading={loading}
            />
          </div>
        </CardContent>
      </Card>

      
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md overflow-x-auto overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-center">
              {updateMode == true ? "Editar procedimento: " + resultById?.id : "Novo procedimento"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col">
              {/* Nome */}
              <FormField
                control={form.control}
                name="nome"
                rules={{ required: "Nome é obrigatório" }}
                render={({ field }) => (
                  <FormItem className="col-span-6 md:col-span-3">
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="especialidade_id"
                rules={{ required: "Especialidade é obrigatório" }}
                render={({ field }) => (
                  <FormItem className="col-span-6 md:col-span-3">
                    <FormLabel>Especialidade</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" disabled={loading}>
                {loading ? "Salvando…" : "Salvar"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

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
          Nenhum registro encontrado.
        </p>
      )}
    </div>
  )
}
