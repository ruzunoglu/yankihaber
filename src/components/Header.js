"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { categories } from '../data/mockNews';
import { getSiteSettings } from '../services/adminService';
import styles from './Header.module.css';

export default function Header() {
  const [siteName, setSiteName] = useState('YANKI');

  useEffect(() => {
    const loadSettings = async () => {
      const settings = await getSiteSettings();
      if (settings && settings.siteName) {
        setSiteName(settings.siteName.replace('.', ''));
      }
    };
    loadSettings();
  }, []);

  return (
    <div className={styles.headerWrapper}>
      <header className={styles.header}>
        <Link href="/" className={styles.logo}>
          {siteName}<span>.</span>
        </Link>
        <ul className={styles.categoriesList}>
          {categories.map((cat) => (
            <li key={cat.id}>
              <Link href={`/kategori/detay?id=${cat.id}`} className={styles.categoryLink}>
                {cat.name}
              </Link>
            </li>
          ))}
        </ul>
      </header>
    </div>
  );
}
