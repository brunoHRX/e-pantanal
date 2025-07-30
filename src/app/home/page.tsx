'use client'

import Link from 'next/link'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ClipboardList, UserPlus, Meh } from 'lucide-react'

export default function HomePage() {
  const shortcuts = [
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
      icon: <Meh className="h-10 w-10 text-blue-600" />,
      href: '/atendimentos/novo/odontologia'
    },
    {
      id: 3,
      title: 'Novo Paciente',
      description: 'Cadastrar um novo paciente no sistema.',
      icon: <UserPlus className="h-10 w-10 text-green-600" />,
      href: '/pacientes/novoPaciente'
    }
  ]

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Painel Principal</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {shortcuts.map(item => (
          <Link key={item.id} href={item.href} className="group">
            <Card
              className="transition-all hover:scale-[1.03] hover:shadow-lg focus-within:ring-2 focus-within:ring-teal-400 cursor-pointer h-full"
              tabIndex={0}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  {item.icon}
                  <div>
                    <CardTitle className="mb-1 group-hover:text-teal-700">
                      {item.title}
                    </CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              {/* Pode adicionar um botão de ação se quiser, mas o card inteiro já é clicável */}
              {/* <CardContent>
                <Button asChild variant="outline" className="w-full">
                  <Link href={item.href}>Acessar</Link>
                </Button>
              </CardContent> */}
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
