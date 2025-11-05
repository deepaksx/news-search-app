import './NewsItem.css';

/**
 * NewsItem Component
 * Displays a single news article with image, title, description, and link
 */
const NewsItem = ({ article }) => {
  // Fallback image if article doesn't have one
  const placeholderImage = 'https://via.placeholder.com/300x200?text=No+Image';

  // Format date to be more readable
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <article className="news-item">
      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Read full article: ${article.title}`}
      >
        <img
          src={article.urlToImage || placeholderImage}
          alt={article.title}
          className="news-item__image"
          onError={(e) => { e.target.src = placeholderImage; }}
        />
      </a>
      <div className="news-item__content">
        <h3 className="news-item__title">
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Read full article: ${article.title}`}
          >
            {article.title}
          </a>
        </h3>
        <p className="news-item__description">
          {article.description || 'No description available'}
        </p>
        <div className="news-item__meta">
          <span className="news-item__source">{article.source.name}</span>
          <span className="news-item__date">{formatDate(article.publishedAt)}</span>
        </div>
      </div>
    </article>
  );
};

export default NewsItem;
