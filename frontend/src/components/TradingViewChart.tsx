import React, { useEffect, useRef, memo } from 'react';
interface TradingViewChartProps {
  symbol: string; 
  theme?: 'light' | 'dark'; 
}

function TradingViewChart({ symbol, theme = 'dark' }: TradingViewChartProps) {
  const container = useRef<HTMLDivElement>(null);
  const SCRIPT_ID = `tradingview-advanced-chart-script-${symbol}`;

  useEffect(() => {
    if (container.current) {
      container.current.innerHTML = '';
    }

    if (document.getElementById(SCRIPT_ID)) {
      return;
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID; 
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;

    script.innerHTML = JSON.stringify({
      "autosize": true,
      "symbol": symbol, 
      "interval": "D", 
      "timezone": "Etc/UTC",
      "theme": theme, 
      "style": "1", 
      "locale": "en",
      "enable_publishing": false,
      "hide_top_toolbar": false,
      "hide_legend_by_default": false,
      "save_image": false,
      "calendar": false,
      "hide_volume": true, 
      "support_host": "https://www.tradingview.com"
    });

    if (container.current) {
      container.current.appendChild(script);
    }

    return () => {
      const scriptToRemove = document.getElementById(SCRIPT_ID);
      if (container.current && scriptToRemove && container.current.contains(scriptToRemove)) {
        container.current.removeChild(scriptToRemove);
      }
    };
  }, [symbol, theme]); 

  return (
    <div className="tradingview-widget-container" ref={container} style={{ height: "400px", width: "100%" }}>
      <div className="tradingview-widget-container__widget"></div>
      <div className="tradingview-widget-copyright">
      </div>
    </div>
  );
}

export default memo(TradingViewChart);

