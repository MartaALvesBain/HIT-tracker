# HIT Tracker 💪

A minimalist, mobile-first workout tracker inspired by Dorian Yates' High Intensity Training method. Built with React, designed to work offline, and syncs to Google Drive.

![HIT Tracker](https://img.shields.io/badge/PWA-Ready-blue) ![License](https://img.shields.io/badge/license-MIT-green)

## Features

- 📱 **Mobile-first design** — big tap targets, one-handed use
- ⏱️ **Rest timer** — auto-starts after each set
- 🏆 **PR tracking** — celebrates when you beat your best
- 📊 **Progress charts** — visual trends for each exercise
- 📝 **30-day reports** — LLM-ready format for AI analysis
- ☁️ **Google Drive sync** — your data, your control (optional)
- 📴 **Works offline** — full PWA support
- 🏠 **Installable** — add to home screen like a native app

## Quick Start (5 minutes)

### 1. Fork or clone this repo

```bash
git clone https://github.com/YOUR_USERNAME/hit-tracker.git
cd hit-tracker
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run locally

```bash
npm run dev
```

Open http://localhost:5173 in your browser (or scan QR code on your phone).

### 4. Deploy to GitHub Pages (free!)

1. Push to GitHub:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. Enable GitHub Pages:
   - Go to your repo → Settings → Pages
   - Source: "GitHub Actions"
   - Wait 2-3 minutes for deployment

3. Your app is live at: `https://YOUR_USERNAME.github.io/hit-tracker/`

## Install on Your Phone

Once deployed, visit your GitHub Pages URL on your phone:

**iPhone:**
1. Open in Safari
2. Tap Share button
3. Tap "Add to Home Screen"

**Android:**
1. Open in Chrome
2. Tap menu (3 dots)
3. Tap "Add to Home Screen"

## Google Drive Sync (Optional)

To enable cloud sync across devices:

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project (name: "HIT Tracker")
3. Enable the Google Drive API:
   - APIs & Services → Library → Search "Drive" → Enable

### 2. Create OAuth Credentials

1. APIs & Services → Credentials → Create Credentials → OAuth client ID
2. Configure consent screen first:
   - User Type: External
   - App name: "HIT Tracker"
   - User support email: your email
   - Scopes: Add `drive.appdata`
   - Test users: Add your email
3. Create OAuth client ID:
   - Application type: Web application
   - Authorized JavaScript origins: 
     - `http://localhost:5173` (for development)
     - `https://YOUR_USERNAME.github.io` (for production)
   - Authorized redirect URIs: same as above

### 3. Add Credentials to Project

Create `.env` file in project root:

```env
VITE_GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
VITE_GOOGLE_API_KEY=your-api-key-here
```

For GitHub Pages, add these as repository secrets:
- Settings → Secrets and variables → Actions → New repository secret

### 4. Rebuild and Deploy

```bash
npm run build
git add . && git commit -m "Add Google Drive sync" && git push
```

## Project Structure

```
hit-tracker/
├── src/
│   ├── App.jsx           # Main app component
│   ├── main.jsx          # Entry point
│   ├── index.css         # Tailwind styles
│   ├── hooks/
│   │   └── useGoogleDrive.js  # Google Drive sync hook
│   └── data/
│       └── defaultRoutine.js  # Your workout program
├── public/
│   ├── favicon.svg
│   └── pwa-512x512.svg
├── .github/
│   └── workflows/
│       └── deploy.yml    # Auto-deploy to GitHub Pages
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

## Customizing Your Routine

Edit `src/data/defaultRoutine.js` to change:
- Exercise names
- Target rep ranges
- Tempo prescriptions
- Warm-up/working set counts
- Form cues and notes

Or use the in-app editor (Program tab → tap edit icon).

## Generating PWA Icons

For proper PWA icons, you'll need PNG versions. Use any of these:
- [RealFaviconGenerator](https://realfavicongenerator.net/) — upload the SVG
- [PWA Asset Generator](https://www.pwabuilder.com/imageGenerator)

Replace the SVG files in `/public` with generated PNGs.

## Tech Stack

- **React 18** — UI
- **Vite** — build tool
- **Tailwind CSS** — styling
- **Lucide** — icons
- **Vite PWA Plugin** — offline support
- **Google Drive API** — cloud sync

## Data Privacy

- All data stored locally in your browser by default
- Google Drive sync is optional and uses "app data" folder (hidden, only this app can access)
- No analytics, no tracking, no servers
- You own your data completely

## License

MIT — do whatever you want with it!

