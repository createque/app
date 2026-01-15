import React, { useState, useEffect } from 'react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const WidgetSection = ({ id, title, subtitle, comment, bgColor = 'white' }) => {
  const [widget, setWidget] = useState(null);
  const [loading, setLoading] = useState(true);

  // Extract section name from id (e.g., "pricing-widget" -> "pricing")
  const sectionName = id.replace('-widget', '');

  useEffect(() => {
    const fetchWidget = async () => {
      try {
        const response = await fetch(`${API}/cms/widgets/public/${sectionName}`);
        if (response.ok) {
          const data = await response.json();
          setWidget(data);
        }
      } catch (error) {
        console.error(`Error fetching widget for ${sectionName}:`, error);
      } finally {
        setLoading(false);
      }
    };

    fetchWidget();
  }, [sectionName]);

  return (
    <section 
      id={id} 
      className={`py-16 lg:py-24 ${
        bgColor === 'light' ? 'bg-[#F8FAFC]' : 'bg-white'
      }`}
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1A1A1A] mb-4">
            {title}
          </h2>
          {subtitle && (
            <p className="text-lg text-[#1A1A1A]/70">
              {subtitle}
            </p>
          )}
        </div>

        {/* Widget Content or Placeholder */}
        {loading ? (
          <div className="min-h-[200px] flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-[#0066FF] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : widget && widget.is_active ? (
          <div 
            className="widget-container"
            dangerouslySetInnerHTML={{ __html: widget.widget_code }}
          />
        ) : (
          <div 
            className="min-h-[300px] rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 flex items-center justify-center"
            data-widget-id={id}
          >
            {/* Placeholder content - will be replaced by Elfsight widget */}
            <div className="text-center p-8">
              <div className="w-16 h-16 rounded-2xl bg-[#0066FF]/10 flex items-center justify-center mx-auto mb-4">
                <svg 
                  className="w-8 h-8 text-[#0066FF]" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={1.5} 
                    d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" 
                  />
                </svg>
              </div>
              <p className="text-[#1A1A1A]/50 text-sm font-medium">
                Widget zostanie tutaj osadzony
              </p>
              {/* HTML comment for developers */}
              <div className="hidden">
                {`<!-- ${comment} -->`}
              </div>
            </div>
          </div>
        )}
        
        {/* Actual HTML comment in the DOM */}
        <div 
          dangerouslySetInnerHTML={{ 
            __html: `<!-- ${comment} -->` 
          }} 
        />
      </div>
    </section>
  );
};

export default WidgetSection;
