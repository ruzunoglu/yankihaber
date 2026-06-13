"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './AuthorsCorner.module.css';
import { getAllAuthors } from '../services/authorAggregator';

export default function AuthorsCorner() {
  const [authors, setAuthors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAuthors = async () => {
      const data = await getAllAuthors();
      // Yalnızca rastgele 5 veya 10 yazar gösterelim
      setAuthors(data.slice(0, 8));
      setIsLoading(false);
    };
    loadAuthors();
  }, []);

  return (
    <div className={styles.authorsWrapper}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          <span>✒️</span> Yazar Köşesi
        </h2>
        <Link href="/yazarlar" className={styles.viewAll}>Tümü &rarr;</Link>
      </div>
      
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>Yükleniyor...</div>
      ) : authors.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>Henüz yazar yok.</div>
      ) : (
        <div className={styles.scrollContainer}>
          {authors.map((author) => (
            <Link href={`/yazar/detay?id=${author.id}`} key={author.id} style={{ textDecoration: 'none' }}>
              <div className={styles.authorCard}>
                <div className={styles.avatarWrapper}>
                  <img src={author.image} alt={author.name} className={styles.avatar} />
                </div>
                <div className={styles.name}>{author.name}</div>
                <div className={styles.role}>{author.role}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
