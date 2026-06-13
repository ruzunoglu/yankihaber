import Link from 'next/link';
import { authors } from '../../../data/mockAuthors';

export async function generateStaticParams() {
  return authors.map((author) => ({
    id: author.id,
  }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const author = authors.find(a => a.id === id);
  if (!author) return { title: 'Yazar Bulunamadı' };
  return {
    title: `${author.name} Yazıları | YANKI.`,
    description: author.bio,
  };
}

export default async function AuthorDetail({ params }) {
  const { id } = await params;
  const author = authors.find(a => a.id === id);

  if (!author) return <div style={{textAlign:'center', padding:'5rem'}}>Yazar bulunamadı.</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px', paddingBottom: '30px', borderBottom: '1px solid var(--border-color)' }}>
        <img src={author.image} alt={author.name} style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--accent-primary)' }} />
        <div>
          <h1 style={{ margin: '0 0 5px 0', fontSize: '2rem' }}>{author.name}</h1>
          <div style={{ color: 'var(--accent-primary)', fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '5px' }}>{author.role}</div>
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{author.bio}</p>
        </div>
      </div>

      <h2 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>Son Yazıları</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {author.articles.map(article => (
          <div key={article.id} style={{ padding: '20px', background: 'var(--bg-card)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '10px' }}>{new Date(article.date).toLocaleDateString('tr-TR')}</div>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '1.3rem' }}>
              <span style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>{article.title}</span>
            </h3>
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{article.summary}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
