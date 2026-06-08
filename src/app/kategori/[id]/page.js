import Link from 'next/link';
import { categories } from '../../../data/mockNews';
import { getNewsByCategory } from '../../../services/newsAggregator';
import styles from './page.module.css';

export async function generateStaticParams() {
  return categories.map((cat) => ({
    id: cat.id,
  }));
}

export default async function CategoryPage({ params }) {
  const { id } = await params;
  const category = categories.find(c => c.id === id);
  
  if (!category) {
    return <div style={{textAlign: 'center', padding: '5rem'}}>Kategori bulunamadı.</div>;
  }

  const newsList = await getNewsByCategory(id);

  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('tr-TR', options);
  };

  return (
    <div className={styles.categoryWrapper}>
      {/* Header */}
      <div style={{ position: 'relative', zIndex: 100, background: 'var(--bg-header)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-4) var(--space-6)' }}>
          <Link href="/" style={{ fontSize: '1.5rem', fontWeight: 900, background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-1px' }}>
            YANKI<span style={{ color: 'var(--accent-secondary)', WebkitTextFillColor: 'var(--accent-secondary)' }}>.</span>
          </Link>
          <Link href="/" style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            &larr; Ana Sayfaya Dön
          </Link>
        </div>
      </div>

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
        {newsList.length === 0 ? (
          <div className={styles.emptyState}>Bu kategoride henüz haber bulunmuyor.</div>
        ) : (
          <div className={styles.newsGrid}>
            {newsList.map((news) => (
              <Link href={`/haber/${news.id}`} key={news.id} className={styles.glassCard}>
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
