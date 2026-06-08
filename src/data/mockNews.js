export const categories = [
  { id: 'gundem', name: 'Gündem', color: '#e11d48' },
  { id: 'ekonomi', name: 'Ekonomi', color: '#16a34a' },
  { id: 'spor', name: 'Spor', color: '#2563eb' },
  { id: 'teknoloji', name: 'Teknoloji', color: '#9333ea' },
  { id: 'dunya', name: 'Dünya', color: '#0891b2' },
  { id: 'saglik', name: 'Sağlık', color: '#0d9488' },
  { id: 'kultur-sanat', name: 'Kültür Sanat', color: '#ca8a04' },
  { id: 'yasam', name: 'Yaşam', color: '#ea580c' }
];

export const mockNews = [
  {
    id: 1,
    title: "Yapay Zeka Yeni Bir Çağ Açıyor: Eğitim ve İş Dünyası Yeniden Şekilleniyor",
    summary: "Son zamanlarda duyurulan yeni yapay zeka modelleri, okullarda ve ofislerde büyük yapısal değişikliklerin kapısını araladı.",
    category: "teknoloji",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=1000",
    date: "2026-06-08T10:00:00Z",
    isHeadline: true
  },
  {
    id: 2,
    title: "Küresel Piyasalarda Dalgalanma: Yatırımcılar Yeni Faiz Kararlarına Odaklandı",
    summary: "Merkez bankalarının yaklaşan toplantıları öncesinde, borsa endekslerinde sert dalgalanmalar yaşanıyor. Uzmanlar uyarıyor.",
    category: "ekonomi",
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=1000",
    date: "2026-06-08T09:30:00Z",
    isHeadline: true
  },
  {
    id: 3,
    title: "Şampiyonlar Ligi'nde Nefes Kesen Final: Kupa Son Dakikada Sahibini Buldu",
    summary: "Uzatmaların son saniyesinde gelen gol, stadyumu ayağa kaldırdı. Tarihi final yıllarca unutulmayacak.",
    category: "spor",
    image: "https://images.unsplash.com/photo-1574629810360-7efbb1925536?auto=format&fit=crop&q=80&w=1000",
    date: "2026-06-07T22:45:00Z",
    isHeadline: true
  },
  {
    id: 4,
    title: "İklim Zirvesinden Çıkan Yeni Kararlar: Yeşil Enerjiye Dev Yatırım",
    summary: "Ülkeler 2030 hedefleri doğrultusunda yenilenebilir enerji kaynaklarına 500 milyar dolarlık fon ayırma kararı aldı.",
    category: "dunya",
    image: "https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&q=80&w=1000",
    date: "2026-06-08T11:15:00Z",
    isHeadline: false
  },
  {
    id: 5,
    title: "Bahar Yorgunluğuna Karşı Uzmanlardan Beslenme Önerileri",
    summary: "Havaların ısınmasıyla birlikte artan yorgunluk hissine karşı alınabilecek basit ama etkili önlemler.",
    category: "saglik",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=1000",
    date: "2026-06-08T08:00:00Z",
    isHeadline: false
  },
  {
    id: 6,
    title: "Usta Yönetmenin Son Filmi Cannes'da Ayakta Alkışlandı",
    summary: "Türkiye'nin önemli yönetmenlerinden birinin yeni başyapıtı uluslararası arenada büyük övgü topladı.",
    category: "kultur-sanat",
    image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=1000",
    date: "2026-06-07T20:00:00Z",
    isHeadline: false
  },
  {
    id: 7,
    title: "Büyük Şehirlerdeki Yeni Ulaşım Planı Trafiği Rahatlatacak",
    summary: "Ulaşım koordinasyon merkezinin yeni aldığı kararlarla birlikte ana arterlerdeki sıkışıklığın %30 oranında azalması bekleniyor.",
    category: "gundem",
    image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&q=80&w=1000",
    date: "2026-06-08T07:45:00Z",
    isHeadline: true
  },
  {
    id: 8,
    title: "Minimalist Yaşam Tarzı: Az Eşya İle Daha Çok Mutluluk Mümkün Mü?",
    summary: "Son yılların popüler trendi olan minimalizm akımının insan psikolojisi üzerindeki olumlu etkileri araştırıldı.",
    category: "yasam",
    image: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&q=80&w=1000",
    date: "2026-06-07T14:30:00Z",
    isHeadline: false
  }
];

// Helper functions for easy data access
export const getHeadlineNews = () => mockNews.filter(news => news.isHeadline);
export const getNewsByCategory = (categoryId) => mockNews.filter(news => news.category === categoryId);
export const getRecentNews = (limit = 5) => [...mockNews].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, limit);
