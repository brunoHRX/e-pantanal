import { Suspense } from "react"
import OdontoPage from "./OdontoPage"

export default function Page() {
  // Loading padrão (spinner + texto).
  return (
    <Suspense>
      <OdontoPage />
    </Suspense>
  )
}