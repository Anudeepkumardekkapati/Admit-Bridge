# AdmitBridge Client

Frontend for AdmitBridge, built with React + Vite.

## Setup

```bash
cd client
npm install
```

## Run

```bash
npm run dev
```

Client starts at `http://localhost:5173`.

In development, requests to `/api/*` are proxied to the Express server at
`http://localhost:5001` (see `vite.config.js`), so the client and server can
run side by side with no CORS setup.

## Build

```bash
npm run build    # production build into dist/
npm run preview  # preview the production build
```

## Folder structure

```
client/
└── src/
    ├── main.jsx        # React entry point
    ├── App.jsx         # root component
    ├── components/     # shared UI components (future)
    ├── pages/          # route-level pages
    ├── layouts/        # page layouts (future)
    └── services/       # API calls to the server (future)
```
