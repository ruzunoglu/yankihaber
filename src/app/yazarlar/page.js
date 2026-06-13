"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAllAuthors } from '../../services/authorAggregator';
import Header from '../../components/Header';

export default function AuthorsIndex() {
  const [authors, setAuthors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAuthors = async () => {
      const data = await getAllAuthors();
      setAuthors(data);
      setIsLoading(false);
    };
    loadAuthors();
  }, []);

  return (
    <div>
      <Header />
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '30px', textAlign: 'center' }}>Köşe Yazarlarımız</h1>
        
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-secondary)' }}>
            Yazarlar Yükleniyor...
          </div>
        ) : authors.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-secondary)' }}>
            Henüz yazar bulunamadı. Lütfen daha sonra tekrar kontrol edin.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' }}>
            {authors.map(author => (
              <Link href={`/yazar/detay?id=${author.id}`} key={author.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'var(--bg-card)', padding: '30px', borderRadius: '15px', border: '1px solid var(--border-color)', textDecoration: 'none', color: 'inherit' }}>
                <img src={author.image} alt={author.name} style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', marginBottom: '15px', border: '3px solid var(--accent-primary)' }} />
                <h2 style={{ margin: '0 0 5px 0', fontSize: '1.5rem', textAlign: 'center' }}>{author.name}</h2>
                <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold', marginBottom: '15px', textAlign: 'center' }}>{author.role}</span>
                <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{author.bio}</p>
                <div style={{ marginTop: '15px', fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                  {author.articles.length} makale mevcut
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
