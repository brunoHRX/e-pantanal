// components/AppSidebar.tsx
"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { NavSection } from "@/lib/data";

interface AppSidebarProps {
  navMain: NavSection[];
}

export default function AppSidebar({ navMain }: AppSidebarProps) {
  const path = usePathname();

  return (
    <Sidebar className="w-64"> {/* ajuste largura conforme seu design */}
      <SidebarHeader>
        {/* por ex: <Logo /> */}
        <h1 className="text-xl font-bold px-4 mb-10">E-Pantanal</h1>
      </SidebarHeader>

      <SidebarContent>
        {navMain.map((section) => (
          <SidebarGroup key={section.title} >
            <SidebarMenu className="gap-2">
              {section.items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton isActive={path.startsWith(item.url)}>
                    <Link href={item.url} className="block w-full">
                      {item.title}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
