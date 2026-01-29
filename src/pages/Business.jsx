import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Truck } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function BusinessPage() {
    const { user } = useAuth()
    const [txs, setTxs] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [loading, setLoading] = useState(false)
    const [stats, setStats] = useState({ revenue: 0, expenses: 0, margin: 0 })

    // Form
    const [type, setType] = useState('purchase')
    const [qty, setQty] = useState('')
    const [price, setPrice] = useState('')
    const [total, setTotal] = useState('')
    const [fuel, setFuel] = useState('0')
    const [freight, setFreight] = useState('0')
    const [location, setLocation] = useState('')

    useEffect(() => {
        if (user) fetchTxs()
    }, [user])

    const fetchTxs = async () => {
        const { data } = await supabase.from('transactions_granos')
            .select('*')
            .order('transaction_date', { ascending: false })

        if (data) {
            setTxs(data)
            calcStats(data)
        }
    }

    const calcStats = (transactions) => {
        let rev = 0
        let exp = 0
        transactions.forEach(t => {
            if (t.type === 'sale') rev += t.total_amount
            else exp += t.total_amount
        })
        setStats({ revenue: rev, expenses: exp, margin: rev - exp })
    }

    const handleSave = async (e) => {
        e.preventDefault()
        setLoading(true)

        let finalTotal = parseFloat(total)
        if (type !== 'expense' && qty && price) {
            finalTotal = parseFloat(qty) * parseFloat(price)
        }

        const { error } = await supabase.from('transactions_granos').insert({
            user_id: user.id,
            type,
            quantity_quintales: qty ? parseFloat(qty) : null,
            price_per_quintal: price ? parseFloat(price) : null,
            fuel_cost: parseFloat(fuel),
            freight_cost: parseFloat(freight),
            total_amount: finalTotal,
            location,
            transaction_date: new Date()
        })

        if (!error) {
            setShowModal(false)
            fetchTxs()
            toast.success("Transaction recorded successfully")
            // Reset form
            setQty('')
            setPrice('')
            setTotal('')
            setLocation('')
            setFuel('0')
            setFreight('0')
        } else {
            toast.error(error.message)
        }
        setLoading(false)
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Business Operations</h2>
                    <p className="text-muted-foreground">Manage your purchases, sales, and logistics.</p>
                </div>
                <Button onClick={() => setShowModal(true)} className="bg-emerald-600 hover:bg-emerald-700">
                    <Plus className="mr-2 h-4 w-4" /> New Transaction
                </Button>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-none shadow-sm">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-medium text-emerald-800">Total Revenue</CardTitle>
                        <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-900">${stats.revenue.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-red-50 to-red-100 border-none shadow-sm">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-medium text-red-800">Total Expenses</CardTitle>
                        <ArrowDownRight className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-900">${stats.expenses.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card className={cn("border-none shadow-sm text-white", stats.margin >= 0 ? "bg-gradient-to-r from-green-600 to-emerald-600" : "bg-gradient-to-r from-red-600 to-orange-600")}>
                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-medium text-white/90">Net Margin</CardTitle>
                        <TrendingUp className="h-4 w-4 text-white" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${stats.margin.toLocaleString()}</div>
                        <p className="text-xs text-white/80">Profit after costs</p>
                    </CardContent>
                </Card>
            </div>

            {/* Transactions List */}
            <Card className="border-none shadow-md">
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-1">
                        {txs.length > 0 ? txs.map((tx) => (
                            <div key={tx.id} className="flex items-center justify-between p-4 hover:bg-muted/50 rounded-lg transition-colors border-b last:border-0">
                                <div className="flex items-center gap-4">
                                    <div className={cn("p-2 rounded-full",
                                        tx.type === 'sale' ? "bg-emerald-100 text-emerald-600" :
                                            tx.type === 'purchase' ? "bg-blue-100 text-blue-600" : "bg-orange-100 text-orange-600"
                                    )}>
                                        {tx.type === 'sale' ? <TrendingUp className="h-5 w-5" /> :
                                            tx.type === 'purchase' ? <Truck className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                                    </div>
                                    <div>
                                        <p className="font-medium capitalize text-base">{tx.type} {tx.quantity_quintales ? `(${tx.quantity_quintales} qq)` : ''}</p>
                                        <p className="text-sm text-muted-foreground">{new Date(tx.transaction_date).toLocaleDateString()} • {tx.location || 'No location'}</p>
                                    </div>
                                </div>
                                <div className={cn("font-bold text-lg", tx.type === 'sale' ? "text-emerald-600" : "text-red-600")}>
                                    {tx.type === 'sale' ? '+' : '-'}${tx.total_amount.toLocaleString()}
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-12 text-muted-foreground">
                                No transactions recorded yet.
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <Card className="w-full max-w-lg shadow-2xl">
                        <CardHeader>
                            <CardTitle>New Transaction</CardTitle>
                            <CardDescription>Log sales, purchases, or operational expenses.</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleSave}>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Transaction Type</Label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={type} onChange={e => setType(e.target.value)}
                                    >
                                        <option value="purchase">Purchase (Compra de Grano)</option>
                                        <option value="sale">Sale (Venta de Grano)</option>
                                        <option value="expense">Expense (Gasto Operativo)</option>
                                    </select>
                                </div>

                                {type !== 'expense' && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Quantity (Quintales)</Label>
                                            <Input type="number" value={qty} onChange={e => setQty(e.target.value)} placeholder="0.00" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Price per QQ ($)</Label>
                                            <Input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" />
                                        </div>
                                    </div>
                                )}

                                {type === 'expense' && (
                                    <div className="space-y-2">
                                        <Label>Total Amount ($)</Label>
                                        <Input type="number" value={total} onChange={e => setTotal(e.target.value)} placeholder="0.00" />
                                    </div>
                                )}

                                <div className="space-y-2 opacity-80">
                                    <p className="text-xs font-medium uppercase text-muted-foreground">Logistics Costs (Optional)</p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs">Fuel ($)</Label>
                                            <Input type="number" className="h-8" value={fuel} onChange={e => setFuel(e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs">Freight ($)</Label>
                                            <Input type="number" className="h-8" value={freight} onChange={e => setFreight(e.target.value)} />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Location / Notes</Label>
                                    <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Bodega San Miguel" />
                                </div>
                            </CardContent>
                            <CardFooter className="justify-end gap-2">
                                <Button variant="ghost" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
                                <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">Save Transaction</Button>
                            </CardFooter>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    )
}
