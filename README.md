# ArchonX website

The public site at https://archonx.ai. A Vite and React app in `src/`, built and published to GitHub Pages by `.github/workflows/static.yml`. The consulting page is a standalone file at `public/consultation/index.html`, with its fact sheet beside it.

Common commands, run in the project folder:

```powershell
npm install
npm run dev
npm run build
```

## Admin backend

The admin backend in `server/` gives the owner a login page to change prices and a few site texts, read the enquiries sent from the consulting page, go back to an earlier version of the content, and download backups. The public site reads live content from it and falls back to the committed `content/site-content.json` when the backend is not configured or unreachable, so the site renders with no backend at all.

How to run it on your computer or put it online, connect the website to it, take backups and reset a forgotten password: see [server/README.md](server/README.md).
