import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '../ui/sheet';
import { Menu, X, Clock, ExternalLink } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { label: 'Funkcje', href: '#features', type: 'scroll' },
    { label: 'Cennik', href: '#pricing-widget', type: 'scroll' },
    { label: 'Opinie', href: '#testimonials-widget', type: 'scroll' },
    { label: 'FAQ', href: '#faq-widget', type: 'scroll' },
    { label: 'Blog', href: '#blog-widget', type: 'scroll' },
    { label: 'Roadmap', href: 'https://roadmap.timelove.pl', type: 'external' },
    { label: 'Dokumentacja', href: 'https://docs.timelove.pl', type: 'external' },
  ];

  const scrollToSection = (href) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsOpen(false);
  };

  const renderNavLink = (link) => {
    if (link.type === 'external') {
      return (
        <a
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#1A1A1A]/70 hover:text-[#0066FF] font-medium transition-colors text-sm inline-flex items-center gap-1"
        >
          {link.label}
          <ExternalLink className="w-3 h-3" />
        </a>
      );
    }
    return (
      <button
        key={link.label}
        onClick={() => scrollToSection(link.href)}
        className="text-[#1A1A1A]/70 hover:text-[#0066FF] font-medium transition-colors text-sm"
      >
        {link.label}
      </button>
    );
  };

  const renderMobileNavLink = (link) => {
    if (link.type === 'external') {
      return (
        <a
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => setIsOpen(false)}
          className="text-left text-lg text-[#1A1A1A]/80 hover:text-[#0066FF] py-3 px-4 rounded-lg hover:bg-[#0066FF]/5 transition-all font-medium flex items-center justify-between"
        >
          {link.label}
          <ExternalLink className="w-4 h-4" />
        </a>
      );
    }
    return (
      <button
        key={link.label}
        onClick={() => scrollToSection(link.href)}
        className="text-left text-lg text-[#1A1A1A]/80 hover:text-[#0066FF] py-3 px-4 rounded-lg hover:bg-[#0066FF]/5 transition-all font-medium"
      >
        {link.label}
      </button>
    );
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <nav className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-[#0066FF] flex items-center justify-center transition-transform group-hover:scale-105">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-[#1A1A1A] tracking-tight">TimeLov</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6">
            {navLinks.map(renderNavLink)}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <Link to="/signin">
              <Button
                variant="ghost"
                className="text-[#1A1A1A] hover:text-[#0066FF] hover:bg-[#0066FF]/5"
                data-testid="nav-signin-button"
              >
                Zaloguj się
              </Button>
            </Link>
            <Link to="/signup">
              <Button
                className="bg-[#0066FF] hover:bg-[#0052CC] text-white px-6 shadow-lg shadow-[#0066FF]/20 transition-all hover:shadow-xl hover:shadow-[#0066FF]/30"
                data-testid="nav-signup-button"
              >
                Spróbuj za darmo
              </Button>
            </Link>
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
                  <Link to="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
                    <div className="w-10 h-10 rounded-xl bg-[#0066FF] flex items-center justify-center">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl font-bold text-[#1A1A1A]">TimeLov</span>
                  </Link>
                </div>
                
                <nav className="flex flex-col gap-2">
                  {navLinks.map(renderMobileNavLink)}
                </nav>
                
                <div className="mt-auto pt-8 flex flex-col gap-3">
                  <Link to="/signin" onClick={() => setIsOpen(false)}>
                    <Button
                      variant="outline"
                      className="w-full border-[#1A1A1A]/20 text-[#1A1A1A] hover:bg-[#0066FF]/5 hover:border-[#0066FF]"
                    >
                      Zaloguj się
                    </Button>
                  </Link>
                  <Link to="/signup" onClick={() => setIsOpen(false)}>
                    <Button
                      className="w-full bg-[#0066FF] hover:bg-[#0052CC] text-white shadow-lg shadow-[#0066FF]/20"
                    >
                      Spróbuj za darmo
                    </Button>
                  </Link>
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
