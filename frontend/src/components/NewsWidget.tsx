import React, { useEffect, useRef, memo } from 'react';

interface NewsWidgetProps {
  symbol: string;
}

function getTradingViewSymbol(symbol: string): string {
  // If already has a colon, assume it's a full TradingView symbol
  if (symbol.includes(':')) return symbol;

  // If it's a crypto symbol like BTC, ETH, etc.
  if (/^[A-Z]{2,6}$/.test(symbol)) {
    // Only append USD if not already ending with USD
    return `BINANCE:${symbol}USD`;
  }
  // If it's already BTCUSD, ETHUSD, etc. (avoid double USD)
  if (/^[A-Z]{3,10}USD$/.test(symbol)) {
    return `BINANCE:${symbol}`;
  }
  // If it's a US stock symbol
  if (/^[A-Z]{1,5}$/.test(symbol)) {
    return `NASDAQ:${symbol}`;
  }
  // Default: just return as is
  return symbol;
}

const NewsWidget: React.FC<NewsWidgetProps> = ({ symbol }) => {
  const container = useRef<HTMLDivElement>(null);

  // Fix: Remove trailing USD if already present before appending USD
  let tradingViewSymbol = symbol.trim().toUpperCase();
  if (/^[A-Z]{2,6}$/.test(tradingViewSymbol)) {
    // If symbol already ends with USD, don't append again
    if (!tradingViewSymbol.endsWith('USD')) {
      tradingViewSymbol = `BINANCE:${tradingViewSymbol}USD`;
    } else {
      tradingViewSymbol = `BINANCE:${tradingViewSymbol}`;
    }
  } else if (/^[A-Z]{3,10}USD$/.test(tradingViewSymbol)) {
    tradingViewSymbol = `BINANCE:${tradingViewSymbol}`;
  } else if (/^[A-Z]{1,5}$/.test(tradingViewSymbol)) {
    tradingViewSymbol = `NASDAQ:${tradingViewSymbol}`;
  } else if (!tradingViewSymbol.includes(':')) {
    tradingViewSymbol = tradingViewSymbol;
  }

  useEffect(() => {
    if (!symbol) return;
    if (container.current) {
      container.current.innerHTML = '';
    }
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-timeline.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      displayMode: 'adaptive',
      feedMode: 'symbol',
      symbol: tradingViewSymbol,
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
  }, [symbol, tradingViewSymbol]);

  return (
    <div className="tradingview-widget-container" ref={container}>
      <div className="tradingview-widget-container__widget"></div>
      <div className="tradingview-widget-copyright"></div>
    </div>
  );
};

export default memo(NewsWidget);