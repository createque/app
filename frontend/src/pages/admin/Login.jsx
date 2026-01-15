import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Checkbox } from '../../components/ui/checkbox';
import { Clock, Eye, EyeOff, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';
import { validateEmail, validatePassword } from '../../lib/validators';
import PasswordStrength from '../../components/ui/PasswordStrength';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading, error, clearError } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState({ type: '', text: '' });
  const [emailError, setEmailError] = useState('');
  
  const { requestPasswordReset, resetPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    
    // Validate email format
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      setEmailError(emailValidation.error);
      return;
    }
    setEmailError('');
    
    const result = await login(email, password, rememberMe);
    
    if (result.success) {
      // Redirect to intended page or dashboard
      const from = location.state?.from?.pathname || '/admin/dashboard';
      navigate(from, { replace: true });
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetLoading(true);
    setResetMessage({ type: '', text: '' });
    
    // Validate password strength
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      setResetMessage({ 
        type: 'error', 
        text: 'Hasło nie spełnia wymagań bezpieczeństwa' 
      });
      setResetLoading(false);
      return;
    }
    
    // Check passwords match
    if (newPassword !== confirmPassword) {
      setResetMessage({ type: 'error', text: 'Hasła nie są identyczne' });
      setResetLoading(false);
      return;
    }
    
    const result = await resetPassword(resetToken, newPassword);
    setResetMessage({ 
      type: result.success ? 'success' : 'error', 
      text: result.message 
    });
    setResetLoading(false);
    
    if (result.success) {
      setTimeout(() => {
        setShowResetPassword(false);
        setShowForgotPassword(false);
        setResetToken('');
        setNewPassword('');
        setConfirmPassword('');
      }, 2000);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotMessage('');
    
    const result = await requestPasswordReset(forgotEmail);
    setForgotMessage(result.message);
    setForgotLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0F0F10] flex items-center justify-center px-4">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#0066FF]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#00CC88]/10 rounded-full blur-3xl" />
      </div>
      
      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-2 group">
            <div className="w-12 h-12 rounded-xl bg-[#0066FF] flex items-center justify-center transition-transform group-hover:scale-105">
              <Clock className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">TimeLov</span>
          </a>
          <p className="mt-2 text-gray-400">Panel Administracyjny</p>
        </div>
        
        {/* Login Card */}
        <div className="bg-[#1A1A1C] rounded-2xl border border-gray-800 p-8 shadow-2xl">
          {!showForgotPassword ? (
            <>
              <h1 className="text-2xl font-bold text-white mb-6 text-center">
                Zaloguj się
              </h1>
              
              {error && (
                <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-5" data-testid="login-form">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-300">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@timelov.pl"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                    required
                    data-testid="login-email-input"
                    className={`bg-[#0F0F10] border-gray-700 text-white placeholder:text-gray-500 focus:border-[#0066FF] focus:ring-[#0066FF]/20 ${emailError ? 'border-red-500' : ''}`}
                  />
                  {emailError && (
                    <p className="text-xs text-red-400">{emailError}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-300">
                    Hasło
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      data-testid="login-password-input"
                      className="bg-[#0F0F10] border-gray-700 text-white placeholder:text-gray-500 focus:border-[#0066FF] focus:ring-[#0066FF]/20 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={setRememberMe}
                      className="border-gray-600 data-[state=checked]:bg-[#0066FF] data-[state=checked]:border-[#0066FF]"
                    />
                    <Label htmlFor="remember" className="text-sm text-gray-400 cursor-pointer">
                      Zapamiętaj mnie
                    </Label>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm text-[#0066FF] hover:text-[#0066FF]/80 transition-colors"
                  >
                    Zapomniałem hasła
                  </button>
                </div>
                
                <Button
                  type="submit"
                  disabled={loading}
                  data-testid="login-submit-button"
                  className="w-full bg-[#0066FF] hover:bg-[#0052CC] text-white py-6 font-semibold transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Logowanie...
                    </>
                  ) : (
                    'Zaloguj się'
                  )}
                </Button>
              </form>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-white mb-2 text-center">
                Reset hasła
              </h1>
              <p className="text-gray-400 text-center mb-6 text-sm">
                Podaj swój email, a wyślemy Ci link do resetu hasła.
              </p>
              
              {forgotMessage && (
                <div className="mb-6 p-4 rounded-lg bg-[#00CC88]/10 border border-[#00CC88]/30">
                  <p className="text-[#00CC88] text-sm">{forgotMessage}</p>
                </div>
              )}
              
              <form onSubmit={handleForgotPassword} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="forgot-email" className="text-gray-300">
                    Email
                  </Label>
                  <Input
                    id="forgot-email"
                    type="email"
                    placeholder="admin@timelov.pl"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                    className="bg-[#0F0F10] border-gray-700 text-white placeholder:text-gray-500 focus:border-[#0066FF] focus:ring-[#0066FF]/20"
                  />
                </div>
                
                <Button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full bg-[#0066FF] hover:bg-[#0052CC] text-white py-6 font-semibold transition-all disabled:opacity-50"
                >
                  {forgotLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Wysyłanie...
                    </>
                  ) : (
                    'Wyślij link resetujący'
                  )}
                </Button>
                
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setForgotMessage('');
                  }}
                  className="w-full text-center text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Wróć do logowania
                </button>
              </form>
            </>
          )}
        </div>
        
        {/* Back to site link */}
        <div className="mt-6 text-center">
          <a 
            href="/" 
            className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
          >
            ← Wróć do strony głównej
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
