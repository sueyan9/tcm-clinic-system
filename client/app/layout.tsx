import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeRegistry } from "@/components/ThemeRegistry"
import { AuthProvider } from "@/context/AuthContext"
import { AppLayout } from "@/components/AppLayout"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
    title: "TCM Clinic Management System",
    description: "Traditional Chinese Medicine Clinic Management System for New Zealand",
}

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en">
        <body className={inter.className}>
        <ThemeRegistry>
            <AuthProvider>
                <AppLayout>{children}</AppLayout>
            </AuthProvider>
        </ThemeRegistry>
        </body>
        </html>
    )
}