import { collection, addDoc, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebaseConfig';

export async function uploadImage(file, apiKey) {
  if (!apiKey) throw new Error("ImgBB API Anahtarı eksik! Lütfen Site Ayarları bölümünden ekleyin.");
  
  try {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: 'POST',
      body: formData
    });
    
    const data = await response.json();
    if (data.success) {
      return data.data.url; // Returns the direct image URL
    } else {
      throw new Error(data.error?.message || "Resim yüklenemedi.");
    }
  } catch (error) {
    console.error("Fotoğraf yüklenirken hata: ", error);
    throw error;
  }
}

export async function addCustomNews(newsData) {
  if (!db) throw new Error("Firebase bağlantısı yok.");
  
  try {
    const docRef = await addDoc(collection(db, "news"), {
      ...newsData,
      date: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Haber eklenirken hata: ", error);
    throw error;
  }
}

export async function hideNews(newsId) {
  if (!db) throw new Error("Firebase bağlantısı yok.");
  
  try {
    // Haber ID'sini gizlenenler listesine ekle
    await setDoc(doc(db, "hidden_news", newsId), {
      hiddenAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error("Haber gizlenirken hata: ", error);
    throw error;
  }
}

export async function editNewsOverride(newsId, updatedData) {
  if (!db) throw new Error("Firebase bağlantısı yok.");
  
  try {
    // Haberin düzenlenmiş halini kaydet
    await setDoc(doc(db, "edited_news", newsId), {
      ...updatedData,
      editedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error("Haber düzenlenirken hata: ", error);
    throw error;
  }
}

export async function saveSiteSettings(settingsData) {
  if (!db) throw new Error("Firebase bağlantısı yok.");
  
  try {
    await setDoc(doc(db, "settings", "global"), {
      ...settingsData,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error("Ayarlar kaydedilirken hata: ", error);
    throw error;
  }
}

export async function getSiteSettings() {
  if (!db) return null;
  
  try {
    const docSnap = await getDoc(doc(db, "settings", "global"));
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (error) {
    return null;
  }
}
