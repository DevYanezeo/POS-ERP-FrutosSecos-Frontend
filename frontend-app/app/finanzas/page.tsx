"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function FinanzasPage() {
    const router = useRouter()
    useEffect(() => {
        const token = localStorage.getItem("token")
        if (!token) router.push('/login')
    }, [router])
    return (
        <main className="p-6">
            <h1 className="text-2xl font-bold">Finanzas</h1>
        </main>
    );

}