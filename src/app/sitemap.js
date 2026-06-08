export const dynamic = "force-static";
import { getAllNews } from '../services/newsAggregator';

export default async function sitemap() {
  const baseUrl = 'https://yankihabersitesi.web.app';
  
  // Fetch all news
  const allNews = await getAllNews();
  
  const newsUrls = allNews.map((news) => ({
    url: `${baseUrl}/haber/${news.seoUrl || news.id}`,
    lastModified: new Date(news.date || new Date()),
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  const categories = ['gundem', 'ekonomi', 'spor', 'teknoloji', 'dunya', 'saglik', 'kultur-sanat', 'yasam'];
  const categoryUrls = categories.map((cat) => ({
    url: `${baseUrl}/kategori/${cat}`,
    lastModified: new Date(),
    changeFrequency: 'hourly',
    priority: 0.9,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 1,
    },
    ...categoryUrls,
    ...newsUrls,
  ];
}
