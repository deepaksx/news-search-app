import NewsItem from './NewsItem';
import './NewsList.css';

/**
 * NewsList Component
 * Container for displaying news articles, loading state, and errors
 */
const NewsList = ({ articles, loading, error }) => {
  // Loading state
  if (loading) {
    return (
      <div className="news-list__state" role="status" aria-live="polite">
        <div className="loading-spinner"></div>
        <p>Loading news...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="news-list__state news-list__error" role="alert" aria-live="assertive">
        <p className="error-message">{error}</p>
      </div>
    );
  }

  // No results
  if (articles.length === 0) {
    return (
      <div className="news-list__state" role="status" aria-live="polite">
        <p>No news articles found. Try a different search term!</p>
      </div>
    );
  }

  // Results
  return (
    <div className="news-list" role="region" aria-label="News search results">
      <p className="news-list__count" aria-live="polite">
        Found {articles.length} {articles.length === 1 ? 'article' : 'articles'}
      </p>
      <div className="news-list__grid">
        {articles.map((article, index) => (
          <NewsItem
            key={`${article.url}-${index}`}
            article={article}
          />
        ))}
      </div>
    </div>
  );
};

export default NewsList;
