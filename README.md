# Rivals Team-Ups

Community voting and analysis for Marvel Rivals Team-Up abilities.

## Features

- Compare two Team-Up choices for every hero
- Filter community results by competitive rank and platform
- View enhanced Team-Up effects
- Explore hero-specific vote totals, rank breakdowns, and community insights
- Browse localized English and Spanish pages

## Local development

Requires Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

Open the local address displayed in the terminal.

## Verification

```bash
npm run build
npm run lint
```

## Database

The production application uses Cloudflare D1. Apply migrations with:

```bash
npm run db:migrate:local
npm run db:migrate:remote
```

## Deployment

```bash
npm run deploy
```

Production: [rivalsteamups.com](https://rivalsteamups.com)
