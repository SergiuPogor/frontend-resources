// src/app/not-found.tsx

import Link from 'next/link'

import { FileSearch } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center px-4">
      {/* We use min-h-[calc(100vh-200px)] to roughly center the content
        in the available space below the header/filter bar.
      */}
      <FileSearch
        size={96}
        className="text-muted mb-6"
        strokeWidth={1}
      />
      <h1 className="text-7xl font-bold tracking-[-0.035em] mb-2">404</h1>
      <h2 className="text-2xl font-semibold mb-4">
        Page not found
      </h2>
      <p className="text-lg text-muted mb-8 max-w-md">
        This page doesn&apos;t exist. The resource list is one click away.
      </p>
      <Link
        href="/"
        className="bg-ink text-bg font-medium py-3 px-6 rounded-full hover:bg-ink/85 transition-colors"
      >
        Browse all resources
      </Link>
    </div>
  )
}

