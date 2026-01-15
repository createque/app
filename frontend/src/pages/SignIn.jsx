import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';
import { Clock, Eye, EyeOff, Loader2, ArrowLeft, AlertCircle } from 'lucide-react';
import { validateEmail } from '../lib/validators';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const SignInPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      setError(emailValidation.error);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          remember_me: rememberMe
        })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('userAccessToken', data.access_token);
        localStorage.setItem('userRefreshToken', data.refresh_token);
        toast.success('Zalogowano pomyślnie!');
        navigate('/app/dashboard');
      } else if (response.status === 429) {
        setError('Zbyt wiele prób logowania. Spróbuj ponownie później.');
      } else {
        // Generic error to prevent user enumeration
        setError('Nieprawidłowy email lub hasło');
      }
    } catch (err) {
      setError('Błąd połączenia z serwerem');
    } finally {
      setLoading(false);
    }
  };

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
              <p className="text-sm text-gray-400">Zaloguj się do aplikacji</p>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-6">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jan@firma.pl"
                required
                data-testid="signin-email-input"
                className="bg-[#0F0F10] border-gray-700 text-white placeholder:text-gray-500"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-gray-300">Hasło</Label>
                <Link 
                  to="/forgot-password" 
                  className="text-sm text-[#0066FF] hover:underline"
                >
                  Zapomniałem hasła
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  data-testid="signin-password-input"
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
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={setRememberMe}
                className="border-gray-600 data-[state=checked]:bg-[#0066FF]"
              />
              <Label htmlFor="remember" className="text-sm text-gray-400">
                Zapamiętaj mnie
              </Label>
            </div>

            <Button
              type="submit"
              disabled={loading}
              data-testid="signin-submit-button"
              className="w-full bg-[#0066FF] hover:bg-[#0052CC] text-white py-6 font-semibold"
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

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-[#1A1A1C] px-4 text-gray-500">lub</span>
            </div>
          </div>

          {/* Sign up link */}
          <p className="text-center text-gray-400">
            Nie masz konta?{' '}
            <Link to="/signup" className="text-[#0066FF] hover:underline font-medium">
              Zarejestruj się
            </Link>
          </p>
        </div>

        {/* Admin link */}
        <p className="mt-4 text-center text-sm text-gray-500">
          Jesteś administratorem?{' '}
          <Link to="/admin/login" className="text-gray-400 hover:text-white">
            Panel administracyjny
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignInPage;
