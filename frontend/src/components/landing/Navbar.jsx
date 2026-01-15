import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '../ui/sheet';
import { Menu, X, Clock } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { label: 'Funkcje', href: '#features' },
    { label: 'Cennik', href: '#pricing-widget' },
    { label: 'Opinie', href: '#testimonials-widget' },
    { label: 'FAQ', href: '#faq-widget' },
    { label: 'Blog', href: '#blog-widget' },
  ];

  const scrollToSection = (href) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <nav className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-[#0066FF] flex items-center justify-center transition-transform group-hover:scale-105">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-[#1A1A1A] tracking-tight">TimeLov</span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => scrollToSection(link.href)}
                className="text-[#1A1A1A]/70 hover:text-[#0066FF] font-medium transition-colors text-sm"
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <Button
              variant="ghost"
              className="text-[#1A1A1A] hover:text-[#0066FF] hover:bg-[#0066FF]/5"
            >
              Zaloguj się
            </Button>
            <Button
              className="bg-[#0066FF] hover:bg-[#0052CC] text-white px-6 shadow-lg shadow-[#0066FF]/20 transition-all hover:shadow-xl hover:shadow-[#0066FF]/30"
            >
              Spróbuj za darmo
            </Button>
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="text-[#1A1A1A]">
                <Menu className="w-6 h-6" />
                <span className="sr-only">Otwórz menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-[350px] bg-white">
              <SheetTitle className="sr-only">Menu nawigacyjne</SheetTitle>
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-8 mt-2">
                  <a href="/" className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-[#0066FF] flex items-center justify-center">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl font-bold text-[#1A1A1A]">TimeLov</span>
                  </a>
                </div>
                
                <nav className="flex flex-col gap-2">
                  {navLinks.map((link) => (
                    <button
                      key={link.label}
                      onClick={() => scrollToSection(link.href)}
                      className="text-left text-lg text-[#1A1A1A]/80 hover:text-[#0066FF] py-3 px-4 rounded-lg hover:bg-[#0066FF]/5 transition-all font-medium"
                    >
                      {link.label}
                    </button>
                  ))}
                </nav>
                
                <div className="mt-auto pt-8 flex flex-col gap-3">
                  <Button
                    variant="outline"
                    className="w-full border-[#1A1A1A]/20 text-[#1A1A1A] hover:bg-[#0066FF]/5 hover:border-[#0066FF]"
                  >
                    Zaloguj się
                  </Button>
                  <Button
                    className="w-full bg-[#0066FF] hover:bg-[#0052CC] text-white shadow-lg shadow-[#0066FF]/20"
                  >
                    Spróbuj za darmo
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
