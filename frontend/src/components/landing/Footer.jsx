import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram, ExternalLink } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: {
      title: 'Produkt',
      links: [
        { label: 'Funkcje', href: '#features', type: 'scroll' },
        { label: 'Cennik', href: '#pricing-widget', type: 'scroll' },
        { label: 'Integracje', href: '#', type: 'internal' },
        { label: 'Roadmap', href: 'https://roadmap.timelove.pl', type: 'external' },
      ]
    },
    company: {
      title: 'Firma',
      links: [
        { label: 'O nas', href: '#', type: 'internal' },
        { label: 'Kariera', href: '#', type: 'internal' },
        { label: 'Blog', href: '#blog-widget', type: 'scroll' },
        { label: 'Kontakt', href: '#', type: 'internal' },
      ]
    },
    support: {
      title: 'Wsparcie',
      links: [
        { label: 'Centrum pomocy', href: '#', type: 'internal' },
        { label: 'FAQ', href: '#faq-widget', type: 'scroll' },
        { label: 'Status systemu', href: '#', type: 'internal' },
        { label: 'Dokumentacja', href: 'https://docs.timelove.pl', type: 'external' },
      ]
    },
    legal: {
      title: 'Prawne',
      links: [
        { label: 'Polityka prywatności', href: '#', type: 'internal' },
        { label: 'Regulamin', href: '#', type: 'internal' },
        { label: 'Cookies', href: '#', type: 'internal' },
        { label: 'RODO', href: '#', type: 'internal' },
      ]
    }
  };

  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Instagram, href: '#', label: 'Instagram' },
  ];

  const scrollToSection = (href) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const renderLink = (link) => {
    if (link.type === 'external') {
      return (
        <a 
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-white/60 hover:text-white transition-colors inline-flex items-center gap-1"
        >
          {link.label}
          <ExternalLink className="w-3 h-3" />
        </a>
      );
    }
    if (link.type === 'scroll') {
      return (
        <button
          onClick={() => scrollToSection(link.href)}
          className="text-sm text-white/60 hover:text-white transition-colors text-left"
        >
          {link.label}
        </button>
      );
    }
    return (
      <a 
        href={link.href}
        className="text-sm text-white/60 hover:text-white transition-colors"
      >
        {link.label}
      </a>
    );
  };

  return (
    <footer className="bg-[#1A1A1A] border-t border-white/5">
      {/* Widget Embed Section - Live Agent & Tacu.cool placeholders */}
      <div id="footer-widgets" className="hidden">
        {/* 
          Live Agent Chat Widget Placeholder
          Paste your Live Agent widget code here:
          Example: <script src="https://your-liveagent.com/widget.js"></script>
        */}
        <div id="live-agent-container"></div>
        
        {/*
          Tacu.cool Engagement Widget Placeholder
          Paste your Tacu.cool widget code here:
          Example: <script src="https://tacu.cool/embed.js" data-site-id="YOUR_ID"></script>
        */}
        <div id="tacu-cool-container"></div>
      </div>

      {/* Main Footer */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#0066FF] flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">TimeLov</span>
            </Link>
            
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

            {/* Quick Links */}
            <div className="mt-6 flex flex-wrap gap-3">
              <a 
                href="https://roadmap.timelove.pl" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/5 text-white/60 hover:text-white hover:bg-white/10 text-xs transition-colors"
              >
                Roadmap (Frill)
                <ExternalLink className="w-3 h-3" />
              </a>
              <a 
                href="https://docs.timelove.pl" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/5 text-white/60 hover:text-white hover:bg-white/10 text-xs transition-colors"
              >
                Dokumentacja (Malcolm)
                <ExternalLink className="w-3 h-3" />
              </a>
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
                    {renderLink(link)}
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
