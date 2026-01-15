import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';
import { Clock, Eye, EyeOff, Loader2, ArrowLeft, Check } from 'lucide-react';
import { validateEmail, validatePassword } from '../lib/validators';
import PasswordStrength from '../components/ui/PasswordStrength';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const SignUpPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    companyName: '',
    acceptTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate email
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.valid) {
      setError(emailValidation.error);
      return;
    }

    // Validate password
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.valid) {
      setError('Hasło nie spełnia wymagań bezpieczeństwa');
      return;
    }

    // Check passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Hasła nie są identyczne');
      return;
    }

    // Check terms
    if (!formData.acceptTerms) {
      setError('Musisz zaakceptować regulamin');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          full_name: formData.fullName,
          company_name: formData.companyName
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        toast.success('Konto utworzone! Możesz się teraz zalogować.');
        setTimeout(() => navigate('/signin'), 2000);
      } else {
        setError(data.detail || 'Błąd podczas rejestracji');
      }
    } catch (err) {
      setError('Błąd połączenia z serwerem');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center p-4">
        <div className="bg-[#1A1A1C] rounded-2xl p-8 max-w-md w-full text-center border border-gray-800">
          <div className="w-16 h-16 bg-[#00CC88]/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-[#00CC88]" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Konto utworzone!</h2>
          <p className="text-gray-400 mb-6">Za chwilę zostaniesz przekierowany do strony logowania.</p>
          <Link to="/signin">
            <Button className="bg-[#0066FF] hover:bg-[#0052CC] text-white">
              Zaloguj się teraz
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center p-4">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#0066FF]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#00CC88]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Back link */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Wróć do strony głównej
        </Link>

        {/* Card */}
        <div className="bg-[#1A1A1C] rounded-2xl p-8 border border-gray-800 shadow-2xl">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-[#0066FF] flex items-center justify-center">
              <Clock className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">TimeLov</h1>
              <p className="text-sm text-gray-400">Utwórz konto</p>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-6">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-gray-300">Imię i nazwisko</Label>
              <Input
                id="fullName"
                type="text"
                value={formData.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                placeholder="Jan Kowalski"
                required
                data-testid="signup-fullname-input"
                className="bg-[#0F0F10] border-gray-700 text-white placeholder:text-gray-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyName" className="text-gray-300">Nazwa firmy (opcjonalnie)</Label>
              <Input
                id="companyName"
                type="text"
                value={formData.companyName}
                onChange={(e) => handleChange('companyName', e.target.value)}
                placeholder="Firma Sp. z o.o."
                data-testid="signup-company-input"
                className="bg-[#0F0F10] border-gray-700 text-white placeholder:text-gray-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="jan@firma.pl"
                required
                data-testid="signup-email-input"
                className="bg-[#0F0F10] border-gray-700 text-white placeholder:text-gray-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">Hasło</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder="••••••••"
                  required
                  data-testid="signup-password-input"
                  className="bg-[#0F0F10] border-gray-700 text-white placeholder:text-gray-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <PasswordStrength password={formData.password} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-300">Potwierdź hasło</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                placeholder="••••••••"
                required
                data-testid="signup-confirm-password-input"
                className="bg-[#0F0F10] border-gray-700 text-white placeholder:text-gray-500"
              />
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="terms"
                checked={formData.acceptTerms}
                onCheckedChange={(checked) => handleChange('acceptTerms', checked)}
                className="mt-1 border-gray-600 data-[state=checked]:bg-[#0066FF]"
              />
              <Label htmlFor="terms" className="text-sm text-gray-400">
                Akceptuję{' '}
                <a href="#" className="text-[#0066FF] hover:underline">regulamin</a>
                {' '}i{' '}
                <a href="#" className="text-[#0066FF] hover:underline">politykę prywatności</a>
              </Label>
            </div>

            <Button
              type="submit"
              disabled={loading}
              data-testid="signup-submit-button"
              className="w-full bg-[#0066FF] hover:bg-[#0052CC] text-white py-6 font-semibold"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Tworzenie konta...
                </>
              ) : (
                'Utwórz konto'
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-[#1A1A1C] px-4 text-gray-500">lub</span>
            </div>
          </div>

          {/* Sign in link */}
          <p className="text-center text-gray-400">
            Masz już konto?{' '}
            <Link to="/signin" className="text-[#0066FF] hover:underline font-medium">
              Zaloguj się
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
