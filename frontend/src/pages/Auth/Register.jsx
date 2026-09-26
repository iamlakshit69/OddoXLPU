import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Input, Select } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { User, Mail, Lock, Shield } from 'lucide-react';

export const Register = () => {
  const navigate = useNavigate();
  const { signup, loading } = useAuth();
  const { success, error } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('MANAGER');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signup(name, email, password, role);
      success('Account registered successfully! Welcome to StockSense.');
      navigate('/dashboard');
    } catch (err) {
      error(err.message || 'Registration failed.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F3] flex flex-col justify-center items-center p-4">
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
          REGISTRATION
        </span>
      </div>

      <div className="w-full max-w-md bg-white border border-charcoal-100 rounded-sm shadow-card p-8">
        <div className="mb-6">
          <h1 className="text-xl font-black uppercase text-charcoal-900 tracking-tight font-numeric">
            CREATE ACCOUNT
          </h1>
          <p className="text-xs text-charcoal-500 mt-1">
            Register a new warehouse operator or manager profile.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            icon={User}
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Alex Morgan"
          />

          <Input
            label="Email Address"
            type="email"
            icon={Mail}
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="alex@company.com"
          />

          <Input
            label="Password"
            type="password"
            icon={Lock}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimum 6 characters"
          />

          <Select
            label="Designated Role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="ADMIN">ADMIN (Full Permissions)</option>
            <option value="MANAGER">MANAGER (Create & Validate Orders)</option>
            <option value="WAREHOUSE_STAFF">WAREHOUSE_STAFF (View & Pick)</option>
          </Select>

          <Button
            type="submit"
            size="lg"
            variant="primary"
            loading={loading}
            className="w-full mt-3"
          >
            Register Profile
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-charcoal-500">
          Already registered?{' '}
          <Link
            to="/auth/login"
            className="font-bold text-charcoal-900 hover:text-safety transition-colors"
          >
            Log In Instead
          </Link>
        </div>
      </div>
    </div>
  );
};
