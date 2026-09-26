import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Lock, Mail, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export const Login = () => {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const { success, error } = useToast();

  const [email, setEmail] = useState('admin@stocksense.io');
  const [password, setPassword] = useState('password123');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      success('Logged in successfully. Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      error(err.message || 'Login failed. Please check your credentials.');
    }
  };

  const handleQuickLogin = (roleEmail) => {
    setEmail(roleEmail);
    setPassword('password123');
  };

  return (
    <div className="min-h-screen bg-[#F5F5F3] flex flex-col justify-center items-center p-4">
      {/* Editorial Header Badge */}
      <div className="w-full max-w-md mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-sm bg-[#5B3A52] text-white flex items-center justify-center font-mono-code font-bold text-xs">
            SS
          </div>
          <span className="font-mono-code font-bold text-sm tracking-widest text-charcoal-900 uppercase">
            STOCKSENSE • ERP
          </span>
        </div>
        <span className="font-mono-code text-[10px] text-charcoal-400 uppercase tracking-wider">
          v1.0 ENTERPRISE
        </span>
      </div>

      <div className="w-full max-w-md bg-white border border-charcoal-100 rounded-sm shadow-card p-8">
        <div className="mb-6">
          <h1 className="text-xl font-black uppercase text-charcoal-900 tracking-tight font-numeric">
            AUTHENTICATE
          </h1>
          <p className="text-xs text-charcoal-500 mt-1">
            Enter your credentials to access inventory operations.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            icon={Mail}
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@stocksense.io"
          />

          <Input
            label="Password"
            type="password"
            icon={Lock}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
          />

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 text-charcoal-600 cursor-pointer">
              <input
                type="checkbox"
                defaultChecked
                className="rounded-sm border-charcoal-300 text-safety focus:ring-safety"
              />
              <span className="text-[11px] font-mono-code">Remember session</span>
            </label>
            <Link
              to="/auth/forgot-password"
              className="text-[11px] font-mono-code text-safety hover:underline font-semibold"
            >
              Forgot Password?
            </Link>
          </div>

          <Button
            type="submit"
            size="lg"
            variant="primary"
            loading={loading}
            className="w-full mt-2"
          >
            Sign In to Console
          </Button>
        </form>

        {/* Quick Demo Credentials for Fast Evaluation */}
        <div className="mt-8 pt-6 border-t border-charcoal-100">
          <div className="flex items-center gap-1.5 mb-2.5">
            <Zap className="w-3.5 h-3.5 text-safety" />
            <span className="text-[10px] font-mono-code font-bold uppercase text-charcoal-500 tracking-wider">
              Quick Role Test Fill:
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@stocksense.io')}
              className="text-[10px] font-mono-code p-2 border border-charcoal-200 rounded-sm hover:border-safety hover:bg-safety-light/30 transition-colors text-left"
            >
              <span className="font-bold block text-charcoal-900">ADMIN ROLE</span>
              <span className="text-charcoal-400 truncate block">admin@stocksense.io</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('manager@stocksense.io')}
              className="text-[10px] font-mono-code p-2 border border-charcoal-200 rounded-sm hover:border-safety hover:bg-safety-light/30 transition-colors text-left"
            >
              <span className="font-bold block text-charcoal-900">MANAGER ROLE</span>
              <span className="text-charcoal-400 truncate block">manager@stocksense.io</span>
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-charcoal-500">
          Don't have an account?{' '}
          <Link
            to="/auth/register"
            className="font-bold text-charcoal-900 hover:text-safety transition-colors"
          >
            Register Operator Account
          </Link>
        </div>
      </div>
    </div>
  );
};
