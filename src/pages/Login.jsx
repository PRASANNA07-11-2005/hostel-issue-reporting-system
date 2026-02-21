import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Lock, ArrowRight } from 'lucide-react';
import logo from '../assets/peclogo.png';
import campusBg from '../assets/peccampus.jpeg';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);


    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!username || !password) {
            setError('Please enter credentials.');
            return;
        }

        try {
            // allow login with email or username/roll number
            let emailForAuth = username;
            if (!emailForAuth.includes('@')) {
                // look up stored profiles in localStorage
                const all = JSON.parse(localStorage.getItem('hostel_user_profiles') || '{}');
                const profile = Object.values(all).find(p => p.username === username);
                if (!profile) {
                    setError('No account found with that username');
                    return;
                }
                emailForAuth = profile.email || emailForAuth;
            }
            await login({ email: emailForAuth, password });
            navigate('/'); // redirect to home/dashboard
        } catch (err) {
            // Firebase auth errors include a `code` property
            switch (err.code) {
                case 'auth/too-many-requests':
                    setError('Too many attempts. Please wait a few minutes and try again.');
                    break;
                case 'auth/wrong-password':
                case 'auth/user-not-found':
                    setError('Invalid email or password.');
                    break;
                case 'auth/invalid-email':
                    setError('Please provide a valid email address.');
                    break;
                case 'auth/network-request-failed':
                    setError('Network error. Check your connection.');
                    break;
                default:
                    setError(err.message || 'Login failed');
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
            {/* Background Image with Overlay */}
            <div
                className="absolute inset-0 z-0 transition-all duration-1000 ease-in-out bg-cover bg-center"
                style={{ backgroundImage: `url(${campusBg})` }}
            >
                <div className="absolute inset-0 bg-secondary-900/70 backdrop-blur-[2px]"></div>
            </div>

            <div className="w-full max-w-md p-8 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl z-10 border border-white/20 m-4">
                <div className="flex flex-col items-center mb-6">
                    <img
                        src={logo}
                        alt="PEC Logo"
                        className="w-16 h-16 mb-4"
                    />
                    <h2 className="text-sm font-bold text-primary-600 tracking-wider uppercase mb-1">Panimalar Engineering College</h2>
                    <h1 className="text-2xl font-bold text-secondary-900 text-center leading-tight">Hostel Issue Reporting <br />& Auto-Escalation System</h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && <p className="text-red-600 mb-2">{error}</p>}

                    <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-1">Email / Username</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                            <input
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full rounded-xl border border-secondary-300 pl-10 pr-4 py-3 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                                placeholder="Enter your email address"
                            />
                        </div>
                        <p className="text-xs text-secondary-500 mt-1">Use the email you registered with.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full rounded-xl border border-secondary-300 pl-10 pr-4 py-3 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>


                    <button
                        type="submit"
                        className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3.5 px-4 rounded-xl transition-all shadow-lg hover:shadow-primary-600/30 mt-2"
                    >
                        Sign In to Portal
                        <ArrowRight className="w-5 h-5" />
                    </button>

                    <p className="text-center text-sm text-secondary-600 mt-4">
                        New user?{' '}
                        <Link to="/signup" className="text-primary-600 hover:underline">
                            Create an account
                        </Link>
                    </p>
                </form>
            </div>

            <div className="absolute bottom-4 text-white/50 text-sm font-medium z-10">
                © Panimalar Engineering College
            </div>
        </div>
    );
};

export default Login;
