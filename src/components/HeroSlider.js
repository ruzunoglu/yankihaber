"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './HeroSlider.module.css';

export default function HeroSlider({ headlines, categories }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Take up to 4 headlines for the slider
  const slides = headlines.slice(0, 4);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000); // 5 seconds
    return () => clearInterval(timer);
  }, [slides.length]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  if (!slides || slides.length === 0) return null;

  return (
    <div className={styles.sliderWrapper}>
      {slides.map((slide, index) => {
        const category = categories.find(c => c.id === slide.category);
        const isActive = index === currentIndex;
        
        return (
          <Link href={`/haber/detay?id=${slide.id}`} key={slide.id} className={`${styles.slide} ${isActive ? styles.active : ''}`}>
            <img src={slide.image} alt={slide.title} className={styles.slideImage} />
            <div className={styles.slideOverlay}>
              <span 
                className={styles.slideCategory} 
                style={{ background: category?.color }}
              >
                {category?.name}
              </span>
              <h1 className={styles.slideTitle}>{slide.title}</h1>
              <p className={styles.slideSummary}>{slide.summary}</p>
            </div>
          </Link>
        );
      })}

      <div className={styles.controls}>
        <button className={styles.navButton} onClick={prevSlide}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <button className={styles.navButton} onClick={nextSlide}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>

      <div className={styles.thumbnails}>
        {slides.map((slide, index) => {
          const isActive = index === currentIndex;
          return (
            <div 
              key={`thumb-${slide.id}`} 
              className={`${styles.thumbnail} ${isActive ? styles.active : ''}`}
              onClick={() => goToSlide(index)}
            >
              <div className={styles.progressContainer}>
                {isActive && <div className={styles.progressBar}></div>}
              </div>
              <h4 className={styles.thumbnailTitle}>{slide.title}</h4>
            </div>
          );
        })}
      </div>
    </div>
  );
}
