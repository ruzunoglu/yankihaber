import Link from 'next/link';
import { categories } from '../../../data/mockNews';
import { getAllNews, getNewsById, getNewsByCategory } from '../../../services/newsAggregator';
import ReadTracker from '../../../components/ReadTracker';
import styles from './page.module.css';

export async function generateStaticParams() {
  const allNews = await getAllNews();
  return allNews.map((news) => ({
    id: news.id.toString(),
  }));
}

export default async function NewsDetail({ params }) {
  const { id } = await params;
  const article = await getNewsById(id);

  if (!article) {
    return <div style={{textAlign: 'center', padding: '5rem'}}>Haber bulunamadı.</div>;
  }

  const category = categories.find(c => c.id === article.category);
  
  // Get related news (same category, exclude current)
  const categoryNews = await getNewsByCategory(article.category);
  const relatedNews = categoryNews
    .filter(n => n.id !== id)
    .slice(0, 3);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute:'2-digit' };
    return new Date(dateString).toLocaleDateString('tr-TR', options);
  };

  // Calculate random reading time between 2 to 8 mins
  const readingTime = Math.floor(article.summary.length / 50) || 3;

  return (
    <div className={styles.articleWrapper}>
      <ReadTracker />
      {/* Simple Header */}
      <header className={styles.simpleHeader}>
        <div className={`container ${styles.nav}`}>
          <Link href="/" className={styles.logo}>
            YANKI<span>.</span>
          </Link>
          <Link href={`/kategori/${category?.id}`} className={styles.backLink}>
            &larr; {category?.name} Haberlerine Dön
          </Link>
        </div>
      </header>

      {/* Hero Image & Title */}
      <div className={styles.heroContainer}>
        <img src={article.image} alt={article.title} className={styles.heroImage} />
        <div className={styles.heroOverlay}>
          <div className={styles.heroContent}>
            <span className={styles.categoryBadge} style={{ background: category?.color }}>
              {category?.name}
            </span>
            <h1 className={styles.articleTitle}>{article.title}</h1>
            <div className={styles.metaInfo}>
              <div className={styles.metaItem}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                <span>Haber Merkezi</span>
              </div>
              <div className={styles.metaItem}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                <span>{formatDate(article.date)}</span>
              </div>
              <div className={styles.metaItem}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
                <span>{readingTime} Dk Okuma</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className={styles.articleBody}>
        <p className={styles.articleSummary}>{article.summary}</p>
        
        <div className={styles.articleText} dangerouslySetInnerHTML={{ __html: article.content }}>
        </div>

        {/* Share Actions */}
        <div className={styles.actions}>
          <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Haberi Paylaş</span>
          <div className={styles.shareButtons}>
            <button className={styles.shareBtn} aria-label="Twitter'da Paylaş">X</button>
            <button className={styles.shareBtn} aria-label="Facebook'ta Paylaş">f</button>
            <button className={styles.shareBtn} aria-label="Bağlantıyı Kopyala">🔗</button>
          </div>
        </div>
      </div>

      {/* Related News (Re-using some global styles) */}
      {relatedNews.length > 0 && (
        <div className={styles.relatedSection}>
          <h2 className="section-title">İlginizi Çekebilir</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-6)' }}>
            {relatedNews.map((news) => (
              <Link href={`/haber/${news.id}`} key={news.id} style={{ display: 'block', background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)', overflow: 'hidden', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                <img src={news.image} alt={news.title} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                <div style={{ padding: 'var(--space-4)' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{news.title}</h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{news.summary}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
