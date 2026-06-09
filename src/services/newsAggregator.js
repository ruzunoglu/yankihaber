import { collection, getDocs, doc, getDoc, query, orderBy, limit, where } from 'firebase/firestore';
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

// Tüm haberleri çeker (Sınırlandırılarak site performansı korunur)
export async function getAllNews(limitCount = 500) {
  if (!db) return [];
  try {
    const q = query(collection(db, 'news'), orderBy('date', 'desc'), limit(limitCount));
    const querySnapshot = await getDocs(q);
    
    const overrides = await getOverrides();
    let allNews = [];
    
    querySnapshot.forEach((docSnap) => {
      // Gizlenen haberleri atla
      if (overrides.hidden.includes(docSnap.id)) return;
      
      const data = docSnap.data();
      let newsItem = {
        id: docSnap.id,
        ...data,
        source: data.source || 'Özel Haber',
        date: data.date?.toDate ? data.date.toDate().toISOString() : data.date,
        isHeadline: data.isHeadline || false
      };
      
      // Eğer düzeltme yapıldıysa (admin panelinden) uygula
      if (overrides.edited[docSnap.id]) {
        newsItem = { ...newsItem, ...overrides.edited[docSnap.id], isEdited: true };
      }
      
      newsItem.seoUrl = newsItem.seoUrl || `${createSeoSlug(newsItem.title)}-${newsItem.id}`;
      allNews.push(newsItem);
    });
    
    return allNews;
  } catch (error) {
    console.error("Haberler çekilemedi:", error);
    return [];
  }
}

export async function getNewsByCategory(categoryId) {
  if (!db) return [];
  try {
    const q = query(collection(db, 'news'), where('category', '==', categoryId), orderBy('date', 'desc'), limit(100));
    const querySnapshot = await getDocs(q);
    
    const overrides = await getOverrides();
    let catNews = [];
    
    querySnapshot.forEach((docSnap) => {
      if (overrides.hidden.includes(docSnap.id)) return;
      
      const data = docSnap.data();
      let newsItem = {
        id: docSnap.id,
        ...data,
        source: data.source || 'Özel Haber',
        date: data.date?.toDate ? data.date.toDate().toISOString() : data.date
      };
      
      if (overrides.edited[docSnap.id]) {
        newsItem = { ...newsItem, ...overrides.edited[docSnap.id], isEdited: true };
      }
      
      newsItem.seoUrl = newsItem.seoUrl || `${createSeoSlug(newsItem.title)}-${newsItem.id}`;
      catNews.push(newsItem);
    });
    return catNews;
  } catch (error) {
    console.error("Kategori haberleri çekilemedi:", error);
    return [];
  }
}

export async function getNewsById(id) {
  if (!db) return null;
  try {
    // 1. Önce ID'nin direkt belge ID'si olup olmadığına bakalım
    let docRef = doc(db, 'news', id);
    let docSnap = await getDoc(docRef);
    let data = null;
    let docId = id;

    if (docSnap.exists()) {
      data = docSnap.data();
    } else {
      // 2. SEO URL olabileceği ihtimaliyle tüm haberleri çekip arayalım (Çünkü SEO URL ayrı indexlenmemiş olabilir)
      // Arşiv çok büyükse bu yavaşlatabilir ama SEO URL -> ID eşleşmesi için ID'yi URL sonundan da koparabiliriz.
      const match = id.match(/-([^-]+)$/); // URL sonundaki ID'yi bul (örnek: -rss-dunya-x123)
      if (match) {
        const extractedId = id.substring(id.lastIndexOf('-') + 1);
        docRef = doc(db, 'news', extractedId);
        docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          data = docSnap.data();
          docId = extractedId;
        } else {
            // Some IDs have dashes in them (e.g., rss-dunya-xyz). The regex match is too naive.
            // Let's just do a direct find from a limited fetch if not found directly
            const all = await getAllNews(1000);
            const found = all.find(n => n.id === id || n.seoUrl === id);
            return found || null;
        }
      } else {
          const all = await getAllNews(1000);
          const found = all.find(n => n.id === id || n.seoUrl === id);
          return found || null;
      }
    }

    if (data) {
      const overrides = await getOverrides();
      if (overrides.hidden.includes(docId)) return null;

      let newsItem = {
        id: docId,
        ...data,
        source: data.source || 'Özel Haber',
        date: data.date?.toDate ? data.date.toDate().toISOString() : data.date
      };

      if (overrides.edited[docId]) {
        newsItem = { ...newsItem, ...overrides.edited[docId], isEdited: true };
      }
      
      newsItem.seoUrl = newsItem.seoUrl || `${createSeoSlug(newsItem.title)}-${newsItem.id}`;
      return newsItem;
    }

    return null;
  } catch (error) {
    console.error("Haber detayı çekilemedi:", error);
    return null;
  }
}
