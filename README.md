# TDR Micro Site

A single-page site with a simple JSON-backed CMS: visitors submit a question and
pick a location from a dropdown; admins review submitted questions and manage
the list of locations.

## Stack

- Node.js + Express
- EJS templates (server-rendered, easy to restyle once the design comes in)
- Data stored as JSON files in `data/` (no database)
- Session-based admin login (single shared password)

## Project layout

```
server.js              Entry point
routes/public.js        Public page + question submission
routes/admin.js         Admin login/logout, dashboard, locations CRUD
middleware/auth.js      Session guard for /admin routes
lib/dataStore.js        Read/write helpers for the JSON data files
data/questions.json     Submitted questions (gitignored — runtime data, auto-created if missing)
data/locations.json     Editable list of venues (gitignored — manage via /admin/locations, auto-created if missing)
views/                  EJS templates
public/                 Static CSS/JS (swap in the real design here)
```

## Local development

```bash
npm install
cp .env.example .env   # then edit ADMIN_PASSWORD and SESSION_SECRET
npm run dev
```

The site runs at `http://localhost:3000`. The public page is `/`, admin is `/admin`
(redirects to `/admin/login` if not authenticated).

## Environment variables

| Variable         | Required | Description                                      |
|------------------|----------|---------------------------------------------------|
| `PORT`           | no       | Defaults to 3000 locally; Railway sets this itself |
| `ADMIN_PASSWORD` | yes      | Shared password for the `/admin` login             |
| `SESSION_SECRET` | yes      | Long random string used to sign the session cookie |
| `NODE_ENV`       | no       | Set to `production` on Railway                     |

## Deploying to Railway

1. Push this repo to GitHub (or use the Railway CLI) and create a new Railway
   project from it.
2. In the Railway service **Variables** tab, set `ADMIN_PASSWORD`,
   `SESSION_SECRET`, and `NODE_ENV=production`. Railway sets `PORT` automatically.
3. **Important — persistent storage:** Railway's default filesystem is
   ephemeral and is wiped on every redeploy. Since questions and locations are
   stored as JSON files on disk, attach a
   [Railway Volume](https://docs.railway.com/reference/volumes) mounted at
   `/app/data` so `data/questions.json` and `data/locations.json` survive
   deploys and restarts. Without this, submitted questions will be lost the
   next time you deploy.
4. Deploy. Railway will detect the Node app via Nixpacks and run `npm start`.
5. Under the service's **Settings → Networking → Custom Domain**, add
   `tdr.brewingfolk.co` and create the CNAME record it gives you in your DNS
   provider for `brewingfolk.co`.

## Presenting questions

From `/admin`, pick a venue and click **Start Presenting Questions** to open a
full-screen view (`/admin/present?locationId=...`) showing one question at a
time for that venue — name, question, right arrow for next, left arrow for
previous, Esc to exit back to the dashboard. Meant to be projected/displayed
live during the event.

## Notes

- The Verdant / DR logo marks in `public/images/` were extracted from the
  vector paths in the client's one-pager PDF as a placeholder — swap for
  official brand SVG/EPS files before this is treated as final.
- Deleting a location does not delete questions that reference it; those
  questions show "Unknown" as their venue in the admin dashboard.
