import React, { Suspense } from "react";
import SearchClient from "./SearchClient";

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="text-center p-4">Loading search results...</div>}>
      <SearchClient />
    </Suspense>
  );
}
