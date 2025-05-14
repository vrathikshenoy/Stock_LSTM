"use client"

import { Construction } from "lucide-react"
import AppLayout from "@/components/AppLayout"

export default function PortfolioPage() {
  return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center h-[calc(100vh-300px)]">
        <Construction className="h-16 w-16 text-purple-600 mb-4" />
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Portfolio Coming Soon</h1>
        <p className="text-gray-600 text-center max-w-md">
          We're working on building a powerful portfolio tracking feature. Check back soon!
        </p>
      </div>
    </AppLayout>
  )
}
