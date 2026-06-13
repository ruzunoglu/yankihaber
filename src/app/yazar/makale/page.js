"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { getArticleById, getAuthorById } from '../../../services/authorAggregator';
import Header from '../../../components/Header';
import AudioReader from '../../../components/AudioReader';
import Head from 'next/head';

function ArticleContent() {
  const searchParams = useSearchParams();
  const authorId = searchParams.get('authorId');
  const articleId = searchParams.get('articleId');
  
  const [author, setAuthor] = useState(null);
  const [article, setArticle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (authorId && articleId) {
      const loadData = async () => {
        const foundAuthor = await getAuthorById(authorId);
        const foundArticle = await getArticleById(authorId, articleId);
        
        setAuthor(foundAuthor);
        setArticle(foundArticle);
        setIsLoading(false);
      };
      loadData();
    }
  }, [authorId, articleId]);

  if (isLoading) {
    return <div style={{textAlign:'center', padding:'5rem'}}>Makale yükleniyor...</div>;
  }

  if (!article || !author) {
    return <div style={{textAlign:'center', padding:'5rem'}}>Makale bulunamadı.</div>;
  }

  return (
    <>
      <Head>
        <title>{article.title} - {author.name}</title>
      </Head>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px', lineHeight: '1.8' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
          <img src={author.image} alt={author.name} style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent-primary)' }} />
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{author.name}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{new Date(article.date).toLocaleDateString('tr-TR')} &bull; {author.role}</div>
          </div>
        </div>

        <h1 style={{ fontSize: '2.2rem', marginBottom: '30px', lineHeight: '1.3' }}>{article.title}</h1>
        
        <AudioReader title={article.title} content={article.content} />
        
        <div style={{ fontSize: '1.1rem', color: 'var(--text-primary)', whiteSpace: 'pre-wrap', marginTop: '20px' }}>
          {article.content}
        </div>
        
        <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid var(--border-color)', textAlign: 'right', fontSize: '0.9rem' }}>
          <a href={article.originalLink} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)', textDecoration: 'underline' }}>
            Orijinal Kaynak: {article.source}
          </a>
        </div>
      </div>
    </>
  );
}

export default function ArticlePage() {
  return (
    <div>
      <Header />
      <Suspense fallback={<div style={{textAlign:'center', padding:'5rem'}}>Yükleniyor...</div>}>
        <ArticleContent />
      </Suspense>
    </div>
  );
}
