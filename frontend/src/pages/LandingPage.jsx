import React from 'react';
import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import Features from '../components/landing/Features';
import WidgetSection from '../components/landing/WidgetSection';
import BottomCTA from '../components/landing/BottomCTA';
import Footer from '../components/landing/Footer';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <Hero />
        <Features />
        
        {/* Elfsight Widget Placeholder Sections */}
        <WidgetSection
          id="pricing-widget"
          title="Cennik"
          subtitle="Wybierz plan dopasowany do Twoich potrzeb"
          comment="Elfsight Pricing Widget embeds here"
        />
        
        <WidgetSection
          id="testimonials-widget"
          title="Co mówią nasi klienci"
          subtitle="Dołącz do tysięcy zadowolonych użytkowników"
          comment="Elfsight Reviews Widget embeds here"
          bgColor="light"
        />
        
        <WidgetSection
          id="faq-widget"
          title="Często zadawane pytania"
          subtitle="Znajdź odpowiedzi na najczęstsze pytania"
          comment="Elfsight FAQ Widget embeds here"
        />
        
        <WidgetSection
          id="email-widget"
          title="Bądź na bieżąco"
          subtitle="Zapisz się do newslettera i otrzymuj najnowsze informacje"
          comment="Elfsight Form Widget embeds here"
          bgColor="light"
        />
        
        <WidgetSection
          id="blog-widget"
          title="Blog"
          subtitle="Najnowsze artykuły i porady"
          comment="Elfsight Blog Widget embeds here"
        />
        
        <BottomCTA />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
