"use client";

import { useEffect, useState } from 'react';

const defaultData = [
  { symbol: 'BIST 100', value: 10450.25, change: +1.2 },
  { symbol: 'USD/TRY', value: 32.50, change: +0.4 },
  { symbol: 'EUR/TRY', value: 35.10, change: -0.1 },
  { symbol: 'ALTIN (Gr)', value: 2450.50, change: +0.8 },
  { symbol: 'BTC/USD', value: 68400, change: -1.5 },
];

export default function MarketTicker() {
  const [marketData, setMarketData] = useState(defaultData);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await fetch('https://finans.truncgil.com/today.json');
        const data = await res.json();
        
        const parseVal = (str) => {
          if (!str) return 0;
          return parseFloat(str.replace(/\\./g, '').replace(',', '.'));
        };
        
        const parseChange = (str) => {
          if (!str) return 0;
          return parseFloat(str.replace('%', '').replace(',', '.'));
        };

        const usd = data['USD'] || { Satış: '32.50', Değişim: '%0' };
        const eur = data['EUR'] || { Satış: '35.10', Değişim: '%0' };
        const gold = data['gram-altin'] || { Satış: '2450.00', Değişim: '%0' };

        setMarketData([
          { symbol: 'BIST 100', value: 10250.00, change: +0.8 }, // Sabit/Mock
          { symbol: 'USD/TRY', value: parseVal(usd.Satış), change: parseChange(usd.Değişim) },
          { symbol: 'EUR/TRY', value: parseVal(eur.Satış), change: parseChange(eur.Değişim) },
          { symbol: 'ALTIN (Gr)', value: parseVal(gold.Satış), change: parseChange(gold.Değişim) },
          { symbol: 'BTC/USD', value: 69500, change: +1.2 }, // Sabit/Mock
        ]);
      } catch (error) {
        console.error("Canlı kurlar çekilemedi.", error);
      }
    };

    fetchRates();
    const interval = setInterval(fetchRates, 300000); // 5 dakikada bir güncelle
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      width: '100%', overflow: 'hidden', background: '#000', color: '#fff',
      padding: '8px 0', fontSize: '0.9rem', borderBottom: '1px solid #333',
      display: 'flex', whiteSpace: 'nowrap', zIndex: 100, position: 'relative'
    }}>
      <div style={{
        display: 'flex', animation: 'ticker 20s linear infinite', gap: '40px', paddingLeft: '100%'
      }}>
        {marketData.map((item, index) => (
          <div key={index} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 'bold', color: '#ccc' }}>{item.symbol}</span>
            <span>
              {item.value > 100 ? item.value.toFixed(1) : item.value.toFixed(2)}
            </span>
            <span style={{ 
              color: item.change >= 0 ? '#10b981' : '#ef4444',
              display: 'flex', alignItems: 'center', fontWeight: 'bold'
            }}>
              {item.change >= 0 ? '▲' : '▼'} %{Math.abs(item.change).toFixed(2)}
            </span>
          </div>
        ))}
        {/* Repeat once for seamless loop effect visually if needed, but animation reset handles it roughly */}
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-150%); }
        }
      `}} />
    </div>
  );
}
