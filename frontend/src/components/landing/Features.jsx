import React from 'react';
import { Card, CardContent } from '../ui/card';

// Custom SVG Icons - 60x60 with stroke-width 2
const CalendarIcon = ({ color }) => (
  <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="8" y="12" width="44" height="40" rx="4" stroke={color} strokeWidth="2" fill="none"/>
    <path d="M8 22H52" stroke={color} strokeWidth="2"/>
    <path d="M18 8V16" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M42 8V16" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <rect x="16" y="30" width="8" height="6" rx="1" fill={color}/>
    <rect x="26" y="30" width="8" height="6" rx="1" fill={color} fillOpacity="0.4"/>
    <rect x="36" y="30" width="8" height="6" rx="1" fill={color} fillOpacity="0.4"/>
    <rect x="16" y="40" width="8" height="6" rx="1" fill={color} fillOpacity="0.4"/>
    <rect x="26" y="40" width="8" height="6" rx="1" fill={color} fillOpacity="0.4"/>
  </svg>
);

const QRCodeIcon = ({ color }) => (
  <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="8" y="8" width="18" height="18" rx="2" stroke={color} strokeWidth="2" fill="none"/>
    <rect x="12" y="12" width="10" height="10" rx="1" fill={color}/>
    <rect x="34" y="8" width="18" height="18" rx="2" stroke={color} strokeWidth="2" fill="none"/>
    <rect x="38" y="12" width="10" height="10" rx="1" fill={color}/>
    <rect x="8" y="34" width="18" height="18" rx="2" stroke={color} strokeWidth="2" fill="none"/>
    <rect x="12" y="38" width="10" height="10" rx="1" fill={color}/>
    <rect x="34" y="34" width="6" height="6" fill={color}/>
    <rect x="44" y="34" width="8" height="6" fill={color}/>
    <rect x="34" y="44" width="6" height="8" fill={color}/>
    <rect x="44" y="46" width="8" height="6" fill={color}/>
  </svg>
);

const StarIcon = ({ color }) => (
  <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M30 8L36.18 22.82L52 24.82L40.5 35.68L43.36 51.32L30 43.66L16.64 51.32L19.5 35.68L8 24.82L23.82 22.82L30 8Z" stroke={color} strokeWidth="2" strokeLinejoin="round" fill="none"/>
    <path d="M30 16L33.82 25.16L44 26.66L36.75 33.58L38.64 43.64L30 38.66L21.36 43.64L23.25 33.58L16 26.66L26.18 25.16L30 16Z" fill={color} fillOpacity="0.2"/>
  </svg>
);

const ChecklistIcon = ({ color }) => (
  <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="8" width="40" height="44" rx="4" stroke={color} strokeWidth="2" fill="none"/>
    <path d="M18 22L22 26L28 18" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M34 22H42" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M18 34L22 38L28 30" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M34 34H42" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <circle cx="23" cy="46" r="3" stroke={color} strokeWidth="2" fill="none"/>
    <path d="M34 46H42" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const TrophyIcon = ({ color }) => (
  <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 12H42V28C42 34.627 36.627 40 30 40C23.373 40 18 34.627 18 28V12Z" stroke={color} strokeWidth="2" fill="none"/>
    <path d="M18 16H10C10 16 10 26 18 26" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none"/>
    <path d="M42 16H50C50 16 50 26 42 26" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none"/>
    <path d="M30 40V46" stroke={color} strokeWidth="2"/>
    <path d="M22 52H38" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M24 46H36V52H24V46Z" stroke={color} strokeWidth="2" fill="none"/>
    <path d="M26 20L28 24L32 24.5L29 27.5L30 32L26 29.5L22 32L23 27.5L20 24.5L24 24L26 20Z" fill={color}/>
  </svg>
);

const UserIcon = ({ color }) => (
  <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="30" cy="20" r="10" stroke={color} strokeWidth="2" fill="none"/>
    <path d="M12 52C12 42.059 20.059 34 30 34C39.941 34 48 42.059 48 52" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none"/>
    <circle cx="30" cy="20" r="5" fill={color} fillOpacity="0.2"/>
  </svg>
);

const ChatIcon = ({ color }) => (
  <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 14C10 11.791 11.791 10 14 10H46C48.209 10 50 11.791 50 14V38C50 40.209 48.209 42 46 42H22L12 50V42H14C11.791 42 10 40.209 10 38V14Z" stroke={color} strokeWidth="2" fill="none"/>
    <circle cx="22" cy="26" r="3" fill={color}/>
    <circle cx="30" cy="26" r="3" fill={color}/>
    <circle cx="38" cy="26" r="3" fill={color}/>
  </svg>
);

const GearsIcon = ({ color }) => (
  <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="24" r="8" stroke={color} strokeWidth="2" fill="none"/>
    <circle cx="24" cy="24" r="3" fill={color}/>
    <path d="M24 12V8M24 40V36M36 24H40M8 24H12M33.5 14.5L36.3 11.7M11.7 36.3L14.5 33.5M33.5 33.5L36.3 36.3M11.7 11.7L14.5 14.5" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <circle cx="40" cy="40" r="6" stroke={color} strokeWidth="2" fill="none"/>
    <circle cx="40" cy="40" r="2" fill={color}/>
    <path d="M40 31V28M40 52V49M49 40H52M28 40H31M47 33L49.1 30.9M30.9 49.1L33 47M47 47L49.1 49.1M30.9 30.9L33 33" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const Features = () => {
  const features = [
    {
      icon: CalendarIcon,
      title: 'Wizualny Kalendarz',
      description: 'Intuicyjny kalendarz zespołowy z drag & drop. Planuj zmiany, urlopy i spotkania w jednym miejscu.',
      color: '#0066FF',
      status: 'available'
    },
    {
      icon: QRCodeIcon,
      title: 'System QR',
      description: 'Szybkie meldowanie i wymeldowanie pracowników. Automatyczne śledzenie obecności w czasie rzeczywistym.',
      color: '#0066FF',
      status: 'available'
    },
    {
      icon: StarIcon,
      title: 'System Ewaluacji',
      description: 'Regularne oceny pracowników z konfigurowalnymi kryteriami. Śledź postępy i rozwój zespołu.',
      color: '#0066FF',
      status: 'available'
    },
    {
      icon: ChecklistIcon,
      title: 'System Testów',
      description: 'Twórz i przeprowadzaj testy wiedzy. Automatyczne ocenianie i szczegółowe raporty wyników.',
      color: '#0066FF',
      status: 'available'
    },
    {
      icon: TrophyIcon,
      title: 'Gamifikacja',
      description: 'Motywuj zespół poprzez odznaki, punkty i rankingi. Zwiększ zaangażowanie przez rywalizację.',
      color: '#0066FF',
      status: 'available'
    },
    {
      icon: UserIcon,
      title: 'Profile Pracowników',
      description: 'Kompletne profile z historią, umiejętnościami i osiągnięciami. Wszystkie dane w jednym miejscu.',
      color: '#0066FF',
      status: 'available'
    },
    {
      icon: ChatIcon,
      title: 'Komunikator',
      description: 'Wbudowany system wiadomości dla zespołu. Szybka komunikacja bez zewnętrznych narzędzi.',
      color: '#0066FF',
      status: 'planned'
    },
    {
      icon: GearsIcon,
      title: 'Automatyzacja',
      description: 'Automatyzuj powtarzalne zadania i procesy. Oszczędź czas na tym, co ważne.',
      color: '#0066FF',
      status: 'planned'
    }
  ];

  return (
    <section id="features" className="py-20 lg:py-28 bg-white">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00CC88]/10 text-[#00CC88] text-sm font-medium mb-4">
            <span>Pełna funkcjonalność</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1A1A1A] mb-6">
            Wszystko, czego potrzebujesz
          </h2>
          <p className="text-lg text-[#1A1A1A]/70">
            Kompleksowe narzędzie do zarządzania zespołem. Od planowania po gamifikację – masz wszystko w jednym miejscu.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isPlanned = feature.status === 'planned';
            
            return (
              <Card 
                key={index} 
                className={`group relative overflow-hidden border-0 shadow-lg shadow-gray-100/50 hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 hover:-translate-y-1 ${
                  isPlanned ? 'bg-gray-50/50' : 'bg-white'
                }`}
              >
                {isPlanned && (
                  <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-[#6B7280]/15 text-[#6B7280] text-xs font-medium uppercase tracking-wide">
                    Wkrótce
                  </div>
                )}
                
                <CardContent className="p-6">
                  <div className="mb-4">
                    <Icon color={feature.color} />
                  </div>
                  
                  <h3 className={`text-lg font-semibold mb-3 ${
                    isPlanned ? 'text-[#1A1A1A]/70' : 'text-[#1A1A1A]'
                  }`}>
                    {feature.title}
                  </h3>
                  
                  <p className={`text-sm leading-relaxed ${
                    isPlanned ? 'text-[#1A1A1A]/50' : 'text-[#1A1A1A]/60'
                  }`}>
                    {feature.description}
                  </p>
                </CardContent>
                
                {/* Hover accent */}
                <div 
                  className="absolute bottom-0 left-0 right-0 h-1 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
                  style={{ backgroundColor: feature.color }}
                />
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
