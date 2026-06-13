"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { getAuthorById } from '../../../services/authorAggregator';
import Header from '../../../components/Header';

function AuthorDetailContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [author, setAuthor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const loadAuthor = async () => {
        const authorData = await getAuthorById(id);
        setAuthor(authorData);
        setIsLoading(false);
      };
      loadAuthor();
    }
  }, [id]);

  if (isLoading) {
    return <div style={{textAlign:'center', padding:'5rem'}}>Yazar yükleniyor...</div>;
  }

  if (!author) {
    return <div style={{textAlign:'center', padding:'5rem'}}>Yazar bulunamadı.</div>;
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px', paddingBottom: '30px', borderBottom: '1px solid var(--border-color)' }}>
        <img src={author.image} alt={author.name} style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--accent-primary)' }} />
        <div>
          <h1 style={{ margin: '0 0 5px 0', fontSize: '2rem' }}>{author.name}</h1>
          <div style={{ color: 'var(--accent-primary)', fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '5px' }}>{author.role}</div>
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{author.bio}</p>
        </div>
      </div>

      <h2 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>Son Yazıları</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {author.articles.map(article => (
          <div key={article.id} style={{ padding: '20px', background: 'var(--bg-card)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '10px' }}>{new Date(article.date).toLocaleDateString('tr-TR')}</div>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '1.3rem' }}>
              <span style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>{article.title}</span>
            </h3>
            <p style={{ margin: '0 0 15px 0', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{article.summary}</p>
            {article.originalLink && (
              <a href={article.originalLink} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem' }}>
                Yazının Tamamını Oku &rarr;
              </a>
            )}
          </div>
        ))}
        {author.articles.length === 0 && (
          <div style={{ color: 'var(--text-secondary)' }}>Henüz yazı bulunmuyor.</div>
        )}
      </div>
    </div>
  );
}

export default function AuthorDetail() {
  return (
    <div>
      <Header />
      <Suspense fallback={<div style={{textAlign:'center', padding:'5rem'}}>Yükleniyor...</div>}>
        <AuthorDetailContent />
      </Suspense>
    </div>
  );
}
