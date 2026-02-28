import { Suspense } from "react"
import ConvencionalPage from "./ConvencionalPage"

export default function Page() {
  // Loading padrão (spinner + texto).
  return (
    <Suspense>
      <ConvencionalPage />
    </Suspense>
  )
}