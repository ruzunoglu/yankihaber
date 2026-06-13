import Link from 'next/link';
import { categories } from '../data/mockNews';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.topSection}>
          <div className={styles.brandSection}>
            <Link href="/" className={styles.logo}>
              <svg className={styles.logoIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="url(#paint0_linear_gradient_footer)" />
                <path d="M2 17L12 22L22 17" stroke="url(#paint0_linear_gradient_footer)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 12L12 17L22 12" stroke="url(#paint0_linear_gradient_footer)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <defs>
                  <linearGradient id="paint0_linear_gradient_footer" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                    <stop stopColor="var(--accent-secondary)" />
                    <stop offset="1" stopColor="#4f46e5" />
                  </linearGradient>
                </defs>
              </svg>
              <span className={styles.logoText}>YANKI<span>.</span></span>
            </Link>
            <p className={styles.brandDescription}>
              Türkiye'nin en yenilikçi, hızlı ve tarafsız dijital haber platformu. Gündemin nabzını bizimle tutun.
            </p>
            <div className={styles.socialLinks}>
              <a href="#" aria-label="Twitter">X</a>
              <a href="#" aria-label="Facebook">f</a>
              <a href="#" aria-label="Instagram">in</a>
              <a href="#" aria-label="YouTube">▶</a>
            </div>
          </div>
          
          <div className={styles.linksSection}>
            <h4 className={styles.linksTitle}>Kategoriler</h4>
            <ul className={styles.linksList}>
              {categories.slice(0, 6).map(cat => (
                <li key={cat.id}>
                  <Link href={`/kategori/detay?id=${cat.id}`}>{cat.name}</Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div className={styles.linksSection}>
            <h4 className={styles.linksTitle}>Kurumsal</h4>
            <ul className={styles.linksList}>
              <li><Link href="#">Hakkımızda</Link></li>
              <li><Link href="#">Künye</Link></li>
              <li><Link href="#">İletişim</Link></li>
              <li><Link href="#">Gizlilik Politikası</Link></li>
              <li><Link href="#">Kullanım Şartları</Link></li>
              <li><Link href="#">Çerez Politikası</Link></li>
            </ul>
          </div>
        </div>
        
        <div className={styles.bottomSection}>
          <p>&copy; {new Date().getFullYear()} YANKI Haber. Tüm hakları saklıdır.</p>
          <div className={styles.badges}>
            <span>100% Bağımsız Gazetecilik</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
