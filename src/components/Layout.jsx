import React from 'react'
import { Link, useLocation, Outlet } from 'react-router-dom'
import { LayoutDashboard, CreditCard, Banknote, PiggyBank, TrendingUp, Menu } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const navItems = [
    { name: 'Inicio', path: '/', icon: LayoutDashboard },
    { name: 'Tarjetas', path: '/cards', icon: CreditCard },
    { name: 'Préstamos', path: '/loans', icon: Banknote },
    { name: 'Negocios', path: '/business', icon: PiggyBank },
    { name: 'Análisis', path: '/analysis', icon: TrendingUp },
]

export default function Layout() {
    const location = useLocation()

    return (
        <div className="flex min-h-screen w-full bg-background font-sans antialiased text-foreground">
            {/* Desktop Sidebar */}
            <aside className="hidden border-r bg-card md:block md:w-64 lg:w-72">
                <div className="flex h-16 items-center border-b px-6">
                    <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary">
                        <span className="text-2xl">⚡</span> FinanceFlow
                    </Link>
                </div>
                <nav className="space-y-1 p-4">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={cn(
                                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                                location.pathname === item.path ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground" : "text-muted-foreground"
                            )}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.name}
                        </Link>
                    ))}
                </nav>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-h-screen">
                {/* Mobile Header */}
                <header className="flex h-14 items-center border-b px-4 md:hidden bg-card">
                    <span className="font-bold text-lg">FinanceFlow Pro</span>
                </header>

                {/* Page Content */}
                <div className="flex-1 p-4 md:p-8 overflow-y-auto pb-20 md:pb-8">
                    <Outlet />
                </div>

                {/* Mobile Bottom Nav */}
                <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t bg-card px-2 md:hidden">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={cn(
                                "flex flex-col items-center justify-center gap-1 rounded-md px-2 py-2 text-[10px] font-medium transition-colors",
                                location.pathname === item.path ? "text-primary" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <item.icon className={cn("h-5 w-5", location.pathname === item.path && "fill-current")} />
                            {item.name}
                        </Link>
                    ))}
                </nav>
            </main>
        </div>
    )
}
