'use client'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from '@/components/ui/card'

export default function PermissoesTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Permissões</CardTitle>
        <CardDescription>Papéis e políticas de acesso.</CardDescription>
      </CardHeader>
      <CardContent>{/* seu conteúdo aqui */}</CardContent>
    </Card>
  )
}
