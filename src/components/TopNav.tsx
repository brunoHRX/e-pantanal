// components/TopNav.tsx
"use client";

import { User, Menu } from "lucide-react";
import Link from "next/link";

interface TopNavProps {
  onMenuClick: () => void;
}

export default function TopNav({ onMenuClick }: TopNavProps) {
  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-6">
      {/* Botão de menu, só visível em mobile (md:hidden) */}
      <button
        className="md:hidden p-2 rounded hover:bg-gray-100"
        onClick={onMenuClick}
      >
        <Menu className="w-6 h-6 text-gray-700" />
      </button>

      {/* Espaço flexível para empurrar o resto para a direita */}
      <div className="flex-1" />

      {/* Área do usuário */}
      <div className="flex items-center space-x-4">
        <User className="h-5 w-5 text-gray-600" />
        <span className="text-gray-800">Olá, Usuário</span>
        <Link href="/login" className="text-sm text-red-500 hover:underline">
          Sair
        </Link>
      </div>
    </header>
  );
}
