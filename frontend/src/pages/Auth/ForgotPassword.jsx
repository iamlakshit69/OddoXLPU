import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import { useToast } from '../../context/ToastContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Mail, KeyRound, Lock, ArrowLeft } from 'lucide-react';

export const ForgotPassword = () => {
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [step, setStep] = useState('request'); // 'request' | 'reset'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.forgotPassword({ email });
      success('If that email exists, an OTP code has been dispatched.');
      setStep('reset');
    } catch (err) {
      error(err.message || 'Failed to request OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.resetPassword({ email, otp, newPassword });
      success('Password successfully updated! Please log in.');
      navigate('/auth/login');
    } catch (err) {
      error(err.message || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F3] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white border border-charcoal-100 rounded-sm shadow-card p-8">
        <div className="mb-6">
          <Link
            to="/auth/login"
            className="inline-flex items-center gap-1.5 text-[11px] font-mono-code text-charcoal-500 hover:text-charcoal-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
          </Link>
          <h1 className="text-xl font-black uppercase text-charcoal-900 tracking-tight font-numeric">
            {step === 'request' ? 'RECOVER PASSWORD' : 'ENTER OTP CODE'}
          </h1>
          <p className="text-xs text-charcoal-500 mt-1">
            {step === 'request'
              ? 'Enter your registered email address to receive a secure recovery code.'
              : `Enter the code sent to ${email} and define your new password.`}
          </p>
        </div>

        {step === 'request' ? (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <Input
              label="Account Email"
              type="email"
              icon={Mail}
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. user@stocksense.io"
            />

            <Button
              type="submit"
              size="lg"
              variant="primary"
              loading={loading}
              className="w-full mt-2"
            >
              Send OTP Code
            </Button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <Input
              label="6-Digit OTP Code"
              icon={KeyRound}
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="e.g. 123456"
            />

            <Input
              label="New Password"
              type="password"
              icon={Lock}
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 6 characters"
            />

            <Button
              type="submit"
              size="lg"
              variant="primary"
              loading={loading}
              className="w-full mt-2"
            >
              Reset & Update Password
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};
