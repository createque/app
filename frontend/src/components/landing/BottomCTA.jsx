import React from 'react';
import { Button } from '../ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';

const BottomCTA = () => {
  return (
    <section className="py-20 lg:py-28 bg-[#1A1A1A] relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#0066FF]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#00CC88]/10 rounded-full blur-3xl" />
      </div>
      
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-3xl mx-auto text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#0066FF]/20 mb-8">
            <Sparkles className="w-8 h-8 text-[#0066FF]" />
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Gotowy na{' '}
            <span className="text-[#0066FF]">transformację</span>?
          </h2>
          
          <p className="text-lg lg:text-xl text-white/70 mb-10 max-w-xl mx-auto">
            Zacznij już dziś. Bez karty kredytowej. 
            Dołącz do tysięcy firm, które zaufali TimeLov.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              className="bg-[#0066FF] hover:bg-[#0052CC] text-white px-8 py-6 text-base font-semibold shadow-xl shadow-[#0066FF]/30 transition-all hover:shadow-2xl hover:shadow-[#0066FF]/40 hover:-translate-y-0.5"
            >
              Spróbuj za darmo
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              variant="outline"
              size="lg"
              className="border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50 px-8 py-6 text-base font-semibold transition-all"
            >
              Zaplanuj demo
            </Button>
          </div>
          
          {/* Trust badges */}
          <div className="flex items-center justify-center gap-8 mt-12 pt-8 border-t border-white/10">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">1000+</div>
              <div className="text-sm text-white/50">Aktywnych firm</div>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div className="text-center">
              <div className="text-2xl font-bold text-white">50k+</div>
              <div className="text-sm text-white/50">Użytkowników</div>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div className="text-center">
              <div className="text-2xl font-bold text-white">4.9</div>
              <div className="text-sm text-white/50">Ocena</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BottomCTA;
