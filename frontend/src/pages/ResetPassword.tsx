import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { apiFetch } from '../utils/api';

const ResetPassword: React.FC = () => {
  const [params] = useSearchParams();
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setEmail(params.get('email') || '');
    setToken(params.get('token') || '');
  }, [params]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) return alert('Passwords do not match');
    try {
      setLoading(true);
      await apiFetch(`/api/auth/reset-password`, { method: 'POST', body: { email, token, newPassword: password } });
      setDone(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md bg-white rounded-2xl p-8 shadow">
        <h1 className="text-2xl font-bold mb-2">Reset password</h1>
        <p className="text-gray-600 mb-6">Choose a new password for {email || 'your account'}.</p>
        {done ? (
          <div>
            <div className="bg-emerald-50 text-emerald-800 px-4 py-3 rounded mb-4">Password changed successfully.</div>
            <button onClick={() => navigate('/login')} className="w-full py-3 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700">Go to Sign in</button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
              <input value={password} onChange={e => setPassword(e.target.value)} type="password" required className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
              <input value={confirm} onChange={e => setConfirm(e.target.value)} type="password" required className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
            </div>
            <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700">{loading ? 'Saving...' : 'Reset password'}</button>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default ResetPassword;


































