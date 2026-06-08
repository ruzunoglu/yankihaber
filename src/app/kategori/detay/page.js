"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { categories } from '../../../data/mockNews';
import { getNewsByCategory } from '../../../services/newsAggregator';
import Header from '../../../components/Header';
import styles from './page.module.css';

function CategoryPageContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const [newsList, setNewsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const category = categories.find(c => c.id === id);

  useEffect(() => {
    if (!id || !category) {
      setIsLoading(false);
      return;
    }

    const loadCategoryNews = async () => {
      const data = await getNewsByCategory(id);
      setNewsList(data);
      setIsLoading(false);
    };

    loadCategoryNews();
  }, [id, category]);

  useEffect(() => {
    if (category) {
      document.title = `${category.name} Haberleri | YANKI.`;
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.name = "description";
        document.head.appendChild(metaDesc);
      }
      metaDesc.content = `${category.name} kategorisindeki en güncel ve son dakika gelişmeleri.`;
    }
  }, [category]);

  if (!category) {
    return <div style={{textAlign: 'center', padding: '5rem'}}>Kategori bulunamadı.</div>;
  }

  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('tr-TR', options);
  };

  return (
    <div className={styles.categoryWrapper}>
      <Header />

      <div className={styles.categoryHeader}>
        <div className="container">
          <h1 className={styles.categoryTitle}>
            <span className={styles.categoryDot} style={{ background: category.color, boxShadow: `0 0 15px ${category.color}` }}></span>
            {category.name} Haberleri
          </h1>
          <p className={styles.categoryDesc}>
            {category.name} kategorisindeki en güncel ve son dakika gelişmelerini bu sayfadan takip edebilirsiniz.
          </p>
        </div>
      </div>

      <div className="container">
        {isLoading ? (
          <div style={{textAlign: 'center', padding: '5rem', color: 'var(--text-secondary)'}}>Yükleniyor...</div>
        ) : newsList.length === 0 ? (
          <div className={styles.emptyState}>Bu kategoride henüz haber bulunmuyor.</div>
        ) : (
          <div className={styles.newsGrid}>
            {newsList.map((news) => (
              <Link href={`/haber/detay?id=${news.seoUrl || news.id}`} key={news.id} className={styles.glassCard}>
                <div className={styles.cardImageWrapper}>
                  <img src={news.image} alt={news.title} className={styles.cardImage} />
                </div>
                <div className={styles.cardContent}>
                  <h3 className={styles.cardTitle}>{news.title}</h3>
                  <p className={styles.cardSummary}>{news.summary}</p>
                </div>
                <div className={styles.cardFooter}>
                  <span>{formatDate(news.date)}</span>
                  <span className={styles.readMore} style={{ color: category.color }}>Habere Git &rarr;</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CategoryPage() {
  return (
    <Suspense fallback={<div style={{textAlign: 'center', padding: '5rem'}}>Yükleniyor...</div>}>
      <CategoryPageContent />
    </Suspense>
  );
}
