import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
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
    const { login, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            if (user.is_admin) navigate('/admin');
            else navigate('/');
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const result = await login(email, password);

        if (result.success) {
            navigate('/');
        } else {
            setError(result.message);
        }
        setIsLoading(false);
    };

    const handleAutofill = (type) => {
        const creds = DEMO_CREDENTIALS[type];
        setEmail(creds.email);
        setPassword(creds.password);
        setError('');
    };

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)] py-12 px-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">Sign in</CardTitle>
                    <CardDescription className="text-center">
                        Enter your email and password to access your account
                    </CardDescription>
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

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-muted-foreground">Or continue with</span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@example.com"
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
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        {error && (
                            <div className="text-sm text-destructive text-center font-medium">
                                {error}
                            </div>
                        )}

                        <Button className="w-full" type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Sign In
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    <div className="text-sm text-muted-foreground text-center">
                        Don't have an account? <Link to="/register" className="text-primary hover:underline">Sign up</Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
};

export default Login;
