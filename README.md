# The Art Exchange - Web App

> A modern React web application for concert poster collectors to catalog, discover, and connect with fellow enthusiasts.

[![React](https://img.shields.io/badge/react-18-blue.svg)](https://react.dev/)
[![Bootstrap](https://img.shields.io/badge/bootstrap-5-purple.svg)](https://getbootstrap.com/)

## 🎨 About

The Art Exchange is a web platform built for concert poster collectors. Whether you're a casual fan or a serious archivist, this app helps you organize your collection, discover rare finds, and connect with other collectors worldwide.

This is the **frontend web application** that connects to [The Art Exchange API](https://github.com/taylor01/the-art-exchange-api).

## ✨ Features

- **🖼️ Poster Gallery** - Browse thousands of concert posters with beautiful grid layout
- **🔍 Advanced Search** - Filter by artist, venue, year with faceted search
- **📚 Collection Management** - Track your personal poster collection with condition notes
- **🔐 Authentication** - Secure JWT-based user authentication
- **📱 Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- **⚡ Fast Performance** - Built with Vite for lightning-fast development and production builds

## 🚀 Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | React 18 + Vite |
| **UI Library** | Bootstrap 5 |
| **State Management** | Zustand with persistence |
| **Routing** | React Router v6 |
| **HTTP Client** | Axios with interceptors |
| **Authentication** | JWT with token refresh |
| **Styling** | Custom CSS + Bootstrap utilities |
| **Build Tool** | Vite |
| **Deployment** | S3 + CloudFront (Terraform in `infra/web`) |
| **CI/CD** | GitHub Actions: CI on PRs, tag-gated deploys |

## 📋 Prerequisites

- **Node.js** 20.x or higher
- **npm** 9.x or higher
- **The Art Exchange API** running (for full functionality)

## 🏃 Quick Start

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/taylor01/the-art-exchange-app.git
   cd the-art-exchange-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and set your API URL:
   ```env
   VITE_API_URL=http://localhost:3000/api/v1
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   ```
   http://localhost:5173
   ```

### First Time Setup

1. Make sure The Art Exchange API is running on `http://localhost:3000`
2. Create an account via the signup page
3. Start browsing the poster gallery!

## 🏗️ Project Structure

```
the-art-exchange-app/
├── .github/
│   └── workflows/
│       └── build-and-push.yml    # CI/CD pipeline
├── public/
│   └── the_art_exchange.svg      # Logo file
├── src/
│   ├── api/
│   │   └── client.js             # Axios client with interceptors
│   ├── components/
│   │   ├── Layout.jsx            # Main layout with nav/footer
│   │   └── PosterCard.jsx        # Poster card component
│   ├── pages/
│   │   ├── Home.jsx              # Landing page
│   │   ├── Gallery.jsx           # Poster gallery with filters
│   │   ├── PosterDetail.jsx      # Individual poster view
│   │   ├── Login.jsx             # Login page
│   │   ├── Signup.jsx            # Registration page
│   │   ├── About.jsx             # About page
│   │   ├── Privacy.jsx           # Privacy policy
│   │   └── Terms.jsx             # Terms & conditions
│   ├── store/
│   │   └── authStore.js          # Zustand auth state
│   ├── App.jsx                   # Main app component
│   ├── main.jsx                  # Entry point
│   ├── custom.css                # Custom styling
│   └── index.css                 # Base styles
├── .env.example                  # Environment template
└── package.json                  # Dependencies

```

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Build for production (outputs to `dist/`) |
| `npm run preview` | Preview production build locally |
| `npm run test` | Run tests in watch mode |
| `npm run test:run` | Run tests once (for CI) |
| `npm run test:ui` | Run tests with UI |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run lint` | Run ESLint (if configured) |

## 🔧 Environment Variables

Set at build time (Vite). Copy `.env.example` to `.env` for local development.

| Variable | Purpose |
|---|---|
| `VITE_API_URL` | API base URL. Local: `http://localhost:3000/api/v1`. Production: `https://api.theartexch.com/api/v1`, set by the deploy. |
| `VITE_ENABLE_ACCOUNTS` | `true` shows sign-in, sign-up, walls, Messages and Settings. On in production from app v0.5.0; set it to `false` in `deploy.yml` to hide accounts again. |

## 🚀 Deployment

The site is static: Vite builds it, and it is served from a private S3 bucket through
CloudFront at **https://theartexch.com** (`www` redirects there), in the `taylor-art-exchange`
AWS account. Infrastructure is Terraform in `infra/web`; see `CLAUDE.md`.

- **CI** (`.github/workflows/ci.yml`): lint, dependency audit, tests and a build on every pull
  request and push to `main`.
- **Deploys** (`.github/workflows/deploy.yml`): merging does not deploy; a `vX.Y.Z` tag does.
  The deploy checks the commit is on `main`, CI passed and `CHANGELOG.md` has the version, then
  builds, uploads to S3 and clears the CloudFront cache.

## 🔗 API Integration

This frontend connects to The Art Exchange API for:

- **Authentication** - Login, signup, token refresh
- **Posters** - Browse, search, filter poster catalog
- **Collections** - User collection management
- **User Data** - Profile and preferences

**API Repository:** [taylor01/the-art-exchange-api](https://github.com/taylor01/the-art-exchange-api)

**API Endpoints Used:**
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/signup`
- `POST /api/v1/auth/refresh`
- `GET /api/v1/posters`
- `GET /api/v1/posters/:id`
- `GET /api/v1/posters/search`
- `POST /api/v1/user_posters`

## 📱 Features Breakdown

### Home Page
- Hero section with gradient background and grid pattern
- Call-to-action buttons (Sign Up / Sign In)
- Three feature cards highlighting key benefits
- Responsive design with Bootstrap grid

### Gallery Page
- Grid layout with responsive columns (1-4 depending on screen size)
- Search bar with real-time filtering
- Sidebar filters: Artist, Venue, Year
- Pagination (40 items per page)
- Poster cards with image, title, artist, venue, year

### Poster Detail Page
- Large poster image display
- Detailed metadata (artist, venue, year, series, price)
- Add/remove from collection functionality
- Condition and edition information

### Authentication
- Email-based login (no username required)
- Password confirmation on signup
- JWT token management with automatic refresh
- Persistent auth state with Zustand

### About Page
- Origin story
- Mission statement
- Feature highlights
- Community information

### Legal Pages
- Privacy Policy (COPPA compliant)
- Terms & Conditions (North Carolina law)

## 🎨 Design System

The app uses a custom design system built on Bootstrap:

**Brand Colors:**
- Primary Red: `#dc2626`
- Stone Dark: `#1c1917`
- Stone Text: `#44403c`
- Stone Light: `#f5f5f4`

**Typography:**
- Base font: System UI stack
- Headings: Bold, stone-900
- Body: Regular, stone-700

**Components:**
- Cards with hover effects
- Red primary buttons
- Clean form inputs with red focus rings
- Responsive navigation with logo

## 🛠️ Development

### Code Style
- Functional React components
- Hooks for state management
- Component composition
- Clean, readable JSX

### State Management
- Zustand for global state (auth)
- Local state for component-specific data
- Persistent storage for auth tokens

### API Client
- Axios instance with base URL
- Request interceptor for auth tokens
- Response interceptor for token refresh
- Automatic retry on 401 errors

## 🧪 Testing

The project uses **Vitest** with **React Testing Library** for testing.

**Run tests:**
```bash
npm test              # Watch mode
npm run test:run      # Run once (CI)
npm run test:ui       # Interactive UI
npm run test:coverage # With coverage
```

**Test Structure:**
- `src/components/*.test.jsx` - Component tests
- `src/pages/*.test.jsx` - Page component tests
- `src/store/*.test.js` - State management tests
- `src/test/setup.js` - Test configuration

**Current Coverage:**
- ✅ PosterCard component (7 tests)
- ✅ Auth store (6 tests)
- ✅ Home page (5 tests)

**CI/CD:**
Tests run in GitHub Actions on every pull request and push to `main`; a release can only deploy a commit whose CI passed.

## 🚧 Roadmap

- [ ] User profile page
- [ ] Collection detail view
- [ ] Poster comparison tool
- [ ] Social features (follow collectors)
- [ ] Marketplace integration
- [ ] Advanced search filters
- [ ] Mobile app (React Native)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

[Add your license here]

## 📞 Contact & Support

- **Email:** hello@theartexch.com
- **Website:** https://theartexch.com
- **Issues:** [GitHub Issues](https://github.com/taylor01/the-art-exchange-app/issues)

---

Built with ❤️ for poster collectors everywhere.
