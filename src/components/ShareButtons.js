"use client";

import { useState, useEffect } from 'react';

export default function ShareButtons({ title, path }) {
  const [url, setUrl] = useState('');

  useEffect(() => {
    // Only access window.location.origin on the client side
    setUrl(`${window.location.origin}${path}`);
  }, [path]);

  const handleCopyLink = () => {
    if (!url) return;
    navigator.clipboard.writeText(url).then(() => {
      alert('Bağlantı kopyalandı!');
    }).catch(err => {
      console.error('Kopyalama başarısız oldu', err);
    });
  };

  if (!url) return null; // Wait for hydration to get the full URL

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  return (
    <div style={{ display: 'flex', gap: '10px' }}>
      <a
        href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="X'te Paylaş"
        style={{
          width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-main)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)',
          border: '1px solid var(--border-solid)', textDecoration: 'none', fontWeight: 'bold'
        }}
      >
        X
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Facebook'ta Paylaş"
        style={{
          width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-main)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)',
          border: '1px solid var(--border-solid)', textDecoration: 'none', fontWeight: 'bold'
        }}
      >
        f
      </a>
      <a
        href={`https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp'ta Paylaş"
        style={{
          width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-main)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)',
          border: '1px solid var(--border-solid)', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.2rem'
        }}
      >
        📱
      </a>
      <button
        onClick={handleCopyLink}
        aria-label="Bağlantıyı Kopyala"
        style={{
          width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-main)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)',
          border: '1px solid var(--border-solid)', cursor: 'pointer', fontSize: '1.2rem'
        }}
      >
        🔗
      </button>
    </div>
  );
}
