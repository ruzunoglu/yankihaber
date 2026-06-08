"use client";

import { useState, useEffect } from 'react';
import { categories } from '../../data/mockNews';
import { addCustomNews, hideNews, editNewsOverride, saveSiteSettings, getSiteSettings, uploadImage } from '../../services/adminService';
import { getAllNews } from '../../services/newsAggregator';
import styles from './page.module.css';
import Link from 'next/link';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [activeTab, setActiveTab] = useState('dashboard');
  const [allNews, setAllNews] = useState([]);
  const [isLoadingNews, setIsLoadingNews] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ type: '', text: '' });

  // News Form States
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [category, setCategory] = useState('gundem');
  const [isHeadline, setIsHeadline] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Settings States
  const [siteName, setSiteName] = useState('YANKI.');
  const [siteDescription, setSiteDescription] = useState('Premium Haber Platformu');
  const [imgbbApiKey, setImgbbApiKey] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      loadNews();
      loadSettings();
    }
  }, [isAuthenticated]);

  const loadNews = async () => {
    setIsLoadingNews(true);
    try {
      const news = await getAllNews();
      setAllNews(news);
    } catch (e) {
      console.error(e);
    }
    setIsLoadingNews(false);
  };

  const loadSettings = async () => {
    const s = await getSiteSettings();
    if (s) {
      setSiteName(s.siteName || 'YANKI.');
      setSiteDescription(s.siteDescription || 'Premium Haber Platformu');
      setImgbbApiKey(s.imgbbApiKey || '');
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === 'admin' && password === 'alivelideli') {
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Kullanıcı adı veya şifre hatalı!');
    }
  };

  const showMessage = (type, text) => {
    setSubmitMessage({ type, text });
    setTimeout(() => setSubmitMessage({ type: '', text: '' }), 5000);
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await saveSiteSettings({ siteName, siteDescription, imgbbApiKey });
      showMessage('success', 'Site ayarları başarıyla kaydedildi!');
    } catch (e) {
      showMessage('error', 'Firebase ayarları eksik. Lütfen yapılandırın.');
    }
    setIsSubmitting(false);
  };

  const handleSubmitNews = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let finalImageUrl = image;
      if (imageFile) {
        if (!imgbbApiKey) {
          showMessage('error', 'ImgBB API Anahtarı eksik! Lütfen Ayarlar sayfasından ekleyin.');
          setIsSubmitting(false);
          return;
        }
        finalImageUrl = await uploadImage(imageFile, imgbbApiKey);
      }

      const newsData = { title, summary, content, image: finalImageUrl, category, isHeadline };
      if (editingId) {
        await editNewsOverride(editingId, newsData);
        showMessage('success', 'Haber başarıyla güncellendi!');
      } else {
        await addCustomNews(newsData);
        showMessage('success', 'Yeni haber başarıyla yayınlandı!');
      }
      
      resetForm();
      loadNews();
      setActiveTab('newsList');
    } catch (error) {
      showMessage('error', error.message || 'Hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Bu haberi silmek/gizlemek istediğinize emin misiniz?')) {
      try {
        await hideNews(id);
        showMessage('success', 'Haber başarıyla gizlendi!');
        loadNews();
      } catch (e) {
        showMessage('error', 'Hata! Firebase ayarları eksik olabilir.');
      }
    }
  };

  const handleEdit = (news) => {
    setEditingId(news.id);
    setTitle(news.title);
    setSummary(news.summary);
    setContent(news.content);
    setImage(news.image);
    setCategory(news.category);
    setIsHeadline(news.isHeadline || false);
    setActiveTab('addNews');
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setSummary('');
    setContent('');
    setImage('');
    setImageFile(null);
    setIsHeadline(false);
  };

  if (!isAuthenticated) {
    return (
      <div className={styles.adminWrapper} style={{ alignItems: 'center' }}>
        <div className={styles.loginBox}>
          <h1 className={styles.loginTitle}>Yönetim Paneli</h1>
          <p className={styles.loginDesc}>Lütfen giriş bilgilerinizi yazın.</p>
          <form onSubmit={handleLogin}>
            <div className={styles.inputGroup}>
              <label>Kullanıcı Adı</label>
              <input type="text" className={styles.input} value={username} onChange={(e) => setUsername(e.target.value)} required />
            </div>
            <div className={styles.inputGroup}>
              <label>Şifre</label>
              <input type="password" className={styles.input} value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            {loginError && <p className={styles.errorMsg}>{loginError}</p>}
            <button type="submit" className={styles.btn} style={{ marginTop: '1rem' }}>Giriş Yap</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.adminWrapper}>
      {/* Sidebar */}
      <div className={styles.sidebar}>
        <div className={styles.brand}>YANKI<span>.</span> Panel</div>
        <nav className={styles.navMenu}>
          <button className={`${styles.navItem} ${activeTab === 'dashboard' ? styles.active : ''}`} onClick={() => setActiveTab('dashboard')}>📊 Genel Bakış</button>
          <button className={`${styles.navItem} ${activeTab === 'newsList' ? styles.active : ''}`} onClick={() => setActiveTab('newsList')}>📰 Haber Yönetimi</button>
          <button className={`${styles.navItem} ${activeTab === 'addNews' ? styles.active : ''}`} onClick={() => { resetForm(); setActiveTab('addNews'); }}>➕ Yeni Ekle</button>
          <button className={`${styles.navItem} ${activeTab === 'settings' ? styles.active : ''}`} onClick={() => setActiveTab('settings')}>⚙️ Site Ayarları</button>
        </nav>
        <button onClick={() => setIsAuthenticated(false)} className={styles.navItem} style={{ marginTop: 'auto', color: 'var(--category-gundem)' }}>🚪 Çıkış Yap</button>
      </div>

      {/* Main Content */}
      <div className={styles.contentArea}>
        {submitMessage.text && (
          <div className={submitMessage.type === 'success' ? styles.successMsg : styles.errorMsg} style={submitMessage.type === 'error' ? { padding: '1rem', background: 'rgba(225,29,72,0.1)', border: '1px solid var(--category-gundem)', borderRadius: 'var(--radius-lg)', textAlign: 'center', marginBottom: '1.5rem' } : {}}>
            {submitMessage.text}
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div>
            <div className={styles.pageHeader}>
              <h1 className={styles.pageTitle}>Genel Bakış</h1>
            </div>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statTitle}>Toplam Haber Sayısı</div>
                <div className={styles.statValue}>{isLoadingNews ? '...' : allNews.length}</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statTitle}>Özel Haber (Senin Eklediğin)</div>
                <div className={styles.statValue}>{isLoadingNews ? '...' : allNews.filter(n => n.source === 'Özel Haber').length}</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statTitle}>Toplam Okunma (Tahmini)</div>
                <div className={styles.statValue}>{allNews.length * 142}</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'newsList' && (
          <div>
            <div className={styles.pageHeader}>
              <h1 className={styles.pageTitle}>Haber Yönetimi</h1>
            </div>
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Başlık</th>
                    <th>Kategori</th>
                    <th>Kaynak</th>
                    <th>Tarih</th>
                    <th>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoadingNews ? <tr><td colSpan="5" style={{textAlign:'center'}}>Yükleniyor...</td></tr> : 
                    allNews.map(news => (
                      <tr key={news.id}>
                        <td style={{fontWeight: 600}}>{news.title.substring(0,50)}...</td>
                        <td>{categories.find(c=>c.id === news.category)?.name}</td>
                        <td><span style={{padding: '4px 8px', borderRadius: '4px', background: news.source === 'Özel Haber' ? 'var(--accent-primary)' : 'rgba(0,0,0,0.1)', color: news.source === 'Özel Haber' ? '#fff' : 'inherit', fontSize: '0.8rem'}}>{news.source}</span></td>
                        <td>{new Date(news.date).toLocaleDateString('tr-TR')}</td>
                        <td>
                          <button className={`${styles.actionBtn} ${styles.btnEdit}`} onClick={() => handleEdit(news)}>Düzenle</button>
                          <button className={`${styles.actionBtn} ${styles.btnDelete}`} onClick={() => handleDelete(news.id)}>Sil</button>
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'addNews' && (
          <div>
            <div className={styles.pageHeader}>
              <h1 className={styles.pageTitle}>{editingId ? 'Haberi Düzenle' : 'Yeni Haber Ekle'}</h1>
            </div>
            <form onSubmit={handleSubmitNews} className={styles.formGrid}>
              <div className={styles.inputGroup}>
                <label>Haber Başlığı</label>
                <input type="text" className={styles.input} value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
              <div className={styles.inputGroup}>
                <label>Kapak Fotoğrafı {image && !imageFile ? '(Mevcut)' : ''}</label>
                <input 
                  type="file" 
                  accept="image/*"
                  className={styles.input} 
                  style={{ padding: '0.5rem' }}
                  onChange={(e) => {
                    if (e.target.files[0]) {
                      setImageFile(e.target.files[0]);
                      setImage(URL.createObjectURL(e.target.files[0]));
                    }
                  }} 
                  required={!image} 
                />
                {image && (
                  <div style={{ marginTop: '1rem' }}>
                    <img src={image} alt="Önizleme" style={{ height: '120px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }} />
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: '1.5rem' }}>
                <div className={styles.inputGroup} style={{ flex: 1 }}>
                  <label>Kategori</label>
                  <select className={styles.input} value={category} onChange={(e) => setCategory(e.target.value)} required>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className={styles.inputGroup} style={{ flex: 1, display: 'flex', alignItems: 'center', marginTop: '1.5rem' }}>
                  <label className={styles.checkboxGroup}>
                    <input type="checkbox" checked={isHeadline} onChange={(e) => setIsHeadline(e.target.checked)} style={{ width: '20px', height: '20px' }} />
                    Manşet (Slider) olarak göster
                  </label>
                </div>
              </div>
              <div className={styles.inputGroup}>
                <label>Kısa Özet</label>
                <textarea className={`${styles.input} ${styles.textarea}`} style={{ minHeight: '80px' }} value={summary} onChange={(e) => setSummary(e.target.value)} required />
              </div>
              <div className={styles.inputGroup}>
                <label>Haberin İçeriği</label>
                <textarea className={`${styles.input} ${styles.textarea}`} value={content} onChange={(e) => setContent(e.target.value)} required />
              </div>
              <button type="submit" className={styles.btn} disabled={isSubmitting}>
                {isSubmitting ? 'Kaydediliyor...' : (editingId ? 'Değişiklikleri Kaydet' : 'Haberi Yayınla')}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'settings' && (
          <div>
            <div className={styles.pageHeader}>
              <h1 className={styles.pageTitle}>Site Ayarları</h1>
            </div>
            <form onSubmit={handleSaveSettings} className={styles.formGrid}>
              <div className={styles.inputGroup}>
                <label>Site İsmi</label>
                <input type="text" className={styles.input} value={siteName} onChange={(e) => setSiteName(e.target.value)} required />
              </div>
              <div className={styles.inputGroup}>
                <label>Slogan / Açıklama</label>
                <input type="text" className={styles.input} value={siteDescription} onChange={(e) => setSiteDescription(e.target.value)} required />
              </div>
              <div className={styles.inputGroup}>
                <label>ImgBB API Anahtarı (Fotoğraf Yüklemek İçin)</label>
                <input type="text" className={styles.input} value={imgbbApiKey} onChange={(e) => setImgbbApiKey(e.target.value)} placeholder="Örn: 9d8f... (Zorunlu Değil, sadece resim yükleyecekseniz)" />
                <small style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', display: 'block' }}>
                  Ücretsiz API anahtarı almak için: <a href="https://api.imgbb.com/" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-primary)', textDecoration: 'underline' }}>api.imgbb.com</a> adresine gidip hesap oluşturun.
                </small>
              </div>
              <button type="submit" className={styles.btn} disabled={isSubmitting}>
                {isSubmitting ? 'Kaydediliyor...' : 'Ayarları Kaydet'}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
