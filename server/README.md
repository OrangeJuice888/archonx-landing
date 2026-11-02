# ArchonX admin backend

This is the small program behind the admin pages for archonx.ai. You sign in, change prices and a few lines of text, read the enquiries that arrive from the consulting page, go back to an earlier version of the content, and download a backup.

The public website reads its prices and text from this program. When the program is off or unreachable, the website shows the figures saved in the code (`content/site-content.json`), so the site never breaks.

What you get after signing in:

- Overview: the current content version, who changed it and when, lead counts, and the address the website should use.
- Pricing: every ArchonX price, with a preview of how it appears on the site ("$400 a month + GST"). Prices should end in 00; the page warns when one does not, but never stops you.
- Text: the announcement line, the opening lines, hours, location, the "prices correct at" date and the home page quote.
- Leads: enquiries from the consulting page, with a status, notes, filters, a search box and a CSV download.
- History: every saved version, a comparison with the current one, and Restore. Underneath, a list of who did what and when.
- Settings: change your password, add another login, sign out everywhere, download the content file for the developer, and download a backup.

Addresses once it is running (replace the start with your own address):

- `/admin` is the admin. It sends you to `/admin/login` when you are not signed in.
- `/api/content` is the public content the website reads.
- `/api/leads` is where the consulting page sends enquiries.
- `/healthz` is a health check for the hosting company.

## Before you start

1. Install Node.js 24 from https://nodejs.org (the "LTS" download). Node 22.13 or newer also works. Check it:

   ```powershell
   node --version
   ```

2. Open a terminal in the project folder. In File Explorer, right-click the `archonx-landing` folder and choose "Open in Terminal". This opens PowerShell. Every command in this guide is typed there, from that folder. Use PowerShell, not the older "Command Prompt".

3. Install the project's packages. Do this once, and again whenever the developer tells you the packages changed:

   ```powershell
   npm install
   npm --prefix server install
   ```

## Run it on your computer

1. Make your settings file by copying the example:

   ```powershell
   copy server\.env.example server\.env
   ```

2. Open it and fill in two lines: `ADMIN_EMAIL` (your email) and `ADMIN_PASSWORD` (a temporary password, at least 12 characters, not your email). Leave everything else as it is.

   ```powershell
   notepad server\.env
   ```

3. Start the admin:

   ```powershell
   npm run admin
   ```

   The terminal prints the address it listens on. A warning about `SESSION_SECRET` is normal on your computer; online it must be a real secret (see "Put it online").

4. Open http://localhost:4324/admin in your browser and sign in with the email and password from step 2.

5. First login: you must choose a new password before you can do anything else. Save it in a password manager (1Password, Bitwarden, or the one built into your browser). The login page has no "forgot password" link on purpose; the reset is described under "Forgotten password" below.

6. To stop the admin, press Ctrl+C in the terminal.

Where your data is: `server\data\archonx.sqlite`. This one file holds everything: prices, texts, leads and the history. It is not in git. Copy it somewhere safe now and then, or use "Download backup" in Settings.

After the first login, `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `server\.env` are no longer used; your login now lives in the database. You can delete those two lines. If you leave the password there, the terminal reminds you to remove it.

### See your changes on the local website

1. Create a file named `.env.local` in the project folder (next to `package.json`) with one line:

   ```text
   VITE_API_URL=http://localhost:4324
   ```

2. Leave the admin running. Open a second terminal in the project folder and start the website:

   ```powershell
   npm run dev
   ```

3. Open the address it prints (usually http://localhost:5173). The consulting page and the comparison page now show what you saved in the admin. Without `.env.local` they show the saved defaults.

## Put it online

The backend needs a small always-on machine and a 1 GB disk that keeps the database between restarts. On Fly.io or Render that is a few US dollars a month. Free tiers are not suitable: they put the app to sleep and lose the disk, which means losing your data.

Fly.io is the recommended host. Render is the alternative.

### Fly.io

1. Install the Fly command line tool. In PowerShell:

   ```powershell
   iwr https://fly.io/install.ps1 -useb | iex
   ```

   Close the terminal and open a new one so the `fly` command is found.

2. Create a Fly account, or sign in if you have one. A browser window opens:

   ```powershell
   fly auth signup
   ```

   Later sign-ins use `fly auth login`.

3. Create the app. The name becomes part of the address (`https://archonx-admin.fly.dev`):

   ```powershell
   fly apps create archonx-admin
   ```

   If Fly says the name is taken, pick another one (for example `archonx-admin-au`) and write the same name in `server\fly.toml` on the line that starts with `app =`. Use your name wherever this guide says `archonx-admin`.

4. Create the disk that holds the database. Answer `y` to the warning about a single volume:

   ```powershell
   fly volumes create data --region syd --size 1 --config server/fly.toml
   ```

5. Set the secrets. This generates a random `SESSION_SECRET` for you. Replace the email and the temporary password (12 or more characters, letters and numbers only for now; you will change it at first login):

   ```powershell
   fly secrets set --config server/fly.toml SESSION_SECRET=$(node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))") ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=a-temporary-password-12plus
   ```

6. Deploy. The first time takes a few minutes:

   ```powershell
   fly deploy --config server/fly.toml --dockerfile server/Dockerfile --ha=false .
   ```

   The final `.` matters: it tells Fly to build from the project folder.

7. Check that exactly one machine is running:

   ```powershell
   fly status --config server/fly.toml
   ```

   One machine must show as `started`. If you ever see two, bring it back to one; two machines would each have their own database and your changes would appear and disappear:

   ```powershell
   fly scale count 1 --config server/fly.toml
   ```

8. Open https://archonx-admin.fly.dev/admin, sign in with the temporary password and choose your real password. Save it in your password manager.

9. Remove the temporary login details from Fly. The app restarts by itself, which takes about a minute:

   ```powershell
   fly secrets unset ADMIN_EMAIL ADMIN_PASSWORD --config server/fly.toml
   ```

10. Turn on daily snapshots of the disk, kept for 30 days. First find the disk's id (it starts with `vol_`), then use it:

    ```powershell
    fly volumes list --config server/fly.toml
    fly volumes update <id> --snapshot-retention 30 --config server/fly.toml
    ```

When the developer changes the backend later, repeat step 6 only.

### Render

Render reads a file named `render.yaml` from the top folder of the repository. Ours lives in `server\`, so it has to be copied there first.

1. Copy the file, then commit and push it the way any other change goes in (through a pull request):

   ```powershell
   copy server\render.yaml render.yaml
   ```

2. In the Render dashboard choose New, then Blueprint, and pick this repository. Render shows one web service, `archonx-admin`, on the Starter plan in Singapore with a 1 GB disk at `/data`. The disk is required; "free" instances have no disk and go to sleep.

3. Render asks for `ADMIN_EMAIL` and `ADMIN_PASSWORD` (a temporary password, 12 or more characters). `SESSION_SECRET` is generated by Render.

4. After the first deploy, open `https://<your service>.onrender.com/admin`, sign in with the temporary password and choose your real one.

5. In the service's Environment tab, delete `ADMIN_EMAIL` and `ADMIN_PASSWORD`.

### What it costs

A small always-on machine plus a 1 GB disk is a few US dollars a month on either host. The exact figure is on the host's pricing page.

## Connect the website

The website is built by GitHub and needs to know the backend's address. The Overview page in the admin shows the exact value to use.

1. On GitHub, open the repository, then Settings, then "Secrets and variables", then Actions, then the Variables tab. Click "New repository variable". Name: `API_URL`. Value: your backend address without a slash at the end, for example `https://archonx-admin.fly.dev`.

2. Rebuild the website: open the Actions tab, choose the workflow "Deploy Vite app to GitHub Pages" and click "Run workflow". Merging any change to `main` also rebuilds it.

3. From then on the live site reads prices and text from the backend. A change you save in the admin appears on the site within about a minute. If the backend is down, the site shows the saved defaults instead.

To disconnect the site again, delete the `API_URL` variable and rebuild.

## Lead notifications

Every enquiry from the consulting page lands in the admin's Leads section. For an email as well, you have two options:

- Keep the Web3Forms key on the consulting page as it is today. You keep getting the emails, and the admin keeps a copy.
- Or set `LEAD_WEBHOOK_URL` to a "catch hook" address from Make or Zapier that emails you. A webhook is an address another service gives you; the backend sends each new lead there as it arrives. The address must start with `https://`. On Fly: `fly secrets set LEAD_WEBHOOK_URL=https://... --config server/fly.toml`.

The receiver of that address gets personal data (names, emails, phone numbers), so only use a service you trust and whose privacy terms you accept. The developer can also set `LEAD_WEBHOOK_SECRET` so the receiver can check that each message really came from your backend.

## Backups

- In the admin, open Settings and click "Download backup". Do this once a month and after a busy week; keep the file somewhere safe, not only on this computer.
- On Fly, the daily disk snapshots from step 10 are a second safety net.

### Restore a backup on Fly

The backup is a copy of the database file. Do this at a quiet time: anything saved in the admin between step 2 and step 4 is lost. Ask the developer if you are unsure.

1. Find the machine id (it starts with a long string of letters and numbers):

   ```powershell
   fly status --config server/fly.toml
   ```

2. Upload the backup file next to the live database. This opens a small file-transfer session; type the `put` line inside it, with the name of your backup file, then press Ctrl+C to leave:

   ```powershell
   fly ssh sftp shell --config server/fly.toml
   put archonx-backup-2026-11-02.sqlite /data/restore.sqlite
   ```

3. Swap the files. This opens a command line inside the machine; type the four lines one at a time:

   ```powershell
   fly ssh console --config server/fly.toml
   cd /data
   mv restore.sqlite archonx.sqlite
   rm -f archonx.sqlite-wal archonx.sqlite-shm
   exit
   ```

4. Restart the machine so the app opens the restored file:

   ```powershell
   fly machine restart <machine id> --config server/fly.toml
   ```

## Forgotten password

Online, on Fly, either way works:

- Set a temporary password through the secrets. The app restarts and resets that login; sign in with the temporary password and choose a new one; then remove the three secrets again:

  ```powershell
  fly secrets set ADMIN_PASSWORD_RESET=1 ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=a-temporary-password-12plus --config server/fly.toml
  ```

  After signing in:

  ```powershell
  fly secrets unset ADMIN_PASSWORD_RESET ADMIN_EMAIL ADMIN_PASSWORD --config server/fly.toml
  ```

- Or open a command line inside the machine and ask for a reset. It prints a 24-character temporary password once; copy it, sign in, and choose a new password:

  ```powershell
  fly ssh console --config server/fly.toml
  cd /app/server
  npm run reset-password -- you@example.com
  exit
  ```

On your computer, from the project folder:

```powershell
cd server
npm run reset-password -- you@example.com
cd ..
```

Either reset also signs that login out everywhere.

## Keeping leads tidy

Leads hold personal data. Two habits:

- When someone asks you to remove their details, open the lead in the Leads section and click Delete.
- Once a year, filter the Leads section by status "won" and then "lost", and delete the leads older than 12 months.

## Keeping the website's saved defaults in step

The website carries a copy of the prices and text so it works when the backend is unreachable. Over time that copy falls behind what you changed in the admin. Settings shows how many fields are behind.

1. In Settings, click "Download content file for the website developer". It downloads `site-content.json`.
2. Send it to the developer. They replace `content/site-content.json` with it, run `npm run check:prices`, and open a pull request.
3. Once merged, the website's built-in copy matches the admin again.

`content/site-content.json` must be valid JSON. If it is not, the website build fails on purpose, so a broken file can never reach the live site.

## Notes for the developer

- Node 22.13 or newer; Node 24 recommended. Runtime dependency: Express 5 only, with `node:sqlite` for the database. Single process; never run two instances against separate database files.
- Scripts in `server/package.json`: `start`, `dev` (restarts on file changes), `test`, `reset-password`. From the repo root, `npm run admin` starts it and `npm run test:server` runs the tests. `DATABASE_PATH=:memory:` is accepted.
- Every setting is listed with a comment in `server/.env.example`. The important ones: `SESSION_SECRET` (required in production, at least 32 characters, the example placeholder is refused), `HOST` (`127.0.0.1` locally, `0.0.0.0` in the container), `DATABASE_PATH` and `CONTENT_DEFAULTS_PATH` (relative paths resolve against `server/`).
- `TRUST_PROXY=1` tells the app that exactly one proxy (Fly's or Render's) sits in front and that the visitor's address is in the forwarded header. It is set in the Dockerfile and in both hosting configs. Leave it unset when the app is reached directly, as on your computer; otherwise anyone could fake their address and get around the login rate limit.
- The Docker build context is the repo root: `docker build -f server/Dockerfile .`. The root `.dockerignore` keeps `node_modules`, `dist`, `docs`, `server/data` and every `.env` file out of the image.
- The site's build reads `VITE_API_URL` (set from the repository variable `API_URL` in the Pages workflow; `.env.local` locally). Empty means defaults only.
