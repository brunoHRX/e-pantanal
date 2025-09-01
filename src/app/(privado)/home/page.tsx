'use client'

import Link from 'next/link'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card'
import { cn } from '@/lib/utils'
import {
  ClipboardList,
  ClipboardPlus,
  ListChecks,
  Stethoscope,
  Smile,
  UserPlus,
  Users,
  Activity,
  History,
  Pill,
  Boxes,
  FileText,
  Settings
} from 'lucide-react'

type Shortcut = {
  id: string | number
  title: string
  description: string
  href: string
  icon: React.ReactNode
}

type Section = {
  id: string
  title: string
  items: Shortcut[]
}

function CardLink({ item }: { item: Shortcut }) {
  return (
    <Link href={item.href} className="group block focus:outline-none">
      <Card
        tabIndex={0}
        className={cn(
          'h-full cursor-pointer transition-all',
          'hover:shadow-lg hover:scale-[1.02]',
          'focus-visible:ring-2 focus-visible:ring-teal-500'
        )}
      >
        <CardHeader>
          <div className="flex items-start gap-3">
            <div className="shrink-0 mt-0.5">{item.icon}</div>
            <div>
              <CardTitle className="mb-1 leading-tight group-hover:text-teal-700">
                {item.title}
              </CardTitle>
              <CardDescription className="text-sm">
                {item.description}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>
    </Link>
  )
}

export default function HomePage() {
  // Seções organizadas por contexto
  const sections: Section[] = [
    {
      id: 'inicio',
      title: 'Início rápido',
      items: [
        {
          id: 1,
          title: 'Nova Triagem',
          description: 'Registrar ficha de triagem inicial do paciente.',
          icon: <ClipboardList className="h-10 w-10 text-teal-600" />,
          href: '/triagem/novo'
        },
        {
          id: 2,
          title: 'Atendimento Odontológico',
          description: 'Preencher ficha odontológica e acessar odontograma.',
          icon: <Smile className="h-10 w-10 text-blue-600" />,
          href: '/atendimentos/novo/odontologia'
        },
        {
          id: 3,
          title: 'Atendimento Convencional',
          description: 'Procedimentos médicos, CIDs e evolução clínica.',
          icon: <Stethoscope className="h-10 w-10 text-indigo-600" />,
          href: '/atendimentos/novo/clinico'
        },
        {
          id: 4,
          title: 'Novo Paciente',
          description: 'Cadastrar um novo paciente no sistema.',
          icon: <UserPlus className="h-10 w-10 text-green-600" />,
          // Mantendo o path que você já usa
          href: '/pacientes/novoPaciente'
        }
      ]
    },
    {
      id: 'fluxo',
      title: 'Fluxo de atendimento',
      items: [
        {
          id: 5,
          title: 'Fila de Espera',
          description: 'Gerencie a fila em tempo real com filtros.',
          icon: <Activity className="h-10 w-10 text-orange-600" />,
          href: '/fila-espera'
        },
        {
          id: 6,
          title: 'Triagens',
          description: 'Listagem e gestão de triagens realizadas.',
          icon: <ListChecks className="h-10 w-10 text-amber-700" />,
          href: '/triagem'
        },
        {
          id: 7,
          title: 'Atendimentos',
          description: 'Acompanhe atendimentos em andamento e finalizados.',
          icon: <ClipboardPlus className="h-10 w-10 text-cyan-700" />,
          href: '/atendimentos'
        }
      ]
    },
    {
      id: 'pacientes',
      title: 'Pacientes',
      items: [
        {
          id: 8,
          title: 'Painel de Pacientes',
          description: 'Pesquisar, filtrar e visualizar pacientes.',
          icon: <Users className="h-10 w-10 text-sky-700" />,
          href: '/pacientes'
        },
        {
          id: 9,
          title: 'Histórico Clínico',
          description: 'Consultar evoluções, prescrições e registros.',
          icon: <History className="h-10 w-10 text-slate-600" />,
          href: '/historico'
        }
      ]
    },
    {
      id: 'farmacia',
      title: 'Farmácia & Materiais',
      items: [
        {
          id: 10,
          title: 'Farmácia',
          description: 'Dispensa, protocolos e controle de receitas.',
          icon: <Pill className="h-10 w-10 text-rose-700" />,
          href: '/farmacia'
        },
        {
          id: 11,
          title: 'Estoque (Materiais)',
          description: 'Entrada/saída e níveis de estoque.',
          icon: <Boxes className="h-10 w-10 text-emerald-700" />,
          // ajuste se você usar rota diferente (ex.: /farmacia/estoque)
          href: '/estoque'
        }
      ]
    },
    {
      id: 'admin',
      title: 'Administração',
      items: [
        {
          id: 12,
          title: 'Relatórios',
          description: 'Indicadores operacionais e de qualidade.',
          icon: <FileText className="h-10 w-10 text-purple-700" />,
          // coloque o path real do seu módulo de relatórios, se houver
          href: '/relatorios'
        },
        {
          id: 13,
          title: 'Configurações',
          description: 'Especialidades, permissões e preferências.',
          icon: <Settings className="h-10 w-10 text-gray-700" />,
          href: '/configuracoes'
        }
      ]
    }
  ]

  return (
    <div className="p-6 space-y-10">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Painel Principal</h1>
        <p className="text-sm text-muted-foreground">
          Acesso rápido aos módulos e às últimas melhorias do sistema.
        </p>
      </header>

      {sections.map(section => (
        <section key={section.id} className="space-y-4">
          <h2 className="text-xl font-semibold">{section.title}</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {section.items.map(item => (
              <CardLink key={item.id} item={item} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
