import { Suspense } from "react"
import GerencialPage from "./GerencialPage"

export default function Page() {
  // Loading padrão (spinner + texto).
  return (
    <Suspense>
      <GerencialPage />
    </Suspense>
  )
}