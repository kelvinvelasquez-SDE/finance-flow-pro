import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import Layout from '@/components/Layout'
import AuthPage from '@/pages/Auth'
import Dashboard from '@/pages/Dashboard'
import Cards from '@/pages/Cards'

// Placeholders for other pages
const Loans = () => <div className="text-2xl font-bold">Loans Management</div>
const Business = () => <div className="text-2xl font-bold">Business & Granos</div>
const Analysis = () => <div className="text-2xl font-bold">Data Analysis</div>

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth()
    if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>
    if (!user) return <Navigate to="/auth" />
    return children
}

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/auth" element={<AuthPage />} />
                    <Route path="/" element={
                        <ProtectedRoute>
                            <Layout />
                        </ProtectedRoute>
                    }>
                        <Route index element={<Dashboard />} />
                        <Route path="cards" element={<Cards />} />
                        <Route path="loans" element={<Loans />} />
                        <Route path="business" element={<Business />} />
                        <Route path="analysis" element={<Analysis />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    )
}
