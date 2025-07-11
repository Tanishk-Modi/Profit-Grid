import React, { useEffect, useRef, memo } from 'react';

interface TradingViewSymbol {
  proName: string;
  title: string;
}

interface TradingViewWidgetConfig {
  symbols: TradingViewSymbol[];
  colorTheme: string;
  locale: string;
  largeChartUrl: string;
  isTransparent: boolean;
  showSymbolLogo: boolean;
  displayMode: string;
}

function TradingViewWidget() {
  const container = useRef<HTMLDivElement>(null);

  useEffect(
    () => {
      // Define a unique ID for the script to prevent multiple loads
      const SCRIPT_ID = 'tradingview-ticker-tape-script';

      // Check if the script element with this ID already exists in the document
      if (document.getElementById(SCRIPT_ID)) {
        return;
      }

      const script = document.createElement("script");
      script.id = SCRIPT_ID; 
      script.src = "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
      script.type = "text/javascript";
      script.async = true;

      const widgetConfig: TradingViewWidgetConfig = {
        "symbols": [
          {
            "proName": "FOREXCOM:SPXUSD",
            "title": "S&P 500 Index"
          },
          {
            "proName": "FOREXCOM:NSXUSD",
            "title": "US 100 Cash CFD"
          },
          {
            "proName": "FX_IDC:EURUSD",
            "title": "EUR to USD"
          },
          {
            "proName": "BITSTAMP:BTCUSD",
            "title": "Bitcoin"
          },
          {
            "proName": "BITSTAMP:ETHUSD",
            "title": "Ethereum"
          }
        ],
        "colorTheme": "dark",
        "locale": "en",
        "largeChartUrl": "",
        "isTransparent": true,
        "showSymbolLogo": true,
        "displayMode": "adaptive"
      };

      script.innerHTML = JSON.stringify(widgetConfig);

      if (container.current) {
        container.current.appendChild(script);
      }

      return () => {
        const scriptToRemove = document.getElementById(SCRIPT_ID);
        if (container.current && scriptToRemove && container.current.contains(scriptToRemove)) {
          container.current.removeChild(scriptToRemove);
        }
      };
    },
    [] 
  );

  return (
    <div className="tradingview-widget-container" ref={container}>
      <div className="tradingview-widget-container__widget"></div>
      {/* Copyright information, as per TradingView's terms */}
      <div className="tradingview-widget-copyright">
      </div>
    </div>
  );
}

export default memo(TradingViewWidget);