"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "./AppSidebar";
import TopNav from "./TopNav";
import { data } from "@/lib/patient-data";

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();

  // se estivermos na /login, só renderiza a página normalmente
  if (pathname === "/login") {
    return <>{children}</>;
  }

  // para todas as outras rotas, renderiza sidebar + topnav
  return (
    <SidebarProvider>
      <div className="flex h-screen w-screen">
        {/* Lado esquerdo: sidebar */}
        <AppSidebar navMain={data.navMain} />

        {/* Lado direito: conteúdo */}
        <div className="flex-1 flex flex-col">
          <TopNav />
          <main className="flex-1 overflow-auto bg-gray-50">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
