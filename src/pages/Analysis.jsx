import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'

export default function AnalysisPage() {
    const { user } = useAuth()
    const [data, setData] = useState({
        income: 15000,
        expenses: 8000,
        debt: 18450,
        goal: 20000,
        monthlyFlow: [
            { name: 'Jan', income: 4000, expense: 2400 },
            { name: 'Feb', income: 3000, expense: 1398 },
            { name: 'Mar', income: 2000, expense: 9800 },
            { name: 'Apr', income: 2780, expense: 3908 },
            { name: 'May', income: 1890, expense: 4800 },
            { name: 'Jun', income: 2390, expense: 3800 },
        ]
    })

    // In a real app, I would fetch and aggregate transactions here
    useEffect(() => {
        // Fetch logic placeholder
    }, [user])

    const piedata = [
        { name: 'Deuda (Loans)', value: data.debt },
        { name: 'Net Profit', value: Math.max(0, data.income - data.expenses) },
    ];
    const COLORS = ['#ef4444', '#22c55e'];

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Data Analysis</h2>

            <div className="grid gap-4 md:grid-cols-2">
                {/* Monthly Cash Flow */}
                <Card>
                    <CardHeader>
                        <CardTitle>Monthly Cash Flow</CardTitle>
                        <CardDescription>Income vs Expenses over time</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.monthlyFlow}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="income" fill="#22c55e" name="Income" />
                                    <Bar dataKey="expense" fill="#ef4444" name="Expenses" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Debt vs Profit */}
                <Card>
                    <CardHeader>
                        <CardTitle>Debt vs Profit Structure</CardTitle>
                        <CardDescription>Current balance visualization</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={piedata}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {piedata.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="flex justify-center gap-4 mt-4">
                                <div className="flex items-center gap-1 text-sm"><div className="w-3 h-3 rounded-full bg-red-500" /> Debt</div>
                                <div className="flex items-center gap-1 text-sm"><div className="w-3 h-3 rounded-full bg-green-500" /> Profit</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Goal Progress */}
            <Card>
                <CardHeader>
                    <CardTitle>Goal Progress: $20,000 Profit</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Current Net Profit: ${(data.income - data.expenses).toLocaleString()}</span>
                            <span>{(Math.max(0, data.income - data.expenses) / data.goal * 100).toFixed(1)}%</span>
                        </div>
                        <div className="h-4 w-full bg-secondary rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-600 transition-all duration-500"
                                style={{ width: `${Math.min(100, Math.max(0, data.income - data.expenses) / data.goal * 100)}%` }}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
