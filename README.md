# Daily Counter App

A Next.js application that automatically increments a counter every 24 hours and commits the changes to GitHub.

## Features

- ✅ Daily automatic counter increment
- ✅ Commits changes to separate `counter-data` branch
- ✅ Self-pings to maintain Vercel activity
- ✅ Serverless cron job via Vercel

## Setup Instructions

### 1. Create Counter Branch

```bash
# Create and push the counter-data branch
git checkout -b counter-data
git add data/counter.txt
git commit -m "Initialize counter"
git push origin counter-data
git checkout main
```

### 2. Generate GitHub Personal Access Token

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Name it: `vercel-counter-app`
4. Select scope: **repo** (full control of private repositories)
5. Click "Generate token" and **COPY IT IMMEDIATELY** (you won't see it again)

### 3. Set Up Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your actual values:

```env
GITHUB_OWNER=your-github-username
GITHUB_REPO=my-script
GITHUB_TOKEN=ghp_your_token_here
CRON_SECRET=generate_a_random_secret
```

To generate a random secret:

```bash
openssl rand -base64 32
```

### 4. Deploy to Vercel

1. Push your code to GitHub:

```bash
git add .
git commit -m "Add daily counter functionality"
git push origin main
```

2. Go to [vercel.com](https://vercel.com) and import your repository

3. Add the same environment variables in Vercel:
   - Go to Project Settings → Environment Variables
   - Add: `GITHUB_OWNER`, `GITHUB_REPO`, `GITHUB_TOKEN`, `CRON_SECRET`
   - Make sure they're available for Production, Preview, and Development

4. Deploy!

### 5. Test the Cron Endpoint

Test manually to ensure it works:

```bash
curl -X GET https://your-app.vercel.app/api/cron \
  -H "Authorization: Bearer your_cron_secret"
```

Expected response:

```json
{
  "success": true,
  "previousCount": 0,
  "newCount": 1,
  "timestamp": "2025-12-31T...",
  "message": "Counter updated from 0 to 1"
}
```

## How It Works

1. **Vercel Cron** triggers `/api/cron` every 24 hours (midnight UTC)
2. **API Route** fetches current counter from GitHub
3. **Increments** the counter value
4. **Commits** changes to `counter-data` branch via GitHub API
5. **Self-pings** the deployment URL to maintain activity

## Project Structure

```
my-script/
├── app/
│   ├── api/
│   │   └── cron/
│   │       └── route.ts       # Cron job API endpoint
│   ├── layout.tsx
│   └── page.tsx
├── data/
│   └── counter.txt            # Counter file (on counter-data branch)
├── vercel.json                # Cron configuration
└── .env.example               # Environment variables template
```

## Cron Schedule

The cron job runs daily at midnight UTC (`0 0 * * *`).

To change the schedule, edit `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron",
      "schedule": "0 12 * * *"  // Run at noon UTC daily
    }
  ]
}
```

Use [crontab.guru](https://crontab.guru/) to generate custom schedules.

## Monitoring

- **Vercel Logs**: Check deployment logs for cron execution
- **GitHub Commits**: View `counter-data` branch for commit history
- **Manual Testing**: Use the curl command above to test anytime

## Troubleshooting

### Counter not updating

1. Check Vercel logs for errors
2. Verify environment variables are set correctly
3. Ensure GitHub token has `repo` scope
4. Confirm `counter-data` branch exists

### Unauthorized error

- Double-check `CRON_SECRET` matches in `.env.local` and Vercel

### GitHub API errors

- Verify token hasn't expired
- Check branch name is exactly `counter-data`
- Ensure `data/counter.txt` exists on the branch

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Tech Stack

- **Next.js 16.1** - React framework
- **Vercel** - Hosting and cron jobs
- **GitHub API** - File updates and commits
- **TypeScript** - Type safety

## License

MIT
