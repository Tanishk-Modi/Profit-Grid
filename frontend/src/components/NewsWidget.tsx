import React, { useEffect, useRef, memo } from 'react';

interface NewsWidgetProps {
  symbol: string;
}

const NewsWidget: React.FC<NewsWidgetProps> = ({ symbol }) => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!symbol) return;
    // Clean up previous widget
    if (container.current) {
      container.current.innerHTML = '';
    }
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-timeline.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      displayMode: 'adaptive',
      feedMode: 'symbol',
      symbol: symbol,
      colorTheme: 'dark',
      isTransparent: false,
      locale: 'en',
      width: '100%',
      height: 550,
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
      <div className="tradingview-widget-copyright"></div>
    </div>
  );
};

export default memo(NewsWidget);