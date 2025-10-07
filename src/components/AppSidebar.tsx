// components/AppSidebar.tsx
'use client'

import { usePathname } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton
} from '@/components/ui/sidebar'
import { NavSection } from '@/lib/data'

import {
  Home,
  Users,
  Stethoscope,
  ClipboardList,
  History,
  Clock,
  Pill,
  Settings,
  FileText
} from 'lucide-react'
import { JSX } from 'react/jsx-runtime'

interface AppSidebarProps {
  navMain: NavSection[]
}

export default function AppSidebar({ navMain }: AppSidebarProps) {
  const path = usePathname()

  // mapeamento de título -> ícone
  const iconMap: Record<string, JSX.Element> = {
    Inicio: <Home className="w-5 h-5" />,
    Pacientes: <Users className="w-5 h-5" />,
    Triagem: <ClipboardList className="w-5 h-5" />,
    Atendimento: <Stethoscope className="w-5 h-5" />,
    Histórico: <History className="w-5 h-5" />,
    'Fila de Espera': <Clock className="w-5 h-5" />,
    Farmácia: <Pill className="w-5 h-5" />,
    Relatórios: <FileText className="w-5 h-5" />,
    Configurações: <Settings className="w-5 h-5" />
  }

  return (
    <Sidebar className="w-64">
      <SidebarHeader className="flex items-start justify-center py-6">
        <Image
          src="/images/e-pantanal-logo.png" // coloque sua logo aqui
          alt="Logo e-Pantanal"
          width={931}
          height={330}
          className="h-4/6 w-auto"
          priority
        />
      </SidebarHeader>

      <SidebarContent>
        {navMain.map(section => (
          <SidebarGroup key={section.title}>
            <SidebarMenu className="gap-2">
              {section.items.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton isActive={path.startsWith(item.url)}>
                    <Link
                      href={item.url}
                      className="flex items-center gap-3 w-full"
                    >
                      {iconMap[item.title] ?? <span className="w-5" />}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  )
}
