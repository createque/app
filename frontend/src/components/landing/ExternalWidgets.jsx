import React, { useEffect } from 'react';

/**
 * Component to embed external widgets like Live Agent and Tacu.cool
 * These widgets are loaded once and persist across page navigations
 */
const ExternalWidgets = () => {
  useEffect(() => {
    // Load Live Agent widget
    const loadLiveAgent = () => {
      // Check if already loaded
      if (document.getElementById('live-agent-script')) return;
      
      // Create placeholder for Live Agent
      const liveAgentContainer = document.createElement('div');
      liveAgentContainer.id = 'live-agent-widget';
      document.body.appendChild(liveAgentContainer);
      
      // Note: Replace with actual Live Agent script when available
      // Example:
      // const script = document.createElement('script');
      // script.id = 'live-agent-script';
      // script.src = 'https://your-liveagent-url.com/widget.js';
      // script.async = true;
      // document.body.appendChild(script);
    };

    // Load Tacu.cool widget
    const loadTacuCool = () => {
      // Check if already loaded
      if (document.getElementById('tacu-cool-script')) return;
      
      // Create placeholder for Tacu.cool
      const tacuContainer = document.createElement('div');
      tacuContainer.id = 'tacu-cool-widget';
      document.body.appendChild(tacuContainer);
      
      // Note: Replace with actual Tacu.cool script when available
      // Example:
      // const script = document.createElement('script');
      // script.id = 'tacu-cool-script';
      // script.src = 'https://tacu.cool/embed.js';
      // script.async = true;
      // script.setAttribute('data-site-id', 'YOUR_SITE_ID');
      // document.body.appendChild(script);
    };

    loadLiveAgent();
    loadTacuCool();

    // Cleanup on unmount (optional, usually you want these to persist)
    return () => {
      // Uncomment if you want to remove widgets on unmount
      // const liveAgent = document.getElementById('live-agent-widget');
      // const tacuCool = document.getElementById('tacu-cool-widget');
      // if (liveAgent) liveAgent.remove();
      // if (tacuCool) tacuCool.remove();
    };
  }, []);

  return null; // This component doesn't render anything visible
};

/**
 * Widget placeholder for admin to see where widgets will appear
 */
export const WidgetPlaceholder = ({ type, className = '' }) => {
  const config = {
    'live-agent': {
      title: 'Live Agent Chat Widget',
      description: 'Widget czatu będzie wyświetlany w prawym dolnym rogu',
      color: 'bg-blue-500/10 border-blue-500/30',
      icon: '💬'
    },
    'tacu-cool': {
      title: 'Tacu.cool Engagement Widget',
      description: 'Widget zaangażowania użytkowników',
      color: 'bg-purple-500/10 border-purple-500/30',
      icon: '🎯'
    }
  };

  const widget = config[type] || config['live-agent'];

  return (
    <div className={`rounded-lg border p-4 ${widget.color} ${className}`}>
      <div className="flex items-center gap-3">
        <span className="text-2xl">{widget.icon}</span>
        <div>
          <h4 className="font-medium text-white">{widget.title}</h4>
          <p className="text-sm text-white/60">{widget.description}</p>
        </div>
      </div>
    </div>
  );
};

export default ExternalWidgets;
