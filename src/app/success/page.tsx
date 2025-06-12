import { Suspense } from 'react'
import SuccessClient from './success-client'

export default function SuccessPage() {
  return (
    <Suspense fallback={<p className="text-center mt-10">Loading...</p>}>
      <SuccessClient />
    </Suspense>
  )
}
