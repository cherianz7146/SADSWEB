import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { apiFetch } from '../utils/api';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await apiFetch(`/api/auth/forgot-password`, { method: 'POST', body: { email } });
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md bg-white rounded-2xl p-8 shadow">
        <h1 className="text-2xl font-bold mb-2">Forgot password</h1>
        <p className="text-gray-600 mb-6">Enter your email to receive a reset link.</p>
        {sent ? (
          <div className="bg-emerald-50 text-emerald-800 px-4 py-3 rounded">If the email exists, a reset link has been sent.</div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input value={email} onChange={e => setEmail(e.target.value)} type="email" required className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
            </div>
            <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700">{loading ? 'Sending...' : 'Send reset link'}</button>
          </form>
        )}
        <button onClick={() => navigate('/login')} className="mt-6 text-sm text-gray-600 hover:text-gray-900">Back to sign in</button>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
































