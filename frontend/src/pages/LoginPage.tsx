import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth, User } from '../contexts/AuthContext';
import { EyeIcon, EyeSlashIcon, ShieldCheckIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import SilentGoogleOneTap from '../components/GoogleOneTap';
import GoogleSignInButton from '../components/GoogleSignInButton';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login, user, setUser } = useAuth();
  const navigate = useNavigate();

  const navigateByRole = (role?: string) => {
    if (role === 'admin') navigate('/admin');
    else navigate('/dashboard');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const loggedIn: User = await login(email, password);
      setUser(loggedIn);
      navigateByRole(loggedIn.role);
    } catch (err: any) {
      setError(err?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (loggedUser: User) => {
    setUser(loggedUser);
    navigateByRole(loggedUser.role);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Image - Same as Landing Page */}
      <div className="absolute inset-0 w-full h-full">
      <img
          src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80"
          alt="Agricultural landscape"
        className="absolute inset-0 w-full h-full object-cover"
      />
        {/* Dark Overlay - Same as Landing Page */}
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Back Button */}
      <Link 
        to="/" 
        className="absolute top-6 left-6 flex items-center space-x-2 text-white hover:text-gray-200 transition-colors z-10"
      >
        <ArrowLeftIcon className="h-5 w-5" />
        <span className="font-medium text-base">Back</span>
      </Link>

      <SilentGoogleOneTap
        disabled={Boolean(user) || isLoading}
        onSuccess={handleGoogleSuccess}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 max-w-md w-full space-y-8"
      >
        <div>
          <Link to="/" className="flex items-center justify-center space-x-2 mb-8">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg">
              <ShieldCheckIcon className="h-7 w-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">SADS</span>
          </Link>
          <h2 className="text-center text-3xl font-bold text-white mb-2">Welcome back</h2>
          <p className="text-center text-white/80">Sign in to your SADS account</p>
        </div>

        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="backdrop-blur-md bg-white/90 p-8 rounded-2xl shadow-2xl space-y-6"
          onSubmit={handleSubmit}
        >
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="appearance-none w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="appearance-none w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Enter your password"
              />
              <button
                type="button"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center"
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl text-white bg-gradient-to-r from-emerald-500 to-teal-600 disabled:opacity-50"
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
          {error && <p className="text-red-600 text-center text-sm">{error}</p>}

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white/90 text-gray-600">Or continue with</span>
            </div>
          </div>

          <GoogleSignInButton onSuccess={handleGoogleSuccess} disabled={isLoading} />

          <p className="text-center text-sm text-gray-700">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-emerald-600 hover:text-emerald-500">
              Sign up
            </Link>
          </p>
        </motion.form>
      </motion.div>
    </div>
  );
};

export default LoginPage;
