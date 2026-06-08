"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import { categories } from '../data/mockNews';
import { getAllNews } from '../services/newsAggregator';
import { getSiteSettings } from '../services/adminService';
import HeroSlider from '../components/HeroSlider';
import Header from '../components/Header';

export default function Home() {
  const [newsList, setNewsList] = useState([]);
  const [siteName, setSiteName] = useState('YANKI.');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const [news, settings] = await Promise.all([
        getAllNews(),
        getSiteSettings()
      ]);
      setNewsList(news);
      if (settings && settings.siteName) {
        setSiteName(settings.siteName);
      }
      setIsLoading(false);
    };
    loadData();
  }, []);

  const headlines = newsList.slice(0, 5);
  const recentNews = newsList.slice(5, 11);

  // Helper function to format date
  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' };
    return new Date(dateString).toLocaleDateString('tr-TR', options);
  };

  return (
    <div className={styles.main}>
      {/* Shared Header Component */}
      <Header />

      <div className="container">
        {/* Modern Ticker */}
        <div className={styles.tickerWrapper}>
          <div className={styles.ticker}>
            <div className={styles.tickerLabel}>
              <div className={styles.tickerDot}></div>
              SON DAKİKA
            </div>
            <div className={styles.tickerContent}>
              <div className={styles.tickerScroll}>
                {/* Duplicate for infinite scroll illusion */}
                {[...recentNews, ...recentNews].map((news, i) => (
                  <Link href={`/haber/detay?id=${news.seoUrl || news.id}`} key={`${news.id}-${i}`} className={styles.tickerItem}>
                    <span style={{ color: categories.find(c => c.id === news.category)?.color, marginRight: '8px' }}>
                      {categories.find(c => c.id === news.category)?.name}
                    </span>
                    {news.title}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-secondary)' }}>
            Haberler Yükleniyor...
          </div>
        ) : (
          <>
            {/* Hero Slider */}
            <HeroSlider headlines={headlines} categories={categories} />

            {/* Glass Cards Section */}
            <h2 className="section-title">En Yeni Gelişmeler</h2>
            <div className={styles.newsGrid}>
              {recentNews.map((news) => (
                <Link href={`/haber/detay?id=${news.seoUrl || news.id}`} key={news.id} className={styles.glassCard}>
              <div className={styles.cardImageWrapper}>
                <img src={news.image} alt={news.title} className={styles.cardImage} />
                <span className={styles.cardCategory} style={{ backgroundColor: categories.find(c=>c.id===news.category)?.color }}>
                  {categories.find(c=>c.id===news.category)?.name}
                </span>
              </div>
              <div className={styles.cardContent}>
                <h3 className={styles.cardTitle}>{news.title}</h3>
                <p className={styles.cardSummary}>{news.summary}</p>
              </div>
              <div className={styles.cardFooter}>
                <span>{formatDate(news.date)}</span>
                <span className={styles.readMore}>Habere Git &rarr;</span>
              </div>
              </Link>
            ))}
          </div>
        </>
        )}
      </div>
    </div>
  );
}
