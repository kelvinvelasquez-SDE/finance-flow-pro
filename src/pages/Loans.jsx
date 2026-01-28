import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Banknote } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'

export default function LoansPage() {
    const { user } = useAuth()
    const [loans, setLoans] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [loading, setLoading] = useState(false)

    // Form State
    const [name, setName] = useState('')
    const [principal, setPrincipal] = useState('')
    const [quota, setQuota] = useState('')
    const [balance, setBalance] = useState('')

    useEffect(() => {
        fetchLoans()
    }, [user])

    const fetchLoans = async () => {
        if (!user) return
        const { data } = await supabase.from('loans').select('*')
        if (data) setLoans(data)
    }

    const handleAddLoan = async (e) => {
        e.preventDefault()
        setLoading(true)

        const { error } = await supabase.from('loans').insert({
            user_id: user.id,
            name,
            principal_amount: parseFloat(principal),
            monthly_quota: parseFloat(quota),
            current_balance: parseFloat(balance || principal)
        })

        if (!error) {
            setShowModal(false)
            fetchLoans()
            setName('')
            setPrincipal('')
            setQuota('')
            setBalance('')
        }
        setLoading(false)
    }

    const registerPayment = async (loanId, currentBal, quota) => {
        // Simple update deduction
        const newBal = Math.max(0, currentBal - quota)
        await supabase.from('loans').update({ current_balance: newBal }).eq('id', loanId)
        fetchLoans()
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Loans</h2>
                <Button onClick={() => setShowModal(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Add Loan
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {loans.map((loan) => {
                    const progress = ((loan.principal_amount - loan.current_balance) / loan.principal_amount) * 100
                    return (
                        <Card key={loan.id}>
                            <CardHeader>
                                <CardTitle>{loan.name}</CardTitle>
                                <CardDescription>Principal: ${loan.principal_amount}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>Balance</span>
                                        <span className="font-bold">${loan.current_balance}</span>
                                    </div>
                                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                        <div className="h-full bg-destructive transition-all duration-500" style={{ width: `${Math.max(5, (loan.current_balance / loan.principal_amount) * 100)}%` }} />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Monthly Quota</span>
                                    <span className="font-medium">${loan.monthly_quota}</span>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full" variant="outline" onClick={() => registerPayment(loan.id, loan.current_balance, loan.monthly_quota)}>
                                    Register Payment
                                </Button>
                            </CardFooter>
                        </Card>
                    )
                })}
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                    <Card className="w-full max-w-lg shadow-lg">
                        <CardHeader>
                            <CardTitle>Register Loan</CardTitle>
                        </CardHeader>
                        <form onSubmit={handleAddLoan}>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Loan Name (e.g. Personal Loan 1)</Label>
                                    <Input required value={name} onChange={e => setName(e.target.value)} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Principal Amount ($)</Label>
                                        <Input type="number" required value={principal} onChange={e => setPrincipal(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Monthly Quota ($)</Label>
                                        <Input type="number" required value={quota} onChange={e => setQuota(e.target.value)} />
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="justify-end gap-2">
                                <Button variant="ghost" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
                                <Button type="submit" disabled={loading}>Save Loan</Button>
                            </CardFooter>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    )
}
