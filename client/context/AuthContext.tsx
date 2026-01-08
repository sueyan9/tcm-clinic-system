'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '@/lib/api'

interface User {
    id: string
    email: string
    firstName: string
    lastName: string
    role: 'admin' | 'doctor'
}

interface AuthContextType {
    user: User | null
    loading: boolean
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
    logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // check if the token been saved
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
        if (token) {
            fetchUser()
        } else {
            setLoading(false)
        }
    }, [])

    const fetchUser = async () => {
        try {
            const response = await api.get('/api/auth/me')
            setUser(response.data.user)
        } catch (error) {
            // Token undefined ，clear
            if (typeof window !== 'undefined') {
                localStorage.removeItem('token')
            }
            setUser(null)
        } finally {
            setLoading(false)
        }
    }

    const login = async (email: string, password: string) => {
        try {
            const response = await api.post('/api/auth/login', { email, password })
            const { token, user } = response.data

            // save token
            if (typeof window !== 'undefined') {
                localStorage.setItem('token', token)
            }

            setUser(user)
            return { success: true }
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.error || 'Login failed',
            }
        }
    }

    const logout = () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token')
        }
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

