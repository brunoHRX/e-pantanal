'use client'

import { ReactNode, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { SidebarProvider, useSidebar } from '@/components/ui/sidebar'
import AppSidebar from './AppSidebar'
import TopNav from './TopNav'
import { data } from '@/lib/data'
import { ValidadeBearer } from '@/services/api'

interface ClientLayoutProps {
  children: ReactNode
}

/** Consome o contexto do Sidebar (shadcn) */
function LayoutWithSidebar({ children }: ClientLayoutProps) {
  const { toggleSidebar } = useSidebar()

  return (
    <div
      className={[
        // altura segura no mobile: 100dvh quando suportado
        'flex',
        'min-h-screen',
        'supports-[height:100dvh]:min-h-[100dvh]',
        // largura nunca maior que o viewport
        'w-full',
        // nunca deixar vazar scrollbar horizontal
        'overflow-x-hidden'
      ].join(' ')}
    >
      {/* Sidebar (controla offcanvas no mobile internamente) */}
      <div className="shrink-0">
        <AppSidebar navMain={data.navMain} />
      </div>

      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TopNav dispara o toggle no mobile */}
        <TopNav onMenuClick={toggleSidebar} />
        {/* 
          min-h-0 permite que este flex child calcule corretamente a altura restante
          overflow-y-auto para rolagem vertical do conteúdo
        */}
        <main className="flex-1 min-h-0 overflow-y-auto bg-[#f8f7f7]">
          {children}
        </main>
      </div>
    </div>
  )
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    async function checkToken() {
      const valido = await ValidadeBearer()
      if (!valido) {
        localStorage.removeItem('userData')
        router.push('/login')
      }
    }
    checkToken()
  }, [router])

  // Rota pública
  if (pathname === '/login/') {
    return <>{children}</>
  }

  // Rotas autenticadas com sidebar
  return (
    <SidebarProvider>
      <LayoutWithSidebar>{children}</LayoutWithSidebar>
    </SidebarProvider>
  )
}
