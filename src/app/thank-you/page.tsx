import { Suspense } from 'react';
import ThankYou from './ThankYou';

export default function ThankYouPage() {
  return (
    <Suspense fallback={<div className="text-center p-10">Loading...</div>}>
      <ThankYou />
    </Suspense>
  );
}
