import { useState } from 'react';
import { Mail, ArrowLeft, CheckCircle, Lock, Eye, EyeOff, Key } from 'lucide-react';
import { api } from '../Helpers/BackendRequest';

type ResetStep = 'email' | 'code' | 'newPassword' | 'success';

export function ForgotPassword() {
  const [step, setStep] = useState<ResetStep>('email');
  const [email, setEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [countdown, setCountdown] = useState(0);

  // Start countdown timer
  const startCountdown = () => {
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const validateEmail = () => {
    if (!email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const validateResetCode = () => {
    if (!resetCode.trim()) {
      setError('Reset code is required');
      return false;
    }
    if (resetCode.length !== 6) {
      setError('Reset code must be 6 digits');
      return false;
    }
    return true;
  };

  const validatePassword = () => {
    if (!newPassword) {
      setError('Password is required');
      return false;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      setError('Password must contain uppercase, lowercase, and numbers');
      return false;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSendResetEmail = async () => {
    if (!validateEmail()) return;

    setError('');
    setIsLoading(true);

    try {
      await api.post('/password-reset-code', { email });
      setSuccessMessage('Reset instructions sent to your email');
      startCountdown();
      setStep('code');
    } catch (err: any) {
      setError(
        err.response?.data?.message || 
        err.response?.data?.error || 
        'Failed to send reset email. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyResetCode = async () => {
    if (!validateResetCode()) return;

    setError('');
    setSuccessMessage('Code verified successfully');
    setStep('newPassword');
  };

  const handleResetPassword = async () => {
    if (!validatePassword()) return;

    setError('');
    setIsLoading(true);

    try {
      await api.post('/reset-password', {
        email,
        code: resetCode,
        password: newPassword,
      });
      setSuccessMessage('Password reset successfully!');
      setStep('success');
    } catch (err: any) {
      setError(
        err.response?.data?.message || 
        err.response?.data?.error || 
        'Failed to reset password. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0) return;

    setError('');
    setIsLoading(true);

    try {
      await api.post('/password-reset-code', { email });
      setSuccessMessage('New code sent to your email');
      startCountdown();
    } catch (err: any) {
      setError(
        err.response?.data?.message || 
        err.response?.data?.error || 
        'Failed to resend code. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const goBack = () => {
    if (step === 'code') {
      setStep('email');
    } else if (step === 'newPassword') {
      setStep('code');
    }
    setError('');
    setSuccessMessage('');
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Visual/Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:40px_40px]"></div>
        
        {/* Decorative Elements */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
        
        <div className="relative z-10 w-full flex flex-col justify-between p-12">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
              <Key className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Brand<span className="text-primary-200">Mize</span></h1>
              <p className="text-primary-100 text-sm mt-1">Account Security</p>
            </div>
          </div>

          {/* Security Content */}
          <div className="max-w-lg">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-white/20">
              <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
              </div>
              <span className="text-white text-sm font-medium">Enterprise-grade Security</span>
            </div>
            
            <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
              Secure account
              <br />
              <span className="text-accent-300">access recovery</span>
            </h2>
            
            <div className="space-y-4 mb-12">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Lock className="w-4 h-4 text-white" />
                </div>
                <span className="text-white/90">End-to-end encrypted password reset</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <span className="text-white/90">Two-factor verification process</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Mail className="w-4 h-4 text-white" />
                </div>
                <span className="text-white/90">Instant email delivery & 60-second expiry</span>
              </div>
            </div>
          </div>

          {/* Security Tips */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <h3 className="text-white font-semibold mb-3">Password Tips</h3>
            <ul className="space-y-2">
              <li className="text-primary-100 text-sm flex items-center">
                <div className="w-2 h-2 bg-accent-400 rounded-full mr-3"></div>
                Use at least 8 characters with mixed case
              </li>
              <li className="text-primary-100 text-sm flex items-center">
                <div className="w-2 h-2 bg-accent-400 rounded-full mr-3"></div>
                Include numbers and special characters
              </li>
              <li className="text-primary-100 text-sm flex items-center">
                <div className="w-2 h-2 bg-accent-400 rounded-full mr-3"></div>
                Avoid common words and personal information
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Right Side - Reset Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 lg:p-12">
        <div className="w-full max-w-md">
          {/* Back Button */}
          <button
            onClick={() => window.location.href = '/login'}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-10 group transition"
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to login
          </button>

          {/* Header */}
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-gray-900">
              {step === 'email' && 'Reset your password'}
              {step === 'code' && 'Verify your email'}
              {step === 'newPassword' && 'Create new password'}
              {step === 'success' && 'Password reset!'}
            </h2>
            <p className="text-gray-600 mt-2">
              {step === 'email' && 'Enter your email address to receive reset instructions'}
              {step === 'code' && `Enter the 6-digit code sent to ${email}`}
              {step === 'newPassword' && 'Create a strong new password for your account'}
              {step === 'success' && 'Your password has been successfully reset'}
            </p>
          </div>

          {/* Success Message */}
          {successMessage && step !== 'success' && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-2xl flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <p className="text-green-800 text-sm">{successMessage}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start space-x-3">
              <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-red-700 text-sm flex-1">{error}</p>
            </div>
          )}

          {/* Step 1: Email Input */}
          {step === 'email' && (
            <div className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-12 pr-4 py-3.5 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:bg-white focus:outline-none transition-all duration-200 placeholder:text-gray-400"
                    placeholder="you@company.com"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <button
                onClick={handleSendResetEmail}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white font-semibold py-4 px-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Sending reset link...
                  </span>
                ) : (
                  'Send reset instructions'
                )}
              </button>

              <div className="text-center text-sm text-gray-500">
                <p>We'll send you a 6-digit code to reset your password</p>
              </div>
            </div>
          )}

          {/* Step 2: Verification Code */}
          {step === 'code' && (
            <div className="space-y-6">
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                  6-digit verification code
                </label>
                <div className="relative">
                  <input
                    id="code"
                    type="text"
                    value={resetCode}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setResetCode(value);
                    }}
                    className="block w-full px-4 py-3.5 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:bg-white focus:outline-none transition-all duration-200 placeholder:text-gray-400 text-center text-2xl tracking-widest font-semibold"
                    placeholder="000000"
                    disabled={isLoading}
                  />
                </div>
                <div className="mt-2 text-sm text-gray-500 text-center">
                  Enter the code from your email
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleVerifyResetCode}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white font-semibold py-4 px-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Verifying...
                    </span>
                  ) : (
                    'Verify code'
                  )}
                </button>

                <button
                  type="button"
                  onClick={goBack}
                  className="w-full py-3.5 px-4 border border-gray-200 rounded-2xl bg-white hover:bg-gray-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 text-gray-700 font-medium"
                >
                  Use different email
                </button>
              </div>

              <div className="text-center">
                <button
                  onClick={handleResendCode}
                  disabled={isLoading || countdown > 0}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {countdown > 0 ? `Resend code in ${countdown}s` : 'Resend verification code'}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: New Password */}
          {step === 'newPassword' && (
            <div className="space-y-6">
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  New password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="block w-full pl-12 pr-12 py-3.5 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:bg-white focus:outline-none transition-all duration-200 placeholder:text-gray-400"
                    placeholder="Create a strong password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition" />
                    )}
                  </button>
                </div>
                <div className="mt-3">
                  <div className="flex items-center space-x-2 mb-2">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full ${
                          newPassword.length >= i * 3 ? 'bg-green-500' : 'bg-gray-200'
                        }`}
                      ></div>
                    ))}
                  </div>
                  <div className="text-xs text-gray-500">
                    Password strength: {newPassword.length >= 8 ? 'Strong' : 'Weak'}
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm new password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full pl-12 pr-12 py-3.5 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:bg-white focus:outline-none transition-all duration-200 placeholder:text-gray-400"
                    placeholder="Re-enter your password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleResetPassword}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white font-semibold py-4 px-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Updating password...
                    </span>
                  ) : (
                    'Reset password'
                  )}
                </button>

                <button
                  type="button"
                  onClick={goBack}
                  className="w-full py-3.5 px-4 border border-gray-200 rounded-2xl bg-white hover:bg-gray-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 text-gray-700 font-medium"
                >
                  Back to verification
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Success */}
          {step === 'success' && (
            <div className="space-y-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Password reset successful!</h3>
                <p className="text-gray-600">
                  Your password has been updated. You can now sign in with your new password.
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => window.location.href = '/login'}
                  className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white font-semibold py-4 px-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Sign in to your account
                </button>

                <button
                  onClick={() => window.location.href = '/dashboard'}
                  className="w-full py-3.5 px-4 border border-gray-200 rounded-2xl bg-white hover:bg-gray-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 text-gray-700 font-medium"
                >
                  Go to dashboard
                </button>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Security reminder</h4>
                <p className="text-blue-700 text-sm">
                  For added security, consider enabling two-factor authentication in your account settings.
                </p>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-gray-100">
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
              <button className="hover:text-gray-700 transition">Contact Support</button>
              <span className="text-gray-300">•</span>
              <button className="hover:text-gray-700 transition">Privacy Policy</button>
              <span className="text-gray-300">•</span>
              <button className="hover:text-gray-700 transition">Terms of Service</button>
              <span className="text-gray-300">•</span>
              <button className="hover:text-gray-700 transition">Security</button>
            </div>
            <div className="mt-4 text-center text-xs text-gray-400">
              <p>Need help? Our support team is available 24/7</p>
              <p className="mt-1">© {new Date().getFullYear()} BrandMize Inc. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}