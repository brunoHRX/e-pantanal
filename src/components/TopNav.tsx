// components/TopNav.tsx
"use client";

import { User } from "lucide-react";
import Link from "next/link";

export default function TopNav() {
  return (
    <header className="h-16 bg-white border-b flex items-center justify-end px-6">
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
