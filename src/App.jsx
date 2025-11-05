import { useState } from 'react';
import SearchBar from './components/SearchBar';
import NewsList from './components/NewsList';
import { fetchNews, fetchTopHeadlines } from './services/newsApi';
import './App.css';

function App() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (topic) => {
    // Reset state
    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const results = await fetchNews(topic);
      setArticles(results);
    } catch (err) {
      setError(err.message);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLucky = async () => {
    // Reset state
    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const results = await fetchTopHeadlines();
      setArticles(results);
    } catch (err) {
      setError(err.message);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="app__header">
        <h1>News Search</h1>
        <p>Search for the latest news from around the world</p>
      </header>

      <main className="app__main">
        <SearchBar onSearch={handleSearch} onLucky={handleLucky} />

        {hasSearched && (
          <NewsList
            articles={articles}
            loading={loading}
            error={error}
          />
        )}

        {!hasSearched && (
          <div className="app__welcome">
            <p>Enter a topic above to start searching for news!</p>
          </div>
        )}
      </main>

      <footer className="app__footer">
        <p>Powered by <a href="https://newsapi.org" target="_blank" rel="noopener noreferrer">NewsAPI.org</a></p>
      </footer>
    </div>
  );
}

export default App;
