import "./globals.css";
// app/layout.tsx
import { ReactNode } from "react";
import ClientLayout from "@/components/ClientLayout";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}