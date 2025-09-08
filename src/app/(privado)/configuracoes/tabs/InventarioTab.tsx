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

export default function InventarioTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Inventário</CardTitle>
        <CardDescription>Itens e insumos.</CardDescription>
      </CardHeader>
      <CardContent>
        <Link href="/configuracoes/inventario">
          <Button>Abrir módulo</Button>
        </Link>
      </CardContent>
    </Card>
  )
}
