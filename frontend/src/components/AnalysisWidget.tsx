import React, { useEffect, useRef, memo } from 'react';

interface AnalysisWidgetProps {
  symbol: string;
}

const AnalysisWidget: React.FC<AnalysisWidgetProps> = ({ symbol }) => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!symbol) return;
    // Clean up previous widget
    if (container.current) {
      container.current.innerHTML = '';
    }
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      colorTheme: 'dark',
      displayMode: 'single',
      isTransparent: true,
      locale: 'en',
      interval: '1W',
      disableInterval: false,
      width: '100%',
      height: 450,
      symbol: symbol,
      showIntervalTabs: true,
    });

    container.current?.appendChild(script);

    return () => {
      if (container.current) {
        container.current.innerHTML = '';
      }
    };
  }, [symbol]);

  return (
    <div className="tradingview-widget-container" ref={container}>
      <div className="tradingview-widget-container__widget"></div>
      <div className="tradingview-widget-copyright">
      </div>
    </div>
  );
};

export default memo(AnalysisWidget);

