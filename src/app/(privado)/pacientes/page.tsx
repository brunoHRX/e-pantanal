import { Suspense } from 'react'
import PacientesClient from './PacientesClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6">Carregando pacientes…</div>}>
      <PacientesClient />
    </Suspense>
  )
}
