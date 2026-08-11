# AdmitBridge Server

REST API backend for AdmitBridge, built with Node.js + Express.

## Setup

```bash
cd server
npm install
cp .env.example .env   # adjust PORT if needed
```

## Run

```bash
npm run dev    # development (auto-restart with nodemon)
npm start      # production
```

Server starts at `http://localhost:5001` (or the `PORT` in `.env`).

> Note: port 5000 is reserved by macOS AirPlay Receiver, so 5001 is the default.

## Test the health endpoint

```bash
curl http://localhost:5001/api/health
# -> {"status":"ok","service":"admitbridge-server"}
```

## Folder structure

```
server/
├── server.js              # entry point, starts the app
└── src/
    ├── app.js             # Express app: middleware + route mounting
    ├── config/            # environment/config loading
    ├── routes/            # URL -> controller mapping
    ├── controllers/       # request handling
    ├── services/          # business logic (future)
    ├── models/            # Mongoose schemas (future)
    └── middleware/        # auth, validation, errors (future)
```
