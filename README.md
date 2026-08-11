# AdmitBridge

AI-powered higher-studies guidance platform: university catalog, admission
predictions, consultancy directory, and role-based dashboards for **students**,
**consultants**, and **admins**.

Monorepo with three services (see [ARCHITECTURE.md](ARCHITECTURE.md)):

| Service | Stack | URL |
|---|---|---|
| `client/` | React + Vite | http://localhost:5173 |
| `server/` | Node.js + Express + MongoDB | http://localhost:5001 |
| `ml/` | Python + FastAPI (rule-based recommender) | http://localhost:8000 |

## Quick start

Prerequisites: Node 18+, Python 3.9+, and a running MongoDB (`mongod`).

```bash
# 1. Install dependencies (once)
cd server && npm install && cd ..
cd client && npm install && cd ..
cd ml && python3 -m venv venv && ./venv/bin/pip install -r requirements.txt && cd ..

# 2. Configure environment (once)
cp server/.env.example server/.env   # set MONGODB_URI (e.g. mongodb://localhost:27017/admitbridge)

# 3. Seed demo data (universities + demo users)
cd server && npm run seed

# 4. Run everything
./start.sh          # starts ml + server + client, checks health
./stop.sh           # stops them
```

Open http://localhost:5173 and log in with a seeded account:

| Role | Email | Password |
|---|---|---|
| Student | `student@admitbridge.com` | `password123` |
| Consultant | `consultant@admitbridge.com` | `password123` |
| Admin | `admin@admitbridge.com` | `password123` |

## What's implemented

- **Auth** — register/login (local + Google), JWT, role-based route protection.
- **Student** — academic profile (GRE/TOEFL/CGPA/research/work/major), AI
  university predictions (Safe / Target / Ambitious) with match reasons, saved
  applications.
- **Universities** — public catalog with search + country filter; admins can
  add universities.
- **Consultant** — dashboard showing their profile and assigned students.
- **Admin** — dashboard with user/statistics, users list, university management.
- **ML service** — `POST /predict` rule-based recommender; the server calls it
  and falls back to a local heuristic if the service is down.

## Notes

- Ports: the client proxies `/api` to `:5001` (see `client/vite.config.js`).
  `start.sh` pins `PORT=5001` because some shells export a different `PORT`.
- The recommendation engine is a rule-based MVP per the architecture plan —
  swap in a trained model later by changing only `ml/app.py`.
