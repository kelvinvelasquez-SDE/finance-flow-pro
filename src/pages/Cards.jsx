import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Zap, CreditCard as CardIcon, Loader2, Wallet } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { getRecommendedCard } from '@/lib/finance'
import { cn } from '@/lib/utils'

// Helper for card gradients based on Tier
const getCardGradient = (tier) => {
    const t = tier.toLowerCase()
    if (t.includes('black') || t.includes('infinite')) return "bg-gradient-to-r from-gray-900 to-gray-800 text-white"
    if (t.includes('platinum')) return "bg-gradient-to-r from-slate-300 to-slate-500 text-white"
    if (t.includes('gold') || t.includes('oro')) return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white"
    return "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground"
}

// Internal Component for a single Credit Card
const CreditCardItem = ({ card }) => (
    <div className={cn("relative overflow-hidden rounded-xl shadow-lg p-6 transition-all hover:scale-[1.02] duration-300", getCardGradient(card.tier))}>
        <div className="flex justify-between items-start mb-8">
            <div>
                <h3 className="font-bold text-lg tracking-wide">{card.bank}</h3>
                <p className="text-xs opacity-80 uppercase tracking-tighter">{card.tier}</p>
            </div>
            <CardIcon className="h-8 w-8 opacity-50" />
        </div>

        <div className="space-y-1 mb-4">
            <p className="text-xs opacity-70">Credit Limit</p>
            <p className="font-mono text-xl font-bold tracking-widest">
                ${card.credit_limit.toLocaleString()}
            </p>
        </div>

        <div className="flex justify-between items-end text-xs opacity-90">
            <div>
                <span className="block opacity-60">Cutoff</span>
                <span className="font-semibold">Day {card.cutoff_day}</span>
            </div>
            <div>
                <span className="block opacity-60">Payment</span>
                <span className="font-semibold">Day {card.payment_day}</span>
            </div>
        </div>

        {/* Decorative Circles */}
        <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 blur-xl" />
        <div className="absolute -left-6 -bottom-6 h-24 w-24 rounded-full bg-black/10 blur-xl" />
    </div>
)

export default function CardsPage() {
    const { user } = useAuth()
    const [cards, setCards] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)

    // Form State
    const [bank, setBank] = useState('Agrícola')
    const [tier, setTier] = useState('Platinum')
    const [limit, setLimit] = useState('')
    const [cutoff, setCutoff] = useState('')
    const [payment, setPayment] = useState('')

    useEffect(() => {
        if (user) fetchCards()
    }, [user])

    const fetchCards = async () => {
        setFetching(true)
        const { data } = await supabase.from('cards').select('*')
        if (data) setCards(data)
        setFetching(false)
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
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Wallet</h2>
                    <p className="text-muted-foreground">Manage your credit cards and billing cycles.</p>
                </div>
                <Button onClick={() => setShowModal(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Add Card
                </Button>
            </div>

            {/* Recommended Widget */}
            {recommended && (
                <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-none shadow-xl">
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-lg text-white">
                            <Zap className="h-5 w-5 text-yellow-300 fill-current animate-pulse" />
                            Smart Recommendation
                        </CardTitle>
                        <CardDescription className="text-purple-100">
                            Use this card today to maximize your financing time (approx 45 days).
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-3xl font-bold">{recommended.bank}</p>
                                <span className="inline-flex items-center rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-medium text-white ring-1 ring-inset ring-white/10">
                                    {recommended.tier}
                                </span>
                            </div>
                            <div className="text-right">
                                <p className="text-sm opacity-80">Cutoff closes in</p>
                                <p className="text-2xl font-bold">{recommended.daysUntilCutoff} days</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {fetching ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : cards.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {cards.map((card) => (
                        <CreditCardItem key={card.id} card={card} />
                    ))}
                </div>
            ) : (
                /* Empty State */
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center animate-in zoom-in-50 duration-500">
                    <div className="rounded-full bg-secondary p-4 mb-4">
                        <Wallet className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold">No cards yet</h3>
                    <p className="mb-4 text-sm text-muted-foreground max-w-sm">
                        Add your credit cards to start tracking cutoffs, payment dates, and limits efficiently.
                    </p>
                    <Button onClick={() => setShowModal(true)} variant="outline">
                        Register your first card
                    </Button>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <Card className="w-full max-w-lg shadow-2xl border-primary/20">
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
                                            <option value="Cuscatlán">Cuscatlán</option>
                                            <option value="BAC">BAC</option>
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
                                    <Input type="number" required value={limit} onChange={e => setLimit(e.target.value)} placeholder="5000" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Cutoff Day (1-31)</Label>
                                        <Input type="number" min="1" max="31" required value={cutoff} onChange={e => setCutoff(e.target.value)} placeholder="15" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Payment Day (1-31)</Label>
                                        <Input type="number" min="1" max="31" required value={payment} onChange={e => setPayment(e.target.value)} placeholder="05" />
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
