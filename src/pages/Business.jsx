import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, DollarSign, Truck } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'

export default function BusinessPage() {
    const { user } = useAuth()
    const [txs, setTxs] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [loading, setLoading] = useState(false)

    // Form
    const [type, setType] = useState('purchase') // purchase, sale, expense
    const [qty, setQty] = useState('')
    const [price, setPrice] = useState('')
    const [total, setTotal] = useState('')
    const [fuel, setFuel] = useState('0')
    const [freight, setFreight] = useState('0')
    const [location, setLocation] = useState('')

    useEffect(() => {
        fetchTxs()
    }, [user])

    const fetchTxs = async () => {
        if (!user) return
        const { data } = await supabase.from('transactions_granos')
            .select('*')
            .order('transaction_date', { ascending: false })
        if (data) setTxs(data)
    }

    const handleSave = async (e) => {
        e.preventDefault()
        setLoading(true)

        // Auto calc total if not set manually for expense, or calc from qty*price
        let finalTotal = parseFloat(total)
        if (type !== 'expense' && qty && price) {
            finalTotal = parseFloat(qty) * parseFloat(price)
        }

        // Add logic for deducting costs from margin later in backend or query
        // Here we save raw data

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
            setQty('')
            setPrice('')
            setTotal('')
        }
        setLoading(false)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Granos & Business</h2>
                <Button onClick={() => setShowModal(true)}>
                    <Plus className="mr-2 h-4 w-4" /> New Transaction
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Summary Cards */}
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Net Margin</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-green-600">$4,200</div></CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {txs.map(tx => (
                            <div key={tx.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                <div>
                                    <p className="text-sm font-medium capitalize">{tx.type} {tx.quantity_quintales ? `- ${tx.quantity_quintales}qq` : ''}</p>
                                    <p className="text-xs text-muted-foreground">{new Date(tx.transaction_date).toLocaleDateString()} • {tx.location}</p>
                                </div>
                                <div className={`font-bold ${tx.type === 'sale' ? 'text-green-600' : 'text-red-600'}`}>
                                    {tx.type === 'sale' ? '+' : '-'}${tx.total_amount}
                                </div>
                            </div>
                        ))}
                        {txs.length === 0 && <p className="text-muted-foreground text-sm">No transactions found.</p>}
                    </div>
                </CardContent>
            </Card>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                    <Card className="w-full max-w-lg shadow-lg">
                        <CardHeader>
                            <CardTitle>Record Transaction</CardTitle>
                        </CardHeader>
                        <form onSubmit={handleSave}>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Type</Label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={type} onChange={e => setType(e.target.value)}
                                    >
                                        <option value="purchase">Purchase (Compra)</option>
                                        <option value="sale">Sale (Venta)</option>
                                        <option value="expense">Expense (Gasto)</option>
                                    </select>
                                </div>

                                {type !== 'expense' && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Quantity (QQ)</Label>
                                            <Input type="number" value={qty} onChange={e => setQty(e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Price per QQ ($)</Label>
                                            <Input type="number" value={price} onChange={e => setPrice(e.target.value)} />
                                        </div>
                                    </div>
                                )}

                                {type === 'expense' && (
                                    <div className="space-y-2">
                                        <Label>Total Amount ($)</Label>
                                        <Input type="number" value={total} onChange={e => setTotal(e.target.value)} />
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Fuel Cost ($)</Label>
                                        <Input type="number" value={fuel} onChange={e => setFuel(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Freight Cost ($)</Label>
                                        <Input type="number" value={freight} onChange={e => setFreight(e.target.value)} />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Location / Notes</Label>
                                    <Input value={location} onChange={e => setLocation(e.target.value)} />
                                </div>
                            </CardContent>
                            <CardFooter className="justify-end gap-2">
                                <Button variant="ghost" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
                                <Button type="submit" disabled={loading}>Save</Button>
                            </CardFooter>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    )
}
