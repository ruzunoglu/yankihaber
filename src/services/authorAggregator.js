import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';

export async function getAllAuthors() {
  if (!db) return [];
  try {
    const docRef = doc(db, 'cache', 'rss_authors');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data().authors || [];
    }
    return [];
  } catch (error) {
    console.error("Önbellekten yazarlar çekilemedi:", error);
    return [];
  }
}

export async function getAuthorById(id) {
  const authors = await getAllAuthors();
  return authors.find(author => author.id === id);
}

export async function getArticleById(authorId, articleId) {
  const author = await getAuthorById(authorId);
  if (!author) return null;
  return author.articles.find(article => article.id === articleId);
}
