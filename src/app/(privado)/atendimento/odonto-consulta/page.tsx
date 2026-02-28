import { Suspense } from "react"
import OdontoConsultaPage from "./OdontoConsultaPage"

export default function Page() {
  // Loading padrão (spinner + texto).
  return (
    <Suspense>
      <OdontoConsultaPage />
    </Suspense>
  )
}