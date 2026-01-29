import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CreditCard, Banknote, PiggyBank, TrendingUp, Loader2 } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'

export default function Dashboard() {
    const { user } = useAuth()
    const [loading, setLoading] = useState(true)
    const [metrics, setMetrics] = useState({
        totalLimit: 0,
        loanBalance: 0,
        businessMargin: 0,
        recentTxs: []
    })

    useEffect(() => {
        if (user) fetchDashboardData()
    }, [user])

    const fetchDashboardData = async () => {
        setLoading(true)
        try {
            // 1. Cards Limit
            const { data: cards } = await supabase.from('cards').select('credit_limit')
            const totalLimit = cards?.reduce((sum, c) => sum + (c.credit_limit || 0), 0) || 0

            // 2. Loans Balance
            const { data: loans } = await supabase.from('loans').select('current_balance')
            const loanBalance = loans?.reduce((sum, l) => sum + (l.current_balance || 0), 0) || 0

            // 3. Business Margin (Sales - Expenses - Cost of Goods if complex, simple here)
            const { data: txs } = await supabase.from('transactions_granos').select('*').order('transaction_date', { ascending: false })

            let revenue = 0
            let expenses = 0

            // Get recent 5 for list
            const recentTxs = txs ? txs.slice(0, 5) : []

            txs?.forEach(tx => {
                if (tx.type === 'sale') revenue += tx.total_amount
                else expenses += tx.total_amount
            })
            const businessMargin = revenue - expenses

            setMetrics({ totalLimit, loanBalance, businessMargin, recentTxs })
        } catch (error) {
            console.error("Error fetching dashboard", error)
        }
        setLoading(false)
    }

    // Mock data for chart until we strictly categorize historicals
    const chartData = [
        { name: 'Jan', value: 4000 },
        { name: 'Feb', value: 3000 },
        { name: 'Mar', value: 2000 },
        { name: 'Apr', value: 2780 },
        { name: 'May', value: 1890 },
        { name: 'Jun', value: 2390 },
        { name: 'Jul', value: 3490 },
    ]

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Financial Overview</h2>
                    <p className="text-muted-foreground">Your financial health at a glance.</p>
                </div>
                {loading && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Total Limit Card */}
                <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 border-none shadow-lg text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-blue-100">Total Credit Limit</CardTitle>
                        <CreditCard className="h-4 w-4 text-white opacity-70" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${metrics.totalLimit.toLocaleString()}</div>
                        <p className="text-xs text-blue-100/70">Across all registered cards</p>
                    </CardContent>
                </Card>

                {/* Loan Balance Card */}
                <Card className="bg-gradient-to-br from-rose-500 to-pink-600 border-none shadow-lg text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-rose-100">Outstanding Debt</CardTitle>
                        <Banknote className="h-4 w-4 text-white opacity-70" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${metrics.loanBalance.toLocaleString()}</div>
                        <p className="text-xs text-rose-100/70">Total loan principal remaining</p>
                    </CardContent>
                </Card>

                {/* Business Margin Card */}
                <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 border-none shadow-lg text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-emerald-100">Business Margin</CardTitle>
                        <PiggyBank className="h-4 w-4 text-white opacity-70" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${metrics.businessMargin.toLocaleString()}</div>
                        <p className="text-xs text-emerald-100/70">Net Profit (Sales - Exp)</p>
                    </CardContent>
                </Card>

                {/* Net Growth Card (Projected/Calculated) */}
                <Card className="bg-gradient-to-br from-amber-500 to-orange-600 border-none shadow-lg text-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-amber-100">Net Position</CardTitle>
                        <TrendingUp className="h-4 w-4 text-white opacity-70" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${(metrics.businessMargin - metrics.loanBalance * 0.05).toLocaleString()}</div>
                        <p className="text-xs text-amber-100/70">Est. Monthly Growth</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 border-none shadow-md">
                    <CardHeader>
                        <CardTitle>Cash Flow Trend</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                    <YAxis axisLine={false} tickLine={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Area type="monotone" dataKey="value" stroke="#6366f1" fillOpacity={1} fill="url(#colorVal)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3 border-none shadow-md">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {metrics.recentTxs.length > 0 ? metrics.recentTxs.map((tx, i) => (
                                <div key={i} className="flex items-center">
                                    <div className={`h-2 w-2 rounded-full mr-4 ${tx.type === 'sale' ? 'bg-green-500' : 'bg-red-500'}`} />
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium leading-none capitalize">{tx.type} ({tx.location || 'Grano'})</p>
                                        <p className="text-xs text-muted-foreground">{new Date(tx.transaction_date).toLocaleDateString()}</p>
                                    </div>
                                    <div className={`ml-auto font-medium ${tx.type === 'sale' ? 'text-green-600' : 'text-red-600'}`}>
                                        {tx.type === 'sale' ? '+' : '-'}${tx.total_amount}
                                    </div>
                                </div>
                            )) : (
                                <p className="text-sm text-muted-foreground text-center py-8">No recent activity.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
