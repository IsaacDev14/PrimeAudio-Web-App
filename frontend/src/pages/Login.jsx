import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate, Link, useSearchParams, Navigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Loader2, Shield, User } from 'lucide-react';

// Demo credentials
const DEMO_CREDENTIALS = {
    admin: {
        email: 'admin@primeaudio.co.ke',
        password: 'Admin@123',
        label: 'Admin',
        icon: Shield,
        color: 'bg-blue-600 hover:bg-blue-700'
    },
    customer: {
        email: 'customer@demo.com',
        password: 'Demo@123',
        label: 'Customer',
        icon: User,
        color: 'bg-slate-600 hover:bg-slate-700'
    }
};

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { login, user, loading } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const logoutMessage = sessionStorage.getItem('logoutMessage');
        if (logoutMessage) {
            toast.info(logoutMessage);
            sessionStorage.removeItem('logoutMessage');
        }
    }, [toast]);

    // Get redirect URL from query params - default to /dashboard for customers
    const redirectTo = searchParams.get('redirect') || '/dashboard';

    // Show loading while auth is being checked
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // If user is already logged in, redirect immediately using Navigate component
    // COMMENTED OUT per user request: "everytime time i click login it MUST and SHOULD bring me the login page"
    // If user is already logged in, redirect immediately using Navigate component
    if (user) {
        const destination = user.is_admin ? '/admin' : redirectTo;
        return <Navigate to={destination} replace />;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const result = await login(email, password);

        if (result.success) {
            toast.success('Login successful! Welcome back.');

            // Redirect based on role or return URL
            const destination = result.user?.is_admin ? '/admin' : redirectTo;
            navigate(destination);
        } else {
            toast.error(result.message || 'Login failed. Please check your credentials.');
            setError(result.message);
        }
        setIsLoading(false);
    };

    const handleAutofill = (type) => {
        const creds = DEMO_CREDENTIALS[type];
        setEmail(creds.email);
        setPassword(creds.password);
        toast.info(`${creds.label} credentials filled`);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
                    <CardDescription>Sign in to your Prime Audio account</CardDescription>
                </CardHeader>

                <CardContent>
                    {/* Quick Login Buttons */}
                    <div className="mb-6">
                        <p className="text-sm text-muted-foreground text-center mb-3">Quick Login (Demo)</p>
                        <div className="grid grid-cols-2 gap-3">
                            {Object.entries(DEMO_CREDENTIALS).map(([key, creds]) => {
                                const Icon = creds.icon;
                                return (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => handleAutofill(key)}
                                        className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-white font-medium transition-colors ${creds.color}`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {creds.label}
                                    </button>
                                );
                            })}
                        </div>
                        <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                            <div className="text-xs text-slate-500 space-y-1">
                                <p><strong>Admin:</strong> admin@primeaudio.co.ke / Admin@123</p>
                                <p><strong>Customer:</strong> customer@demo.com / Demo@123</p>
                            </div>
                        </div>
                    </div>

                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-muted-foreground">Or continue with email</span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </Button>
                    </form>
                </CardContent>

                <CardFooter className="flex flex-col gap-4">
                    <div className="text-sm text-center text-muted-foreground">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-blue-600 hover:underline font-medium">
                            Sign up
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
};

export default Login;
