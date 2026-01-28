import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Check, Zap } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { getRecommendedCard } from '@/lib/finance'

export default function CardsPage() {
    const { user } = useAuth()
    const [cards, setCards] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [loading, setLoading] = useState(false)

    // Form State
    const [bank, setBank] = useState('Agrícola')
    const [tier, setTier] = useState('Platinum')
    const [limit, setLimit] = useState('')
    const [cutoff, setCutoff] = useState('')
    const [payment, setPayment] = useState('')

    useEffect(() => {
        fetchCards()
    }, [user])

    const fetchCards = async () => {
        if (!user) return
        const { data, error } = await supabase.from('cards').select('*')
        if (data) setCards(data)
    }

    const handleAddCard = async (e) => {
        e.preventDefault()
        setLoading(true)

        const { error } = await supabase.from('cards').insert({
            user_id: user.id,
            bank,
            tier,
            credit_limit: parseFloat(limit),
            cutoff_day: parseInt(cutoff),
            payment_day: parseInt(payment)
        })

        if (!error) {
            setShowModal(false)
            fetchCards()
            // Reset form
            setLimit('')
            setCutoff('')
            setPayment('')
        } else {
            alert(error.message)
        }
        setLoading(false)
    }

    const recommended = getRecommendedCard(cards)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Credit Cards</h2>
                <Button onClick={() => setShowModal(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Add Card
                </Button>
            </div>

            {/* Recommended Widget */}
            {recommended && (
                <Card className="bg-primary text-primary-foreground border-none">
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Zap className="h-5 w-5 text-yellow-400 fill-current" />
                            Recommended Card for Today
                        </CardTitle>
                        <CardDescription className="text-primary-foreground/80">
                            Maximize your interest-free days by using this card.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-2xl font-bold">{recommended.bank} {recommended.tier}</p>
                                <p className="text-sm opacity-90">Cutoff in {recommended.daysUntilCutoff} days</p>
                            </div>
                            <Button variant="secondary" size="sm">Use Now</Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {cards.map((card) => (
                    <Card key={card.id}>
                        <CardHeader>
                            <CardTitle>{card.bank}</CardTitle>
                            <CardDescription>{card.tier}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm font-medium">Limit: ${card.credit_limit}</div>
                            <div className="flex justify-between text-xs text-muted-foreground mt-4">
                                <span>Cutoff: Day {card.cutoff_day}</span>
                                <span>Pay: Day {card.payment_day}</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Simple Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                    <Card className="w-full max-w-lg shadow-lg">
                        <CardHeader>
                            <CardTitle>Add New Card</CardTitle>
                            <CardDescription>Enter card details to track payments.</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleAddCard}>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Bank</Label>
                                        <select
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                            value={bank} onChange={e => setBank(e.target.value)}
                                        >
                                            <option value="Agrícola">Agrícola</option>
                                            <option value="Davivienda">Davivienda</option>
                                            <option value="Promerica">Promerica</option>
                                            <option value="Atlántida">Atlántida</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Tier</Label>
                                        <select
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                            value={tier} onChange={e => setTier(e.target.value)}
                                        >
                                            <option value="Platinum">Platinum</option>
                                            <option value="ONE">ONE</option>
                                            <option value="Classic">Classic</option>
                                            <option value="Gold">Gold</option>
                                            <option value="Black">Black</option>
                                            <option value="Infinite">Infinite</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Credit Limit ($)</Label>
                                    <Input type="number" required value={limit} onChange={e => setLimit(e.target.value)} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Cutoff Day (1-31)</Label>
                                        <Input type="number" min="1" max="31" required value={cutoff} onChange={e => setCutoff(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Payment Day (1-31)</Label>
                                        <Input type="number" min="1" max="31" required value={payment} onChange={e => setPayment(e.target.value)} />
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="justify-end gap-2">
                                <Button variant="ghost" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
                                <Button type="submit" disabled={loading}>Save Card</Button>
                            </CardFooter>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    )
}
