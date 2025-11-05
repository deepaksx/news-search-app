import { useState } from 'react';
import './SearchBar.css';

/**
 * SearchBar Component
 * Handles user input for news topic search
 */
const SearchBar = ({ onSearch, onLucky }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSearch(inputValue.trim());
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      onSearch(inputValue.trim());
    }
  };

  const handleLucky = () => {
    onLucky();
  };

  return (
    <div className="search-bar">
      <form onSubmit={handleSubmit} className="search-bar__form">
        <input
          type="text"
          className="search-bar__input"
          placeholder="Enter news topic (e.g., technology, sports, politics)"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          aria-label="Enter news topic"
          aria-describedby="search-hint"
        />
        <button
          type="submit"
          className="search-bar__button"
          disabled={!inputValue.trim()}
          aria-label="Search for news"
        >
          Show
        </button>
        <button
          type="button"
          className="search-bar__button search-bar__button--lucky"
          disabled={inputValue.trim()}
          onClick={handleLucky}
          aria-label="Show top headlines from last 24 hours"
        >
          I'm Feeling Lucky
        </button>
      </form>
      <p id="search-hint" className="search-bar__hint">
        Search for the latest news on any topic, or click "I'm Feeling Lucky" for top headlines
      </p>
    </div>
  );
};

export default SearchBar;
