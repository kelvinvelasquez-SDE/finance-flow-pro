import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Banknote, Landmark, Percent } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function LoansPage() {
    const { user } = useAuth()
    const [loans, setLoans] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [loading, setLoading] = useState(false)

    // Form
    const [name, setName] = useState('')
    const [principal, setPrincipal] = useState('')
    const [quota, setQuota] = useState('')

    useEffect(() => {
        if (user) fetchLoans()
    }, [user])

    const fetchLoans = async () => {
        const { data } = await supabase.from('loans').select('*').order('created_at', { ascending: false })
        if (data) setLoans(data)
    }

    const handleAddLoan = async (e) => {
        e.preventDefault()
        setLoading(true)
        const principalVal = parseFloat(principal)

        const { error } = await supabase.from('loans').insert({
            user_id: user.id,
            name,
            principal_amount: principalVal,
            monthly_quota: parseFloat(quota),
            current_balance: principalVal // Start with full debt
        })

        if (!error) {
            fetchLoans()
            setShowModal(false)
            toast.success("¡Préstamo registrado exitosamente!")
            setName('')
            setPrincipal('')
            setQuota('')
        } else {
            toast.error("Error al registrar: " + error.message)
        }
        setLoading(false)
    }

    const registerPayment = async (loan) => {
        const newBal = Math.max(0, loan.current_balance - loan.monthly_quota)
        const { error } = await supabase.from('loans').update({ current_balance: newBal }).eq('id', loan.id)

        if (!error) {
            fetchLoans()
            if (newBal === 0) {
                toast.success("¡Felicidades! ¡Préstamo pagado por completo! 🎉")
            } else {
                toast.success(`¡Pago registrado! Nuevo saldo: $${newBal.toFixed(2)}`)
            }
        } else {
            toast.error("Error al actualizar saldo")
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Préstamos y Deudas</h2>
                    <p className="text-muted-foreground">Monitorea tu amortización y progreso de pagos.</p>
                </div>
                <Button onClick={() => setShowModal(true)} className="bg-rose-600 hover:bg-rose-700">
                    <Plus className="mr-2 h-4 w-4" /> Agregar Préstamo
                </Button>
            </div>

            {loans.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {loans.map((loan) => {
                        const paid = loan.principal_amount - loan.current_balance
                        const percentPaid = (paid / loan.principal_amount) * 100

                        return (
                            <Card key={loan.id} className="relative overflow-hidden border-rose-100 shadow-md transition-all hover:shadow-lg">
                                <div className="absolute top-0 left-0 w-1 h-full bg-rose-500" />
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-lg">{loan.name}</CardTitle>
                                            <CardDescription>Monto Original: ${loan.principal_amount.toLocaleString()}</CardDescription>
                                        </div>
                                        <div className="p-2 bg-rose-50 rounded-full text-rose-600">
                                            <Landmark className="h-5 w-5" />
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4 pt-4">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-muted-foreground">Saldo Actual</p>
                                            <p className="text-2xl font-bold text-rose-600">${loan.current_balance.toLocaleString()}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-muted-foreground">Cuota</p>
                                            <p className="font-semibold">${loan.monthly_quota}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>Progreso</span>
                                            <span>{percentPaid.toFixed(0)}% pagado</span>
                                        </div>
                                        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-rose-500 transition-all duration-700 ease-out"
                                                style={{ width: `${percentPaid}%` }}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="bg-muted/20 pt-4">
                                    <Button
                                        className="w-full"
                                        variant={loan.current_balance === 0 ? "secondary" : "default"}
                                        disabled={loan.current_balance === 0}
                                        onClick={() => registerPayment(loan)}
                                    >
                                        {loan.current_balance === 0 ? "Pagado ✅" : "Registrar Pago Mensual"}
                                    </Button>
                                </CardFooter>
                            </Card>
                        )
                    })}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-16 text-center animate-in zoom-in-50 duration-500">
                    <div className="rounded-full bg-rose-50 p-4 mb-4">
                        <Banknote className="h-10 w-10 text-rose-500" />
                    </div>
                    <h3 className="text-xl font-semibold">Sin préstamos activos</h3>
                    <p className="mb-6 text-muted-foreground max-w-sm">
                        ¡Genial! Estás libre de deudas. O agrega un préstamo para verificar tu plan de amortización.
                    </p>
                    <Button onClick={() => setShowModal(true)} variant="outline">
                        Registrar Préstamo
                    </Button>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <Card className="w-full max-w-lg shadow-2xl">
                        <CardHeader>
                            <CardTitle>Registrar Deuda / Préstamo</CardTitle>
                            <CardDescription>Ingresa los detalles para calcular la amortización.</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleAddLoan}>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Descripción</Label>
                                    <Input placeholder="Ej. Préstamo Personal" required value={name} onChange={e => setName(e.target.value)} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Monto Principal ($)</Label>
                                        <Input type="number" required value={principal} onChange={e => setPrincipal(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Cuota Mensual ($)</Label>
                                        <Input type="number" required value={quota} onChange={e => setQuota(e.target.value)} />
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="justify-end gap-2">
                                <Button variant="ghost" type="button" onClick={() => setShowModal(false)}>Cancelar</Button>
                                <Button type="submit" disabled={loading}>Guardar</Button>
                            </CardFooter>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    )
}
