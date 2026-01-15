import React from 'react';
import { Clock, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: {
      title: 'Produkt',
      links: [
        { label: 'Funkcje', href: '#features' },
        { label: 'Cennik', href: '#pricing-widget' },
        { label: 'Integracje', href: '#' },
        { label: 'Aktualizacje', href: '#' },
      ]
    },
    company: {
      title: 'Firma',
      links: [
        { label: 'O nas', href: '#' },
        { label: 'Kariera', href: '#' },
        { label: 'Blog', href: '#blog-widget' },
        { label: 'Kontakt', href: '#' },
      ]
    },
    support: {
      title: 'Wsparcie',
      links: [
        { label: 'Centrum pomocy', href: '#' },
        { label: 'FAQ', href: '#faq-widget' },
        { label: 'Status systemu', href: '#' },
        { label: 'Dokumentacja', href: '#' },
      ]
    },
    legal: {
      title: 'Prawne',
      links: [
        { label: 'Polityka prywatności', href: '#' },
        { label: 'Regulamin', href: '#' },
        { label: 'Cookies', href: '#' },
        { label: 'RODO', href: '#' },
      ]
    }
  };

  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Instagram, href: '#', label: 'Instagram' },
  ];

  return (
    <footer className="bg-[#1A1A1A] border-t border-white/5">
      {/* Main Footer */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2">
            <a href="/" className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#0066FF] flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">TimeLov</span>
            </a>
            
            <p className="text-white/60 text-sm mb-6 max-w-xs">
              Kompleksowe narzędzie do zarządzania zespołem. 
              Centralna kontrola zasobami, ludźmi i procesami.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <a href="mailto:kontakt@timelov.pl" className="flex items-center gap-3 text-sm text-white/60 hover:text-white transition-colors">
                <Mail className="w-4 h-4" />
                <span>kontakt@timelov.pl</span>
              </a>
              <a href="tel:+48123456789" className="flex items-center gap-3 text-sm text-white/60 hover:text-white transition-colors">
                <Phone className="w-4 h-4" />
                <span>+48 123 456 789</span>
              </a>
              <div className="flex items-center gap-3 text-sm text-white/60">
                <MapPin className="w-4 h-4" />
                <span>Warszawa, Polska</span>
              </div>
            </div>
          </div>

          {/* Link Columns */}
          {Object.values(footerLinks).map((section) => (
            <div key={section.title}>
              <h4 className="text-white font-semibold text-sm mb-4">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <a 
                      href={link.href}
                      className="text-sm text-white/60 hover:text-white transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/5">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-white/50">
              © {currentYear} TimeLov. Wszelkie prawa zastrzeżone.
            </p>
            
            {/* Social Links */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
