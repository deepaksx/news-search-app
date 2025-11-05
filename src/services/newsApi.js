/**
 * News API Service
 * Handles all interactions with NewsAPI.org
 */

const API_KEY = import.meta.env.VITE_NEWS_API_KEY;
const BASE_URL = 'https://newsapi.org/v2';

/**
 * Fetch top headlines from the last 24 hours
 * @returns {Promise<Array>} Array of article objects
 * @throws {Error} If API call fails or returns error
 */
export const fetchTopHeadlines = async () => {
  if (!API_KEY) {
    throw new Error('API key is missing. Please configure VITE_NEWS_API_KEY in your .env file');
  }

  try {
    // Get date from 24 hours ago
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const from = yesterday.toISOString();

    const url = `${BASE_URL}/top-headlines?country=us&pageSize=10&from=${from}`;

    const response = await fetch(url, {
      headers: {
        'X-Api-Key': API_KEY,
      },
    });

    // Handle HTTP errors
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Invalid API key. Please check your NewsAPI.org credentials');
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later (100 requests/day limit)');
      } else {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
    }

    const data = await response.json();

    // Handle API-level errors
    if (data.status === 'error') {
      throw new Error(data.message || 'An error occurred while fetching news');
    }

    // Handle no results
    if (!data.articles || data.articles.length === 0) {
      return [];
    }

    return data.articles;
  } catch (error) {
    // Network errors
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error('Network error. Please check your internet connection');
    }

    // Re-throw our custom errors or wrap unknown errors
    throw error;
  }
};

/**
 * Fetch news articles for a given topic
 * @param {string} topic - The search query/topic
 * @returns {Promise<Array>} Array of article objects
 * @throws {Error} If API call fails or returns error
 */
export const fetchNews = async (topic) => {
  if (!API_KEY) {
    throw new Error('API key is missing. Please configure VITE_NEWS_API_KEY in your .env file');
  }

  if (!topic || topic.trim() === '') {
    throw new Error('Search topic cannot be empty');
  }

  try {
    const url = `${BASE_URL}/everything?q=${encodeURIComponent(topic)}&pageSize=10&sortBy=publishedAt&language=en`;

    const response = await fetch(url, {
      headers: {
        'X-Api-Key': API_KEY,
      },
    });

    // Handle HTTP errors
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Invalid API key. Please check your NewsAPI.org credentials');
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later (100 requests/day limit)');
      } else {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
    }

    const data = await response.json();

    // Handle API-level errors
    if (data.status === 'error') {
      throw new Error(data.message || 'An error occurred while fetching news');
    }

    // Handle no results
    if (!data.articles || data.articles.length === 0) {
      return [];
    }

    return data.articles;
  } catch (error) {
    // Network errors
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error('Network error. Please check your internet connection');
    }

    // Re-throw our custom errors or wrap unknown errors
    throw error;
  }
};
