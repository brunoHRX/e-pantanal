'use client'

import { Suspense, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { useRouter, useSearchParams } from 'next/navigation'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from '@/components/ui/card'
import { cn } from '@/lib/utils'

// Carregamento sob demanda de cada “página” de aba
const ProcedimentosTab = dynamic(() => import('./tabs/ProcedimentosTab'), {
  ssr: false
})
const EspecialidadesTab = dynamic(() => import('./tabs/EspecialidadesTab'), {
  ssr: false
})
const FilasTab = dynamic(() => import('./tabs/FilasTab'), {
  ssr: false
})
const ConsultoriosTab = dynamic(() => import('./tabs/ConsultoriosTab'), {
  ssr: false
})
const ExamesTab = dynamic(() => import('./tabs/ExamesTab'), {
  ssr: false
})
const MedicamentosTab = dynamic(() => import('./tabs/MedicamentosTab'), {
  ssr: false
})
const UsuariosTab = dynamic(() => import('./tabs/UsuariosTab'), {
  ssr: false
})

const tabs = [
  { id: 'procedimentos', label: 'Procedimentos' },
  { id: 'especialidades', label: 'Especialidades' },
  { id: 'filas', label: 'Filas' },
  { id: 'exames', label: 'Exames' },
  { id: 'medicamentos', label: 'Medicamentos' },
  { id: 'usuarios', label: 'Usuários' },
]

export default function ConfiguracoesPage() {
  const router = useRouter()
  const sp = useSearchParams()
  const current = sp.get('tab') ?? 'procedimentos'

  function onTabChange(value: string) {
    const params = new URLSearchParams(sp.toString())
    params.set('tab', value)
    router.replace(`/configuracoes?${params.toString()}`)
  }

  // Mapeia o tab atual para o componente correspondente
  const CurrentTabPage = useMemo(() => {
    switch (current) {
      case 'procedimentos':
        return ProcedimentosTab
      case 'especialidades':
        return EspecialidadesTab
      case 'filas':
        return FilasTab
      case 'consultorios':
        return ConsultoriosTab
      case 'exames':
        return ExamesTab
      case 'medicamentos':
        return MedicamentosTab
      case 'usuarios':
        return UsuariosTab
      default:
        return ProcedimentosTab
    }
  }, [current])

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie preferências e cadastros do sistema.
        </p>
      </div>

      <Tabs value={current} onValueChange={onTabChange} className="w-full">
        {/* Caixa/trilho das abas */}
        <TabsList
          className="
      w-full grid grid-cols-2 md:grid-cols-6
      p-0  /* sem padding pra não desalinha */
      rounded-md border border-border bg-muted  /* segue paleta do sistema */
      items-stretch  /* todas mesmas alturas */
    "
        >
          {tabs.map((t, i) => (
            <TabsTrigger
              key={t.id}
              value={t.id}
              className="
          relative
          rounded-xs           /* sem cantos arredondados individuais */
          h-10 leading-none      /* altura fixa alinha o preenchimento */
          px-3
          text-sm font-medium
          border-l border-border first:border-l-0  /* divisórias sem 'dente' */
          transition-colors

          /* inativa */
          text-muted-foreground

          /* hover da inativa (usa accent p/ manter paleta) */
          hover:bg-accent hover:text-accent-foreground

          /* ativa */
          data-[state=active]:bg-dark_moss_green-100
          data-[state=active]:text-amber-50

          /* borda superior/inferior reforçadas na ativa p/ parecer 'pressionado' */
          data-[state=active]:shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]
        "
            >
              {t.label}
              <span className="pointer-events-none absolute left-0 right-0 bottom-0 h-[2px] bg-primary data-[state=inactive]:hidden" />
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* 🔽 Aqui renderizamos a “página” da aba ativa */}
      <Suspense fallback={<CardsSkeleton />}>
        <CurrentTabPage />
      </Suspense>
    </div>
  )
}

function CardsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className={cn('h-32 animate-pulse')}>
          <CardHeader>
            <CardTitle className="h-4 w-1/2 bg-muted rounded" />
            <CardDescription className="h-3 w-2/3 bg-muted rounded mt-2" />
          </CardHeader>
          <CardContent>
            <div className="h-3 w-1/3 bg-muted rounded" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
