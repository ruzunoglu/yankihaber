const admin = require("firebase-admin");
const Parser = require("rss-parser");

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
    item: ['creator', 'author', 'dc:creator', 'category'],
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

async function fetchAuthors() {
  console.log("Köşe yazarları RSS okuması başladı...");
  const articles = [];
  
  for (const url of AUTHOR_RSS_FEEDS) {
    try {
      const feed = await parser.parseURL(url);
      
      for (const item of feed.items) {
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
        
        articles.push({
          id: `author-${generateId(link || articleTitle)}`,
          authorId: generateId(authorName.toLowerCase().replace(/\s+/g, '-')),
          authorName: authorName,
          title: articleTitle,
          summary: cleanSummary,
          content: item.content || description,
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
  articles.forEach(article => {
    if (!authorsMap[article.authorId]) {
      authorsMap[article.authorId] = {
        id: article.authorId,
        name: article.authorName,
        bio: `${article.source} Gazetesi Köşe Yazarı`,
        role: 'Köşe Yazarı',
        image: 'https://ui-avatars.com/api/?name=' + encodeURIComponent(article.authorName) + '&background=random&size=128',
        articles: []
      };
    }
    // Sadece yazar adı veya bio bilgisini tutmak yerine makaleyi de diziye ekleyelim
    authorsMap[article.authorId].articles.push(article);
  });
  
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
