import { Suspense } from "react"
import FormGerencialPage from "./FormGerencialPage"

export default function Page() {
  // Loading padrão (spinner + texto).
  return (
    <Suspense>
      <FormGerencialPage />
    </Suspense>
  )
}