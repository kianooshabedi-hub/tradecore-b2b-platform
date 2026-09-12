// js/data/articleStore.js

const ARTICLES_KEY = 'tradecore_articles';

export const ArticleStore = {
  getArticles: () => {
    const data = localStorage.getItem(ARTICLES_KEY);
    if (!data) {
      localStorage.setItem(ARTICLES_KEY, JSON.stringify([]));
      return [];
    }
    return JSON.parse(data);
  },
  saveArticles: (articles) => {
    localStorage.setItem(ARTICLES_KEY, JSON.stringify(articles));
  }
};