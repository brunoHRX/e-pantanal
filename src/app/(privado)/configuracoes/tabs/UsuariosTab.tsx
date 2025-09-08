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

export default function UsuariosTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Usuários</CardTitle>
        <CardDescription>Controle de acesso do sistema.</CardDescription>
      </CardHeader>
      <CardContent>
        <Link href="/configuracoes/usuarios">
          <Button>Abrir CRUD</Button>
        </Link>
      </CardContent>
    </Card>
  )
}
