import { collection, getDocs, doc, getDoc, query, orderBy, limit } from 'firebase/firestore';
import { db } from './firebaseConfig';

// SEO Dostu URL oluşturucu
function createSeoSlug(title) {
  const trMap = {
    'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
    'Ç': 'c', 'Ğ': 'g', 'İ': 'i', 'Ö': 'o', 'Ş': 's', 'Ü': 'u'
  };
  let slug = title.replace(/[çğıöşüÇĞİÖŞÜ]/g, match => trMap[match] || match);
  slug = slug.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
  return slug.substring(0, 70);
}

// RSS Haberlerini Firestore Cache üzerinden getirir
async function fetchCachedRssNews() {
  if (!db) return [];
  try {
    const docRef = doc(db, 'cache', 'rss_news');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data().items || [];
    }
    return [];
  } catch (error) {
    console.error("Önbellekten RSS haberleri çekilemedi:", error);
    return [];
  }
}

// Firebase Firestore'dan "Özel Haberleri" Çeker
async function fetchCustomNews() {
  if (!db) return [];
  try {
    const q = query(collection(db, 'news'), orderBy('date', 'desc'), limit(10));
    const querySnapshot = await getDocs(q);
    
    const customNews = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      customNews.push({
        id: docSnap.id,
        title: data.title,
        summary: data.summary,
        content: data.content,
        image: data.image,
        category: data.category,
        date: data.date?.toDate ? data.date.toDate().toISOString() : data.date,
        source: 'Özel Haber',
        isHeadline: data.isHeadline || false
      });
    });
    
    return customNews;
  } catch (error) {
    console.warn("Firestore'dan özel haber çekilemedi.", error);
    return [];
  }
}

// Firebase'den gizlenen ve düzenlenen haberlerin (Override) listesini çeker
async function getOverrides() {
  if (!db) return { hidden: [], edited: {} };
  try {
    const hiddenSnap = await getDocs(collection(db, 'hidden_news'));
    const hidden = hiddenSnap.docs.map(docSnap => docSnap.id);
    
    const editedSnap = await getDocs(collection(db, 'edited_news'));
    const edited = {};
    editedSnap.docs.forEach(docSnap => {
      edited[docSnap.id] = docSnap.data();
    });
    
    return { hidden, edited };
  } catch (error) {
    return { hidden: [], edited: {} };
  }
}

// Tüm kaynakları birleştiren Ana Fonksiyon
export async function getAllNews() {
  const promises = [
    fetchCachedRssNews(),
    fetchCustomNews(),
    getOverrides()
  ];
  
  const [rssNews, customNews, overrides] = await Promise.all(promises);
  
  let allNews = [...rssNews, ...customNews];
  
  allNews = allNews.filter(news => !overrides.hidden.includes(news.id));
  
  allNews = allNews.map(news => {
    if (overrides.edited[news.id]) {
      return { ...news, ...overrides.edited[news.id], isEdited: true };
    }
    return news;
  });
  
  allNews.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  allNews = allNews.map(news => {
    return { ...news, seoUrl: news.seoUrl || `${createSeoSlug(news.title)}-${news.id}` };
  });
  
  return allNews;
}

export async function getNewsByCategory(categoryId) {
  const allNews = await getAllNews();
  return allNews.filter(n => n.category === categoryId);
}

export async function getNewsById(id) {
  const allNews = await getAllNews();
  return allNews.find(n => n.id === id || n.seoUrl === id);
}
