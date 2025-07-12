import React, { useEffect, useRef, memo } from 'react';

interface NewsWidgetProps {
  symbol: string;
}

// Only use BINANCE:... for crypto, and NASDAQ:... for stocks
function getTradingViewSymbol(symbol: string): string {
  if (symbol.includes(':')) return symbol;

  // If it's a crypto symbol like BTC, ETH, etc.
  if (/^[A-Z]{2,6}$/.test(symbol)) {
    // Only append USD if not already ending with USD
    if (!symbol.endsWith('USD')) {
      return `BINANCE:${symbol}USD`;
    } else {
      return `BINANCE:${symbol}`;
    }
  }
  // If it's already BTCUSD, ETHUSD, etc.
  if (/^[A-Z]{3,10}USD$/.test(symbol)) {
    return `BINANCE:${symbol}`;
  }
  // If it's a US stock symbol (AAPL, TSLA, etc.)
  if (/^[A-Z]{1,5}$/.test(symbol)) {
    return `NASDAQ:${symbol}`;
  }
  // Default: just return as is
  return symbol;
}

const NewsWidget: React.FC<NewsWidgetProps> = ({ symbol }) => {
  const container = useRef<HTMLDivElement>(null);

  // Determine correct TradingView symbol for news
  let tradingViewSymbol = symbol.trim().toUpperCase();
  // If it's a stock, use NASDAQ:SYMBOL, not BINANCE:SYMBOLUSD
  if (/^[A-Z]{1,5}$/.test(tradingViewSymbol)) {
    tradingViewSymbol = `NASDAQ:${tradingViewSymbol}`;
  } else if (/^[A-Z]{2,6}$/.test(tradingViewSymbol)) {
    // If it's a crypto symbol like BTC, ETH, etc.
    if (!tradingViewSymbol.endsWith('USD')) {
      tradingViewSymbol = `BINANCE:${tradingViewSymbol}USD`;
    } else {
      tradingViewSymbol = `BINANCE:${tradingViewSymbol}`;
    }
  } else if (/^[A-Z]{3,10}USD$/.test(tradingViewSymbol)) {
    tradingViewSymbol = `BINANCE:${tradingViewSymbol}`;
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