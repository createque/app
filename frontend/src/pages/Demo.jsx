import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Clock, Play, ArrowLeft, ArrowRight, Check, Calendar, QrCode, Award, BarChart3, Users, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const DemoPage = () => {
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: ''
  });

  const features = [
    {
      icon: Calendar,
      title: 'Wizualny kalendarz',
      description: 'Intuicyjny widok harmonogramu zespołu'
    },
    {
      icon: QrCode,
      title: 'System QR Check-in',
      description: 'Szybka rejestracja obecności kodem QR'
    },
    {
      icon: Award,
      title: 'Gamifikacja',
      description: 'Odznaki, punkty i rankingi motywacyjne'
    },
    {
      icon: BarChart3,
      title: 'Analityka',
      description: 'Raporty i statystyki w czasie rzeczywistym'
    },
    {
      icon: Users,
      title: 'Zarządzanie zespołem',
      description: 'Pełna kontrola nad zasobami ludzkimi'
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/demo/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setSubmitted(true);
        toast.success('Prośba o demo została wysłana!');
      } else {
        toast.error('Wystąpił błąd. Spróbuj ponownie.');
      }
    } catch (err) {
      toast.error('Błąd połączenia z serwerem');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0A0A0B]/95 backdrop-blur-sm border-b border-white/5">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-[#0066FF] flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">TimeLov</span>
            </Link>
            <div className="flex items-center gap-3">
              <Link to="/signin">
                <Button variant="ghost" className="text-white hover:bg-white/10">
                  Zaloguj się
                </Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-[#0066FF] hover:bg-[#0052CC] text-white">
                  Spróbuj za darmo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative">
        {/* Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#0066FF]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#00CC88]/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 relative">
          {/* Back link */}
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Wróć do strony głównej
          </Link>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            {/* Left Column - Info */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0066FF]/20 text-[#0066FF] text-sm font-medium mb-6">
                <Play className="w-4 h-4" />
                <span>Demo produktu</span>
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                Zobacz TimeLov{' '}
                <span className="text-[#00CC88]">w akcji</span>
              </h1>

              <p className="text-lg text-white/70 mb-8">
                Odkryj, jak TimeLov może usprawnić zarządzanie Twoim zespołem. 
                Obejrzyj interaktywne demo lub umów się na prezentację z naszym ekspertem.
              </p>

              {/* Features */}
              <div className="space-y-4 mb-8">
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div key={index} className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-[#0066FF]/20 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-[#0066FF]" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{feature.title}</h3>
                        <p className="text-sm text-white/60">{feature.description}</p>
                      </div>
                    </div>
                  );
                })}              </div>

              {/* Video placeholder */}
              <div className="aspect-video rounded-xl bg-[#1A1A1C] border border-white/10 flex items-center justify-center group cursor-pointer hover:border-[#0066FF]/50 transition-colors">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-[#0066FF]/20 flex items-center justify-center mx-auto mb-4 group-hover:bg-[#0066FF]/30 transition-colors">
                    <Play className="w-8 h-8 text-[#0066FF]" />
                  </div>
                  <p className="text-white/70">Obejrzyj prezentację wideo</p>
                  <p className="text-sm text-white/40">3 minuty</p>
                </div>
              </div>
            </div>

            {/* Right Column - Form */}
            <div className="bg-[#1A1A1C] rounded-2xl p-8 border border-white/10">
              {!showRequestForm ? (
                <>
                  <h2 className="text-2xl font-bold text-white mb-4">
                    Wybierz opcję demo
                  </h2>

                  <div className="space-y-4 mb-8">
                    {/* Option 1: Instant Demo */}
                    <Link to="/signup">
                      <div className="p-6 rounded-xl bg-[#0066FF]/10 border border-[#0066FF]/30 hover:border-[#0066FF] transition-colors cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-white mb-1">Natychmiastowy dostęp</h3>
                            <p className="text-sm text-white/60">Załóż darmowe konto i testuj od razu</p>
                          </div>
                          <ArrowRight className="w-5 h-5 text-[#0066FF]" />
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-sm text-[#00CC88]">
                          <Check className="w-4 h-4" />
                          <span>14 dni za darmo, bez karty kredytowej</span>
                        </div>
                      </div>
                    </Link>

                    {/* Option 2: Guided Demo */}
                    <div 
                      onClick={() => setShowRequestForm(true)}
                      className="p-6 rounded-xl bg-[#1A1A1C] border border-white/10 hover:border-white/30 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-white mb-1">Prezentacja z ekspertem</h3>
                          <p className="text-sm text-white/60">Umów się na indywidualne demo</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-white/50" />
                      </div>
                      <div className="mt-4 flex items-center gap-2 text-sm text-white/50">
                        <Clock className="w-4 h-4" />
                        <span>30-minutowa prezentacja online</span>
                      </div>
                    </div>
                  </div>

                  {/* Trust indicators */}
                  <div className="pt-6 border-t border-white/10">
                    <p className="text-sm text-white/50 text-center mb-4">Zaufali nam</p>
                    <div className="flex items-center justify-center gap-6">
                      <div className="text-center">
                        <div className="text-xl font-bold text-white">1000+</div>
                        <div className="text-xs text-white/40">firm</div>
                      </div>
                      <div className="w-px h-8 bg-white/10" />
                      <div className="text-center">
                        <div className="text-xl font-bold text-white">50k+</div>
                        <div className="text-xs text-white/40">użytkowników</div>
                      </div>
                      <div className="w-px h-8 bg-white/10" />
                      <div className="text-center">
                        <div className="text-xl font-bold text-white">4.9</div>
                        <div className="text-xs text-white/40">ocena</div>
                      </div>
                    </div>
                  </div>
                </>
              ) : submitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-[#00CC88]/20 flex items-center justify-center mx-auto mb-6">
                    <Check className="w-8 h-8 text-[#00CC88]" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Dziękujemy!</h2>
                  <p className="text-white/60 mb-6">
                    Twoja prośba została wysłana. Nasz zespół skontaktuje się z Tobą w ciągu 24 godzin.
                  </p>
                  <Link to="/signup">
                    <Button className="bg-[#0066FF] hover:bg-[#0052CC] text-white">
                      Załóż konto w międzyczasie
                    </Button>
                  </Link>
                </div>
              ) : (
                <>
                  <button 
                    onClick={() => setShowRequestForm(false)}
                    className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Wróć
                  </button>

                  <h2 className="text-2xl font-bold text-white mb-2">
                    Umów prezentację
                  </h2>
                  <p className="text-white/60 mb-6">
                    Wypełnij formularz, a nasz ekspert skontaktuje się z Tobą.
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-gray-300">Imię i nazwisko *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        required
                        className="bg-[#0F0F10] border-gray-700 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-gray-300">Email służbowy *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        required
                        className="bg-[#0F0F10] border-gray-700 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="company" className="text-gray-300">Nazwa firmy *</Label>
                      <Input
                        id="company"
                        value={formData.company}
                        onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                        required
                        className="bg-[#0F0F10] border-gray-700 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-gray-300">Telefon (opcjonalnie)</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        className="bg-[#0F0F10] border-gray-700 text-white"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-[#0066FF] hover:bg-[#0052CC] text-white py-6"
                    >
                      {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        'Wyślij prośbę o demo'
                      )}
                    </Button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DemoPage;
