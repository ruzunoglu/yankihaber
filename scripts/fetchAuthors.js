const admin = require("firebase-admin");
const Parser = require("rss-parser");
const cheerio = require("cheerio");

// Firebase yetkilendirmesi için GitHub Secrets'tan gelecek olan JSON string'i alıyoruz
const serviceAccountKeyStr = process.env.FIREBASE_SERVICE_ACCOUNT;
if (!serviceAccountKeyStr) {
  console.error("FIREBASE_SERVICE_ACCOUNT environment variable is missing.");
  process.exit(1);
}

let serviceAccount;
try {
  serviceAccount = JSON.parse(serviceAccountKeyStr);
} catch (error) {
  console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT JSON string.", error);
  process.exit(1);
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();
const parser = new Parser({
  customFields: {
    item: ['creator', 'author', 'dc:creator', 'category', 'enclosure', 'image'],
  }
});

const AUTHOR_RSS_FEEDS = [
  'https://www.haberturk.com/rss/kategori/yazarlar.xml',
  'https://www.sabah.com.tr/rss/yazarlar.xml'
];

function generateId(str) {
  let hash = 0;
  if (!str) return 'rand-' + Math.random().toString(36).substr(2, 9);
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

function toTitleCase(str) {
  return str.replace(
    /\w\S*/g,
    function(txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    }
  );
}

async function scrapeArticle(url) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
      }
    });
    if (!response.ok) return null;
    const html = await response.text();
    const $ = cheerio.load(html);
    
    let content = '';
    let authorImage = null;

    if (url.includes('haberturk.com')) {
      content = $('article .content').text() || $('.content-text').text() || $('article').text();
      // Haberturk yazar resmi genellikle class="author-image" veya benzeri içindedir.
      const imgElem = $('.author-box img').attr('src') || $('.author-img img').attr('src');
      if (imgElem && imgElem.startsWith('http')) authorImage = imgElem;
    } else if (url.includes('sabah.com.tr')) {
      content = $('.newsDetailText').text() || $('.news-detail-content').text() || $('article').text();
      const imgElem = $('.authorImage img').attr('src') || $('.writer-image img').attr('src');
      if (imgElem && imgElem.startsWith('http')) authorImage = imgElem;
    }

    if (content) {
      content = content.replace(/\s+/g, ' ').trim();
    }
    
    return { content, authorImage };
  } catch (e) {
    console.error("Scraping hatası:", url, e.message);
    return null;
  }
}

async function fetchAuthors() {
  console.log("Köşe yazarları RSS okuması ve scraping başladı...");
  const articles = [];
  
  for (const url of AUTHOR_RSS_FEEDS) {
    try {
      const feed = await parser.parseURL(url);
      
      // Sadece ilk 5-10 makaleyi çekelim ki uzun sürmesin (her biri için html indireceğiz)
      const itemsToFetch = feed.items.slice(0, 15);
      
      for (const item of itemsToFetch) {
        let authorName = item.creator || item.author || item['dc:creator'];
        let articleTitle = item.title || '';
        
        // Sabah parsing logic: "AUTHOR NAME / Article Title"
        if (!authorName && articleTitle.includes(' / ')) {
          const parts = articleTitle.split(' / ');
          authorName = toTitleCase(parts[0].trim());
          articleTitle = parts.slice(1).join(' / ').trim();
        }
        
        if (!authorName) continue; // Skip if we still can't find an author
        
        const link = item.link || '';
        const description = item.contentSnippet || item.content || '';
        const cleanSummary = description.replace(/<[^>]*>?/gm, '').substring(0, 200) + '...';
        const pubDate = item.pubDate || item.isoDate;
        
        // Gelişmiş scraping (Makalenin tam metni ve yazar fotoğrafı için)
        let fullContent = item.content || description;
        let authorImage = null;
        
        // RSS'de fotoğraf var mı kontrol edelim
        if (item.enclosure && item.enclosure.url && item.enclosure.url.includes('jpg')) {
          authorImage = item.enclosure.url;
        }
        
        if (link) {
          const scraped = await scrapeArticle(link);
          if (scraped && scraped.content && scraped.content.length > 200) {
            fullContent = scraped.content;
          }
          if (scraped && scraped.authorImage) {
            authorImage = scraped.authorImage;
          }
        }
        
        articles.push({
          id: `author-${generateId(link || articleTitle)}`,
          authorId: generateId(authorName.toLowerCase().replace(/\s+/g, '-')),
          authorName: authorName,
          title: articleTitle,
          summary: cleanSummary,
          content: fullContent, // Artık tam içerik
          image: authorImage, // Makale fotoğrafı veya yazar fotoğrafı
          date: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
          originalLink: link,
          source: url.includes('haberturk') ? 'Habertürk' : 'Sabah'
        });
      }
    } catch (e) {
      console.error("Yazar RSS okuma hatası:", url, e.message);
    }
  }

  // Grup the articles by author
  const authorsMap = {};
  for (const article of articles) {
    if (!authorsMap[article.authorId]) {
      let finalImage = article.image;
      
      // Habertürk yazar resimlerini tahmin edelim ve kontrol edelim
      if (article.source === 'Habertürk') {
        const slug = encodeURIComponent(article.authorName.toLowerCase().replace(/[\s\.]+/g, '-').replace(/[ç]/g, 'c').replace(/[ğ]/g, 'g').replace(/[ı]/g, 'i').replace(/[ö]/g, 'o').replace(/[ş]/g, 's').replace(/[ü]/g, 'u'));
        const htImage = `https://im.haberturk.com/assets/laravel/images/common/other/ht-ozel-icerik-banner/${slug}.png`;
        try {
          const res = await fetch(htImage, { method: 'HEAD' });
          if (res.ok) {
            finalImage = htImage;
          }
        } catch (e) {
          // ignore
        }
      }

      if (!finalImage || finalImage.length < 5) {
        finalImage = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(article.authorName) + '&background=random&size=128';
      }
      
      authorsMap[article.authorId] = {
        id: article.authorId,
        name: article.authorName,
        bio: `${article.source} Gazetesi Köşe Yazarı`,
        role: 'Köşe Yazarı',
        image: finalImage,
        articles: []
      };
    } else if (article.image && !authorsMap[article.authorId].image.includes('ht-ozel') && !authorsMap[article.authorId].image.includes('ui-avatars')) {
        // Zaten gerçek bir fotoğrafımız varsa bir şey yapma
    } else if (article.image && authorsMap[article.authorId].image.includes('ui-avatars')) {
        authorsMap[article.authorId].image = article.image; 
    }
    
    // Temizlenmiş makaleyi diziye ekle
    authorsMap[article.authorId].articles.push(article);
  }
  
  // Sort articles for each author by date
  const authorsList = Object.values(authorsMap);
  authorsList.forEach(author => {
    author.articles.sort((a, b) => new Date(b.date) - new Date(a.date));
  });

  console.log(`Toplam ${authorsList.length} yazar bulundu. Firebase'e kaydediliyor...`);

  try {
    const docRef = db.collection("cache").doc("rss_authors");
    await docRef.set({
      updatedAt: new Date().toISOString(),
      authors: authorsList
    });
    console.log("Köşe yazarları Firebase cache/rss_authors içerisine başarıyla kaydedildi!");
  } catch (e) {
    console.error("Firestore'a kaydederken hata oluştu:", e);
    process.exit(1);
  }
}

fetchAuthors();
