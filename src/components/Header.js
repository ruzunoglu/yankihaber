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
          <svg className={styles.logoIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="url(#paint0_linear_gradient)" />
            <path d="M2 17L12 22L22 17" stroke="url(#paint0_linear_gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M2 12L12 17L22 12" stroke="url(#paint0_linear_gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <defs>
              <linearGradient id="paint0_linear_gradient" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                <stop stopColor="var(--accent-secondary)" />
                <stop offset="1" stopColor="#4f46e5" />
              </linearGradient>
            </defs>
          </svg>
          <span className={styles.logoText}>{siteName}<span>.</span></span>
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
