import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { Loader2, Target, Pencil } from 'lucide-react'
import { toast } from 'sonner'

export default function AnalysisPage() {
    const { user } = useAuth()
    const [loading, setLoading] = useState(true)
    const [goal, setGoal] = useState(20000)
    const [isEditingGoal, setIsEditingGoal] = useState(false)
    const [newGoal, setNewGoal] = useState('')

    const [chartData, setChartData] = useState([])
    const [totals, setTotals] = useState({ income: 0, expenses: 0, debt: 0, profit: 0 })

    useEffect(() => {
        const savedGoal = localStorage.getItem('finance_goal')
        if (savedGoal) setGoal(parseFloat(savedGoal))
        if (user) fetchData()
    }, [user])

    const fetchData = async () => {
        setLoading(true)

        // 1. Fetch Transactions
        const { data: txs } = await supabase.from('transactions_granos').select('*')

        // 2. Fetch Loans
        const { data: loans } = await supabase.from('loans').select('current_balance')
        const totalDebt = loans?.reduce((acc, curr) => acc + curr.current_balance, 0) || 0

        // Process Monthly Data
        const monthlyMap = {} // "Jan": {income:0, expense:0}
        let totalInc = 0
        let totalExp = 0

        txs?.forEach(tx => {
            const date = new Date(tx.transaction_date)
            const month = date.toLocaleString('es-ES', { month: 'short' })

            if (!monthlyMap[month]) monthlyMap[month] = { name: month, income: 0, expense: 0 }

            if (tx.type === 'sale') {
                monthlyMap[month].income += tx.total_amount
                totalInc += tx.total_amount
            } else {
                monthlyMap[month].expense += tx.total_amount
                totalExp += tx.total_amount
            }
        })

        // Sort by month index if possible, for now simple object values
        const finalChartData = Object.values(monthlyMap)

        setChartData(finalChartData)
        setTotals({
            income: totalInc,
            expenses: totalExp,
            debt: totalDebt,
            profit: totalInc - totalExp
        })
        setLoading(false)
    }

    const saveGoal = () => {
        const val = parseFloat(newGoal)
        if (val > 0) {
            setGoal(val)
            localStorage.setItem('finance_goal', val.toString())
            setIsEditingGoal(false)
            toast.success("Meta financiera actualizada")
        }
    }

    const pieData = [
        { name: 'Deuda', value: totals.debt },
        { name: 'Ganancia Neta', value: Math.max(0, totals.profit) },
    ];
    const PROTO_COLORS = ['#ef4444', '#10b981'];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Análisis de Datos</h2>
                    <p className="text-muted-foreground">Visualiza tu rendimiento y metas a largo plazo.</p>
                </div>
                {loading && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Monthly Cash Flow */}
                <Card className="border-none shadow-md">
                    <CardHeader>
                        <CardTitle>Flujo de Caja Mensual</CardTitle>
                        <CardDescription>Ingresos vs Gastos por mes (Negocios)</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            {chartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                        <YAxis axisLine={false} tickLine={false} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            cursor={{ fill: '#f3f4f6' }}
                                        />
                                        <Bar dataKey="income" fill="#10b981" name="Ingresos" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="expense" fill="#ef4444" name="Gastos" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-muted-foreground">
                                    Sin datos suficientes aún.
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Debt vs Profit */}
                <Card className="border-none shadow-md">
                    <CardHeader>
                        <CardTitle>Salud Financiera</CardTitle>
                        <CardDescription>Comparativa Deuda vs Ganancia Neta Real</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={80}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={PROTO_COLORS[index]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            {/* Center Text */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-3xl font-bold">
                                    {totals.debt === 0 && totals.profit === 0 ? "0%" :
                                        (totals.profit / (totals.profit + totals.debt || 1) * 100).toFixed(0) + "%"
                                    }
                                </span>
                                <span className="text-xs text-muted-foreground uppercase">Rentabilidad</span>
                            </div>
                        </div>
                        <div className="flex justify-center gap-6 mt-2">
                            <div className="flex items-center gap-2 text-sm">
                                <div className="w-3 h-3 rounded-full bg-red-500" />
                                Deuda Total: <span className="font-semibold">${totals.debt.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                                Ganancia: <span className="font-semibold">${totals.profit.toLocaleString()}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Goal Progress */}
            <Card className="bg-gradient-to-r from-slate-900 to-slate-800 text-white border-none shadow-xl">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Target className="h-6 w-6 text-yellow-400" />
                            <CardTitle className="text-white">Meta de Ganancia: ${goal.toLocaleString()}</CardTitle>
                        </div>
                        <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10" onClick={() => setIsEditingGoal(!isEditingGoal)}>
                            <Pencil className="h-4 w-4 mr-2" /> Editar Meta
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {isEditingGoal ? (
                        <div className="flex gap-2 mb-4 animate-in slide-in-from-top-2">
                            <Input
                                type="number"
                                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                                placeholder="Nueva Meta"
                                value={newGoal}
                                onChange={e => setNewGoal(e.target.value)}
                            />
                            <Button className="bg-white text-black hover:bg-white/90" onClick={saveGoal}>Guardar</Button>
                        </div>
                    ) : null}

                    <div className="space-y-3">
                        <div className="flex justify-between text-sm text-white/80">
                            <span>Ganancia Actual: ${totals.profit.toLocaleString()}</span>
                            <span>{Math.min(100, Math.max(0, totals.profit) / goal * 100).toFixed(1)}% Logrado</span>
                        </div>
                        <div className="h-4 w-full bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-1000 ease-out"
                                style={{ width: `${Math.min(100, Math.max(0, totals.profit) / goal * 100)}%` }}
                            />
                        </div>
                        <p className="text-xs text-white/50 text-center pt-2">
                            {totals.profit >= goal ? "¡Felicidades! Has superado tu meta. 🏆" : "Sigue así, estás construyendo tu futuro."}
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
