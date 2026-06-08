const { onSchedule } = require("firebase-functions/v2/scheduler");
const { getFirestore } = require("firebase-admin/firestore");
const admin = require("firebase-admin");
const Parser = require("rss-parser");

admin.initializeApp();
const db = getFirestore();
const parser = new Parser({
  customFields: {
    item: ['enclosure', 'thumbnail'],
  }
});

const RSS_FEEDS = {
  gundem: [
    'https://www.trthaber.com/gundem_articles.rss',
    'https://www.haberturk.com/rss/kategori/gundem.xml',
    'https://www.ntv.com.tr/gundem.rss'
  ],
  ekonomi: [
    'https://www.trthaber.com/ekonomi_articles.rss',
    'https://www.haberturk.com/rss/kategori/ekonomi.xml',
    'https://www.ntv.com.tr/ekonomi.rss'
  ],
  spor: [
    'https://www.trthaber.com/spor_articles.rss',
    'https://www.haberturk.com/rss/kategori/spor.xml',
    'https://www.ntv.com.tr/spor.rss'
  ],
  teknoloji: [
    'https://www.trthaber.com/bilim_teknoloji_articles.rss',
    'https://www.haberturk.com/rss/kategori/teknoloji.xml',
    'https://www.ntv.com.tr/teknoloji.rss'
  ],
  dunya: [
    'https://www.trthaber.com/dunya_articles.rss',
    'https://www.haberturk.com/rss/kategori/dunya.xml',
    'https://www.ntv.com.tr/dunya.rss'
  ],
};

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

function createSeoSlug(title) {
  const trMap = {
    'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
    'Ç': 'c', 'Ğ': 'g', 'İ': 'i', 'Ö': 'o', 'Ş': 's', 'Ü': 'u'
  };
  let slug = title.replace(/[çğıöşüÇĞİÖŞÜ]/g, match => trMap[match] || match);
  slug = slug.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
  return slug.substring(0, 70);
}

async function fetchRssNews(category, url) {
  try {
    const feed = await parser.parseURL(url);
    
    return feed.items.map((item) => {
      const title = item.title || '';
      const link = item.link || '';
      const description = item.contentSnippet || item.content || '';
      
      let image = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1000';
      if (item.enclosure && item.enclosure.url) {
        image = item.enclosure.url;
      } else if (item.thumbnail) {
        image = item.thumbnail;
      }

      const pubDate = item.pubDate || item.isoDate;
      const cleanSummary = description.replace(/<[^>]*>?/gm, '').substring(0, 150) + '...';

      return {
        id: `rss-${category}-${generateId(link || title)}`,
        title,
        summary: cleanSummary,
        content: item.content || description,
        image,
        category,
        date: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
        source: 'RSS',
        originalLink: link
      };
    });
  } catch (error) {
    console.error(`RSS Error (${category} - ${url}):`, error.message);
    return [];
  }
}

exports.fetchAndCacheNews = onSchedule({
  schedule: "every 5 minutes",
  timeZone: "Europe/Istanbul",
  retryCount: 0,
  maxInstances: 1
}, async (event) => {
  console.log("Haber çekme görevi başladı...");
  const promises = [];
  
  for (const [category, urls] of Object.entries(RSS_FEEDS)) {
    for (const url of urls) {
      promises.push(fetchRssNews(category, url));
    }
  }
  
  const results = await Promise.all(promises);
  let allNews = results.flat();
  
  allNews.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  allNews = allNews.map(news => {
    return { ...news, seoUrl: `${createSeoSlug(news.title)}-${news.id}` };
  });

  const finalNews = allNews.slice(0, 400);

  try {
    await db.collection("cache").doc("rss_news").set({
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      items: finalNews
    });
    console.log(`Başarıyla ${finalNews.length} haber Firestore'a kaydedildi.`);
  } catch (e) {
    console.error("Firestore'a kaydederken hata oluştu:", e);
  }
});
