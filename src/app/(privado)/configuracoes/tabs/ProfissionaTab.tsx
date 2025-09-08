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

export default function ProfissionaisTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profissionais</CardTitle>
        <CardDescription>Vincule e configure a equipe.</CardDescription>
      </CardHeader>
      <CardContent>
        <Link href="/configuracoes/profissionais">
          <Button>Abrir CRUD</Button>
        </Link>
      </CardContent>
    </Card>
  )
}
