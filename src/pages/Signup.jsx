import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HOSTELS } from '../utils/constants';

const Signup = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Student');
  const [hostel, setHostel] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !username.trim() || !email.trim() || !password) {
      setError('All fields are required');
      return;
    }
    if (role === 'Admin') {
      setError('Admin accounts must be created manually.');
      return;
    }
    if (role === 'Student' && !hostel) {
      setError('Please select your hostel');
      return;
    }
    try {
      // signup() will throw if email already exists
      await signup({ email, password, role, hostel, name, username });
      alert('Verification mail sent. Check your inbox before logging in.');
      navigate('/login');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* reuse same background logic as login if desired */}
      <div className="w-full max-w-md p-8 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl z-10 border border-white/20 m-4">
        <h2 className="text-2xl font-bold text-center mb-6">Create an account</h2>
        {error && <p className="text-red-600 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-secondary-300 px-4 py-3 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
              placeholder="Your full name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">Username / Roll No.</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl border border-secondary-300 px-4 py-3 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
              placeholder="e.g. 20XX1234"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-secondary-300 px-4 py-3 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-secondary-300 px-4 py-3 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
              placeholder="Choose a password"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">Login Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-xl border border-secondary-300 px-4 py-3 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all bg-white"
            >
              <option value="Student">Student</option>
              <option value="Warden">Warden</option>
            </select>
          </div>

          {role === 'Student' && (
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">Hostel</label>
              <select
                required
                value={hostel}
                onChange={(e) => setHostel(e.target.value)}
                className="w-full rounded-xl border border-secondary-300 px-4 py-3 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all bg-white"
              >
                <option value="" disabled>Select your hostel</option>
                {Object.keys(HOSTELS).map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
          )}

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3.5 px-4 rounded-xl transition-all shadow-lg hover:shadow-primary-600/30 mt-2"
          >
            Sign Up
          </button>
          <p className="text-center text-sm text-secondary-600 mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;
