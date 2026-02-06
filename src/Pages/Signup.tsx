import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Check, MessageCircle, Zap, Users, Shield } from 'lucide-react';
import { api, setAccessToken } from '../Helpers/BackendRequest';


interface SignupFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

interface ValidationErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  company?: string;
  phone?: string;
  jobRole?: string;
  agreeToTerms?: string;
}

export function Signup() {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<SignupFormData>(() => ({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  }));

  const [errors, setErrors] = useState<ValidationErrors>({});

  const validateStep1 = () => {
    const newErrors: ValidationErrors = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }


    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: ValidationErrors = {};
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and numbers';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof SignupFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field as keyof ValidationErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep2()) return;
    
    setError('');
    setIsLoading(true);

    try {
      const { firstName, lastName, email, password } = formData;

      await api.post('/auth/signup', {
        name: `${firstName} ${lastName}`.trim(),
        email,
        password,
      });

      setSuccess(true);
      
      // Auto login after successful signup
      const loginResponse = await api.post('/auth/signin', {
        email,
        password,
      });

      const { access_token, user } = loginResponse.data;
      setAccessToken(access_token);
      localStorage.setItem('user', JSON.stringify(user));
      if (user?.role) {
        localStorage.setItem("role", String(user.role));
      }

      // Redirect after 2 seconds
      setTimeout(() => {
        window.location.href = user?.role === "admin" ? "/admin/dashboard" : "/dashboard";
      }, 2000);

    } catch (err: any) {
      setError(
        err.response?.data?.message || 
        err.response?.data?.detail || 
        'Something went wrong. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
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
              <MessageCircle className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Brand<span className="text-primary-200">Mize</span></h1>
              <p className="text-primary-100 text-sm mt-1">Professional Communication Suite</p>
            </div>
          </div>

          {/* Hero Content */}
          <div className="max-w-lg">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-white/20">
              <Zap className="w-4 h-4 text-white" />
              <span className="text-white text-sm font-medium">Join 5,000+ Support Teams</span>
            </div>
            
            <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
              Build better
              <br />
              <span className="text-accent-300">customer relationships</span>
            </h2>
            
            <div className="space-y-4 mb-12">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <span className="text-white/90">Unify all customer conversations in one place</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <span className="text-white/90">Enterprise security & GDPR compliance</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <span className="text-white/90">AI-powered responses & automations</span>
              </div>
            </div>
          </div>

          {/* Testimonials */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="flex items-start space-x-4">
              <div className="flex-1">
                <p className="text-white/90 italic mb-3">
                  "BrandMize transformed our support operations. Response times improved by 60% and customer satisfaction skyrocketed."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold text-white">
                    SJ
                  </div>
                  <div className="ml-3">
                    <p className="text-white font-medium">Sarah Johnson</p>
                    <p className="text-primary-100 text-sm">Support Director, TechCorp</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 lg:p-12">
        <div className="w-full max-w-md">
          {/* Progress Steps */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step >= 1 ? 'bg-primary-500 border-primary-500 text-white' : 'border-gray-300 text-gray-400'}`}>
                  {step > 1 ? <Check className="w-5 h-5" /> : '1'}
                </div>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step >= 2 ? 'bg-primary-500 border-primary-500 text-white' : 'border-gray-300 text-gray-400'}`}>
                  {step > 2 ? <Check className="w-5 h-5" /> : '2'}
                </div>
              </div>
              <div className="text-sm text-gray-500">
                Step {step} of 2
              </div>
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900">
              {step === 1 ? 'Create your account' : 'Secure your account'}
            </h2>
            <p className="text-gray-600 mt-2">
              {step === 1 ? 'Start your 14-day free trial. No credit card required.' : 'Set up your password and preferences.'}
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl flex items-start space-x-4">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Check className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-green-900 mb-1">Account created successfully!</h3>
                <p className="text-green-700 text-sm">Redirecting to your dashboard...</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && !success && (
            <div className="mb-6 p-6 bg-red-50 border border-red-200 rounded-2xl flex items-start space-x-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-red-900 mb-1">Registration failed</h3>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Personal Information */}
            {step === 1 && (
              <div className="space-y-6">
                {/* Name Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                      First name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="firstName"
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className={`block w-full pl-12 pr-4 py-3.5 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:bg-white focus:outline-none transition-all duration-200 placeholder:text-gray-400 ${errors.firstName ? 'ring-2 ring-red-500' : ''}`}
                        placeholder="John"
                      />
                    </div>
                    {errors.firstName && (
                      <p className="mt-2 text-sm text-red-600">{errors.firstName}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                      Last name
                    </label>
                    <div className="relative">
                      <input
                        id="lastName"
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className={`block w-full pl-4 pr-4 py-3.5 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:bg-white focus:outline-none transition-all duration-200 placeholder:text-gray-400 ${errors.lastName ? 'ring-2 ring-red-500' : ''}`}
                        placeholder="Doe"
                      />
                    </div>
                    {errors.lastName && (
                      <p className="mt-2 text-sm text-red-600">{errors.lastName}</p>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Work email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`block w-full pl-12 pr-4 py-3.5 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:bg-white focus:outline-none transition-all duration-200 placeholder:text-gray-400 ${errors.email ? 'ring-2 ring-red-500' : ''}`}
                      placeholder="you@company.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

      

               

                {/* Next Button */}
                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white font-semibold py-4 px-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center group"
                >
                  Continue to security
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            )}

            {/* Step 2: Password & Terms */}
            {step === 2 && (
              <div className="space-y-6">
                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Create password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className={`block w-full pl-12 pr-12 py-3.5 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:bg-white focus:outline-none transition-all duration-200 placeholder:text-gray-400 ${errors.password ? 'ring-2 ring-red-500' : ''}`}
                      placeholder="Create a strong password"
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
                  {errors.password ? (
                    <p className="mt-2 text-sm text-red-600">{errors.password}</p>
                  ) : (
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      <div className={`h-1 rounded-full ${formData.password.length >= 8 ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                      <div className={`h-1 rounded-full ${/(?=.*[a-z])(?=.*[A-Z])/.test(formData.password) ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                      <div className={`h-1 rounded-full ${/\d/.test(formData.password) ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className={`block w-full pl-12 pr-12 py-3.5 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:bg-white focus:outline-none transition-all duration-200 placeholder:text-gray-400 ${errors.confirmPassword ? 'ring-2 ring-red-500' : ''}`}
                      placeholder="Re-enter your password"
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
                  {errors.confirmPassword && (
                    <p className="mt-2 text-sm text-red-600">{errors.confirmPassword}</p>
                  )}
                </div>

                {/* Terms & Newsletter */}
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <button
                      type="button"
                      onClick={() => handleInputChange('agreeToTerms', !formData.agreeToTerms)}
                      className="flex-shrink-0 mt-1"
                    >
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${formData.agreeToTerms ? 'bg-primary-500 border-primary-500' : 'border-gray-300'}`}>
                        {formData.agreeToTerms && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>
                    </button>
                    <div>
                      <p className="text-sm text-gray-700">
                        I agree to the{' '}
                        <button type="button" className="text-primary-600 hover:text-primary-700 font-medium">
                          Terms of Service
                        </button>
                        {' '}and{' '}
                        <button type="button" className="text-primary-600 hover:text-primary-700 font-medium">
                          Privacy Policy
                        </button>
                      </p>
                      {errors.agreeToTerms && (
                        <p className="mt-1 text-sm text-red-600">{errors.agreeToTerms}</p>
                      )}
                    </div>
                  </div>

              
                </div>

                {/* Submit & Back Buttons */}
                <div className="space-y-4">
                  <button
                    type="submit"
                    disabled={isLoading || success || !formData.agreeToTerms}
                    className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white font-semibold py-4 px-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Creating account...
                      </span>
                    ) : success ? (
                      <span className="flex items-center justify-center">
                        <Check className="w-5 h-5 mr-2" />
                        Account Created!
                      </span>
                    ) : (
                      'Create Account'
                    )}
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleBack}
                    className="w-full py-3.5 px-4 border border-gray-200 rounded-2xl bg-white hover:bg-gray-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 text-gray-700 font-medium"
                  >
                    Back to personal info
                  </button>
                </div>
              </div>
            )}
          </form>

          {/* Divider */}
          {/* <div className="my-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Or sign up with</span>
              </div>
            </div>
          </div> */}

          {/* Social Signup */}
          {/* <div className="space-y-3">
            <button
              type="button"
              disabled={isLoading}
              className="w-full flex items-center justify-center py-3.5 px-4 border border-gray-200 rounded-2xl bg-white hover:bg-gray-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 group"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-gray-700 font-medium group-hover:text-gray-900 transition">Continue with Google</span>
            </button>
          </div> */}

          {/* Login Link */}
          <div className="mt-12 text-center">
            <p className="text-gray-600 text-sm">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => window.location.href = '/login'}
                className="text-primary-600 hover:text-primary-700 font-semibold transition"
                disabled={isLoading}
              >
                Sign in here
              </button>
            </p>
          </div>

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
              <p>14-day free trial • No credit card required • Cancel anytime</p>
              <p className="mt-1">© {new Date().getFullYear()} BrandMize Inc. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}