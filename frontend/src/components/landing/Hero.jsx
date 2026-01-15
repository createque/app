import React from 'react';
import { Button } from '../ui/button';
import { Play, ArrowRight, QrCode, Award, Zap, Image } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#F8FAFC] to-white">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #0066FF 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>
      
      {/* Floating accent shapes */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-[#0066FF]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#00CC88]/5 rounded-full blur-3xl" />
      
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 relative">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <div className="max-w-xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0066FF]/10 text-[#0066FF] text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              <span>Nowa wersja 2.0 już dostępna</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#1A1A1A] leading-tight mb-6">
              Centralna kontrola{' '}
              <span className="text-[#0066FF]">zasobami</span>,{' '}
              <span className="text-[#00CC88]">ludźmi</span> i{' '}
              <span className="relative">
                procesami
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none">
                  <path d="M2 10C50 3 150 3 198 10" stroke="#00CC88" strokeWidth="3" strokeLinecap="round"/>
                </svg>
              </span>
            </h1>
            
            <p className="text-lg lg:text-xl text-[#1A1A1A]/70 mb-8 leading-relaxed">
              Wizualny kalendarz + QR + testy + ewaluacje + gamifikacja. 
              Wszystko, czego potrzebujesz do zarządzania zespołem w jednym miejscu.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Button 
                size="lg"
                className="bg-[#0066FF] hover:bg-[#0052CC] text-white px-8 py-6 text-base font-semibold shadow-xl shadow-[#0066FF]/25 transition-all hover:shadow-2xl hover:shadow-[#0066FF]/30 hover:-translate-y-0.5"
              >
                Spróbuj za darmo
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                variant="outline"
                size="lg"
                className="border-2 border-[#1A1A1A]/20 text-[#1A1A1A] hover:bg-[#1A1A1A]/5 hover:border-[#1A1A1A]/30 px-8 py-6 text-base font-semibold transition-all"
              >
                <Play className="w-5 h-5 mr-2" />
                Obejrzyj demo
              </Button>
            </div>
            
            {/* Trust indicators */}
            <div className="flex items-center gap-6 text-sm text-[#1A1A1A]/60">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-[#00CC88]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span>Bez karty kredytowej</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-[#00CC88]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span>14 dni za darmo</span>
              </div>
            </div>
          </div>
          
          {/* Hero Visual */}
          <div className="relative lg:pl-8">
            <div className="relative">
              {/* Main card */}
              <div className="bg-white rounded-2xl shadow-2xl shadow-[#1A1A1A]/10 p-6 lg:p-8 border border-gray-100">
                {/* Calendar preview */}
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-[#1A1A1A]">Kalendarz zespołu</h3>
                  <span className="text-sm text-[#1A1A1A]/50">Sierpień 2025</span>
                </div>
                
                <div className="grid grid-cols-7 gap-2 mb-6">
                  {['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'].map((day) => (
                    <div key={day} className="text-center text-xs text-[#1A1A1A]/50 font-medium py-2">
                      {day}
                    </div>
                  ))}
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                    <div
                      key={day}
                      className={`text-center text-sm py-2 rounded-lg transition-colors ${
                        day === 15
                          ? 'bg-[#0066FF] text-white font-semibold'
                          : day === 10 || day === 22
                          ? 'bg-[#00CC88]/20 text-[#00CC88] font-medium'
                          : 'text-[#1A1A1A]/70 hover:bg-gray-50'
                      }`}
                    >
                      {day <= 31 ? day : ''}
                    </div>
                  ))}
                </div>
                
                {/* Stats row */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#0066FF]">24</div>
                    <div className="text-xs text-[#1A1A1A]/50">Aktywni</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#00CC88]">98%</div>
                    <div className="text-xs text-[#1A1A1A]/50">Frekwencja</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#1A1A1A]">156</div>
                    <div className="text-xs text-[#1A1A1A]/50">Zadania</div>
                  </div>
                </div>
              </div>
              
              {/* Floating cards */}
              <div className="absolute -left-4 top-1/2 -translate-y-1/2 bg-white rounded-xl shadow-xl p-4 border border-gray-100 hidden lg:block animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#0066FF]/10 flex items-center justify-center">
                    <QrCode className="w-5 h-5 text-[#0066FF]" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[#1A1A1A]">QR Check-in</div>
                    <div className="text-xs text-[#00CC88]">+12 dzisiaj</div>
                  </div>
                </div>
              </div>
              
              <div className="absolute -right-4 bottom-20 bg-white rounded-xl shadow-xl p-4 border border-gray-100 hidden lg:block">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#00CC88]/10 flex items-center justify-center">
                    <Award className="w-5 h-5 text-[#00CC88]" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[#1A1A1A]">Nowa odznaka!</div>
                    <div className="text-xs text-[#1A1A1A]/50">Mistrz punktualności</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Hero Image Placeholder */}
        <div className="mt-16 flex justify-center">
          <div 
            className="w-full max-w-[600px] rounded-lg border border-gray-200 bg-[#F8F9FA] flex flex-col items-center justify-center py-16 px-6"
            style={{ boxShadow: '0 10px 40px rgba(0,0,0,0.15)' }}
          >
            <div className="w-16 h-16 rounded-xl bg-[#0066FF]/10 flex items-center justify-center mb-6">
              <Image className="w-8 h-8 text-[#0066FF]" strokeWidth={1.5} />
            </div>
            <p className="text-[#1A1A1A]/70 font-semibold text-center mb-2">
              [Hero Image Placeholder]
            </p>
            <p className="text-[#1A1A1A]/50 text-sm text-center leading-relaxed max-w-xs">
              Screenshot of TimeLov App with QR Code visible<br />
              Will be replaced with actual app screenshot
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
