import React, { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true)
    const [loading, setLoading] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [fullName, setFullName] = useState('')
    const [error, setError] = useState(null)

    const { signIn, signUp } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            if (isLogin) {
                const { error } = await signIn({ email, password })
                if (error) throw error
                navigate('/')
            } else {
                const { error } = await signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName
                        }
                    }
                })
                if (error) throw error
                // Normally redirect to a "Verify email" page, but for now just navigate or show msg
                alert('Check your email for confirmation link!')
            }
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl">{isLogin ? 'Welcome back' : 'Create an account'}</CardTitle>
                    <CardDescription>
                        {isLogin ? 'Enter your credentials to access your finance dashboard.' : 'Enter your details to create your FinanceFlow account.'}
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        {error && (
                            <div className="rounded-md bg-destructive/15 p-3 text-destructive text-sm">
                                {error}
                            </div>
                        )}

                        {!isLogin && (
                            <div className="space-y-2">
                                <Label htmlFor="fullname">Full Name</Label>
                                <Input
                                    id="fullname"
                                    placeholder="John Doe"
                                    required
                                    value={fullName}
                                    onChange={e => setFullName(e.target.value)}
                                />
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@example.com"
                                required
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <Button className="w-full" type="submit" disabled={loading}>
                            {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Sign Up')}
                        </Button>
                        <div className="text-center text-sm">
                            {isLogin ? "Don't have an account? " : "Already have an account? "}
                            <button
                                type="button"
                                className="underline text-primary hover:text-primary/80"
                                onClick={() => setIsLogin(!isLogin)}
                            >
                                {isLogin ? 'Sign up' : 'Sign in'}
                            </button>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
