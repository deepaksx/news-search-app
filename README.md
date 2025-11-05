# News Search App

A modern, responsive single-page application for searching the latest news articles from around the world. Built with React, Vite, and NewsAPI.org.

## Features

- 🔍 Search for news by any topic
- 📰 Display top 10 latest articles with images and summaries
- 📱 Fully responsive design (mobile, tablet, desktop)
- ⚡ Lightning-fast performance with Vite
- ♿ Accessibility-first with ARIA labels and keyboard navigation
- 🚀 Automated deployment to GitHub Pages via GitHub Actions
- 💅 Clean, modern UI with smooth animations

## Live Demo

Once deployed, the app will be available at: `https://[your-username].github.io/news-search-app/`

## Tech Stack

- **Frontend:** React 18.3.1
- **Build Tool:** Vite 7.2.0
- **Language:** JavaScript ES6+
- **Styling:** CSS3 with Flexbox/Grid
- **API:** NewsAPI.org (free tier)
- **Deployment:** GitHub Pages
- **CI/CD:** GitHub Actions

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js 18+ ([Download](https://nodejs.org/))
- npm 10+ (comes with Node.js)
- Git ([Download](https://git-scm.com/))
- A GitHub account
- A NewsAPI.org account ([Sign up here](https://newsapi.org/register))

## Getting Started

### 1. Get Your NewsAPI.org API Key

1. Go to [NewsAPI.org](https://newsapi.org/register)
2. Sign up for a free account
3. Copy your API key from the dashboard

### 2. Clone and Install

```bash
# Clone the repository (after creating it on GitHub)
git clone https://github.com/[your-username]/news-search-app.git
cd news-search-app

# Install dependencies
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```bash
# Create .env file
echo VITE_NEWS_API_KEY=your_api_key_here > .env
```

Replace `your_api_key_here` with your actual NewsAPI.org API key.

**Important:** The `.env` file is gitignored and will NOT be committed to version control. This keeps your API key secure.

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:5173/news-search-app/](http://localhost:5173/news-search-app/) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## Project Structure

```
news-search-app/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions deployment workflow
├── public/
│   └── vite.svg               # Favicon
├── src/
│   ├── components/
│   │   ├── SearchBar.jsx      # Search input component
│   │   ├── SearchBar.css
│   │   ├── NewsList.jsx       # News results container
│   │   ├── NewsList.css
│   │   ├── NewsItem.jsx       # Individual article card
│   │   └── NewsItem.css
│   ├── services/
│   │   └── newsApi.js         # NewsAPI.org integration
│   ├── App.jsx                # Main app component
│   ├── App.css
│   ├── index.css              # Global styles
│   └── main.jsx               # React entry point
├── .env                       # Environment variables (NOT committed)
├── .env.example               # Example environment variables
├── .gitignore
├── index.html
├── package.json
├── vite.config.js            # Vite configuration
└── README.md
```

## Deployment to GitHub Pages

### Automatic Deployment (Recommended)

The app is configured for automatic deployment via GitHub Actions:

1. **Create GitHub Repository:**
   - Go to [GitHub](https://github.com/new)
   - Create a new repository named `news-search-app`
   - Do NOT initialize with README (we already have one)

2. **Connect Local to Remote:**
   ```bash
   git remote add origin https://github.com/[your-username]/news-search-app.git
   git branch -M main
   git push -u origin main
   ```

3. **Enable GitHub Pages:**
   - Go to your repository Settings → Pages
   - Under "Source", select "GitHub Actions"
   - Save

4. **Deploy:**
   - Every push to `main` branch triggers automatic deployment
   - Check the "Actions" tab to monitor deployment progress
   - Your app will be live at `https://[your-username].github.io/news-search-app/`

### Manual Deployment

If you prefer manual deployment:

```bash
npm run build
# Upload the contents of the `dist/` folder to your web server
```

## Environment Variables

The app uses the following environment variables:

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_NEWS_API_KEY` | Your NewsAPI.org API key | Yes |

## API Rate Limits

The free tier of NewsAPI.org allows:
- ✅ 100 requests per day
- ✅ 10 results per search
- ✅ Access to articles from the last month

If you need more, consider upgrading to a paid plan at [NewsAPI.org pricing](https://newsapi.org/pricing).

## Features in Detail

### Search Functionality
- Enter any topic (e.g., "technology", "sports", "politics")
- Click "Show" or press Enter to search
- Button is disabled when input is empty

### Article Display
- Shows article image (or placeholder if unavailable)
- Displays headline, description, source, and date
- Clicking an article opens the full story in a new tab
- Articles are sorted by publication date (newest first)

### Responsive Design
- **Desktop (1200px+):** 3-column grid
- **Tablet (768px-1199px):** 2-column grid
- **Mobile (< 768px):** 1-column (stacked)

### Error Handling
- Invalid API key detection
- Rate limit exceeded notification
- Network error handling
- No results found messaging

## Troubleshooting

### "API key is missing" Error
- Ensure you've created a `.env` file in the project root
- Check that the variable is named `VITE_NEWS_API_KEY`
- Restart the dev server after adding the `.env` file

### "Rate limit exceeded" Error
- You've hit the 100 requests/day limit
- Wait 24 hours or upgrade your NewsAPI.org plan

### Dev Server Won't Start
- Check that port 5173 isn't already in use
- Try `npm install` again to ensure all dependencies are installed
- Check Node.js version: `node --version` (should be 18+)

### Images Not Loading
- Some news sources don't provide images
- The app shows a placeholder for articles without images
- This is normal behavior

## Known Limitations

- Free API tier limited to 100 requests/day
- Articles only from the past month
- Some news sources may not have images
- No caching (every search makes a new API call)

## Future Enhancements

- [ ] Add search history
- [ ] Implement caching to reduce API calls
- [ ] Add dark mode toggle
- [ ] Filter by date range
- [ ] Filter by news source
- [ ] Save favorite articles
- [ ] Pagination for more than 10 results
- [ ] TypeScript migration
- [ ] Automated tests (Vitest + React Testing Library)

## Contributing

This is a learning project, but contributions are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Resources

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vite.dev/)
- [NewsAPI.org Documentation](https://newsapi.org/docs)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)

## Acknowledgments

- News data powered by [NewsAPI.org](https://newsapi.org/)
- Built with [Vite](https://vite.dev/) and [React](https://react.dev/)
- Deployed via [GitHub Pages](https://pages.github.com/)

---

**Built as a learning project to master React, API integration, and CI/CD workflows.**
