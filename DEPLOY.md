# Deploying AdmitBridge (Full Stack)

This guide deploys the **whole project** so anyone with the link can use it:

| Piece | Tech | Where it runs |
|---|---|---|
| Frontend (React) | Vite | **Vercel** (free) |
| Backend (Express API) | Node | **Render** (free) |
| ML prediction service | FastAPI | **Render** (free) |
| Database | MongoDB | **MongoDB Atlas** (free) |

The repo already contains `render.yaml` (one-click Render Blueprint) and
`vercel.json` (tells Vercel the frontend is in `client/`).

---

## Step 1 — MongoDB Atlas (free, ~10 min)

1. Go to <https://www.mongodb.com/cloud/atlas> → sign up → create an **M0 free cluster**.
2. In **Database Access** → **Add New Database User** (e.g. `admin` / a strong password). Save these.
3. In **Network Access** → **Add IP Address** → **Allow access from anywhere** (`0.0.0.0/0`).
4. Click **Connect** → **Drivers** → copy the connection string. It looks like:
   ```
   mongodb+srv://admin:<password>@cluster0.xxxxx.mongodb.net/admitbridge
   ```
   Replace `<password>` with the real one.

## Step 2 — Backend + ML on Render (free, ~10 min)

Option A — **One click with the Blueprint** (recommended):
1. Go to <https://render.com> → sign up with GitHub → **New** → **Blueprint**.
2. Select the **Admit-Bridge** repo → Render reads `render.yaml` and creates **two services**:
   - `admitbridge-server` (Express API)
   - `admitbridge-ml` (FastAPI)
3. For `admitbridge-server`, Render will ask for the env vars you marked as secrets:
   - `MONGODB_URI` → paste the Atlas string from Step 1
   - `JWT_SECRET` → any long random string (e.g. a password-manager generated value)
4. Click **Apply** → wait ~3–5 min for both services to build.
5. Note the two URLs you get:
   - API: `https://admitbridge-server.onrender.com`
   - ML: `https://admitbridge-ml.onrender.com`
   (The API is already wired to call the ML service automatically.)

Option B — **Manual** (same result, more clicks):
- Create two Web Services on Render, exactly as in the Blueprint:
  - API: root dir `server`, build `npm install`, start `node server.js`, env `MONGODB_URI` + `JWT_SECRET` + `ML_SERVICE_URL=https://admitbridge-ml.onrender.com`, health check path `/api/health`.
  - ML: root dir `ml`, build `pip install -r requirements.txt`, start `uvicorn app:app --host 0.0.0.0 --port $PORT`.

## Step 3 — Seed the database (one command, ~1 min)

The Atlas DB starts empty — no users exist yet. From your machine:

```bash
cd server
MONGODB_URI="mongodb+srv://admin:<password>@cluster0.xxxxx.mongodb.net/admitbridge" npm run seed
```

You should see `Users seeded!`, `Applications seeded!`, etc.
(If you later reset the DB, just run this again — it wipes and re-seeds.)

## Step 4 — Frontend on Vercel (free, ~3 min) ← the link you share

1. Go to <https://vercel.com> → sign up with GitHub → **Add New Project**.
2. Import the **Admit-Bridge** repo. Vercel reads `vercel.json` and automatically
   uses `client/` as the root and `npm run build` as the build command.
3. Add one **Environment Variable**:
   - `VITE_API_URL` = `https://admitbridge-server.onrender.com/api`
4. Click **Deploy** → in ~1 min you get your shareable link:
   `https://admitbridge.vercel.app`

## Step 5 — Share it

```text
Check out AdmitBridge 👉 https://admitbridge.vercel.app

Logins (password for all: password123):
  Student    student@admitbridge.com
  Student    anudeep@example.com
  Consultant consultant@admitbridge.com
  Admin      admin@admitbridge.com
```

---

## Notes

- **Free-tier cold starts:** Render free services sleep after ~15 min idle and
  wake on the first request (can take ~30–60 s). If the first prediction is slow,
  the API automatically falls back to its built-in heuristic and returns instantly —
  predictions always work.
- **Google sign-in** on the login page stays as a placeholder until you add a real
  `VITE_GOOGLE_CLIENT_ID` (email/password login works regardless).
- **Local development is unaffected** — the client still falls back to
  `http://localhost:5001/api` when `VITE_API_URL` is unset.
