import { Suspense } from "react"
import NovaTriagemPage from "./NovaTriagemPage"

export default function Page() {
  // Loading padrão (spinner + texto).
  return (
    <Suspense>
      <NovaTriagemPage />
    </Suspense>
  )
}