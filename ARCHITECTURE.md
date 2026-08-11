# AdmitBridge — Architecture & Design Plan

Full-stack web app that helps students get guidance for higher studies abroad:
college/university information, admission info, verified consultancies, and
college recommendations based on student academic details.

**Stack:** React (frontend) · Node.js + Express (backend) · MongoDB (database) ·
JWT (auth) · Python ML model (recommendations) · REST APIs between all layers.

---

## 1. Requirements Analysis

### User roles

| Role | Can do |
|---|---|
| **Student** | Register, login, manage profile, enter academic details, view recommended colleges, view college info, view verified consultancy info |
| **Consultancy/Admin** | Login, dashboard, manage own consultancy info, add/update college info, view/manage student-related data where appropriate |

Note: "Consultancy/Admin" is one role in your description. The requirement
blurs two distinct actors — a **consultancy** (a business that lists itself on
the platform) and an **admin** (who runs the platform, verifies consultancies,
and manages college data). This matters for data design, so I've split them in
the schema below while keeping a single `users` collection.

### Core functional requirements (grouped)

1. **Authentication & roles** — register/login for students and consultancies, JWT-protected routes, role-based access.
2. **Student profile & academics** — personal details, education history (10th/12th/GPA), English test scores (IELTS/TOEFL), entrance exams (GRE/GMAT), budget.
3. **College information** — admin-managed catalog: universities, courses, fees, requirements, intake deadlines, country.
4. **Consultancy directory** — verified consultancy listings with contact info and services.
5. **Recommendations** — ML-powered: student academic data in → ranked list of suitable colleges with match reasons.
6. **Admin dashboard** — manage colleges, verify consultancies, view platform activity.

### Non-functional goals

- Beginner-friendly to build and understand.
- Scalable: the recommendation engine is a separate service so it can grow independently.
- Maintainable: clear separation of frontend / API / data / ML layers.

---

## 2. Major Modules

```
┌──────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                       │
│  Auth      Student      College      Consultancy    Dashboard │
│  (login/   Profile &    Catalog      Directory      (admin/   │
│   register) Academics                (browse)       cons.)   │
└──────────────────────────────────────────────────────────────┘
                              │  REST API (JSON + JWT)
┌──────────────────────────────▼───────────────────────────────┐
│                        BACKEND (Express)                      │
│  Auth Module │ College Module │ Consultancy Module │          │
│  Student Module │ Recommendation Module │ Admin Module         │
└───────┬──────────────────────────────┬────────────────────────┘
        │ Mongoose                      │ HTTP (REST)
┌───────▼────────┐            ┌─────────▼──────────────────────┐
│    MongoDB      │            │  ML SERVICE (Python/FastAPI)   │
│  (data store)   │            │  model → /predict endpoint     │
└────────────────┘            └────────────────────────────────┘
```

| Module | Frontend pieces | Backend pieces | Data |
|---|---|---|---|
| **Auth** | Register/Login pages, protected routes | register/login/logout, JWT middleware | `users` |
| **Student profile** | Profile form, academic details form | CRUD routes, ownership checks | `students` |
| **College catalog** | Browse/list/detail pages, admin add/edit forms | CRUD routes (admin), public read routes | `colleges` |
| **Consultancy directory** | Browse page, dashboard for own listing | CRUD routes (consultancy), verification (admin) | `consultancies` |
| **Recommendations** | "My recommendations" page, inputs form | Orchestrates call to ML service, stores results | `recommendations` |
| **Admin dashboard** | Dashboard UI | Stats endpoints, verification actions | aggregates |

---

## 3. Project Architecture

**Monorepo with three top-level folders** — one repo, three small apps. This is
the simplest structure that still keeps the ML service separate.

```
admitbridge/
├── client/     # React frontend (Vite)
├── server/     # Express REST API
├── ml/         # Python ML service (FastAPI)
└── docs/       # design docs
```

### Why this shape

- **React + Express split** is standard and keeps concerns separate. Each can be
  deployed independently later.
- **ML as a separate microservice** because Node.js cannot run a Python model
  directly. The trained model lives in `ml/`, exposed via a tiny HTTP endpoint,
  and Express calls it like any other API. This keeps the ML code (Python,
  pandas, scikit-learn) out of the Node codebase.
- **Two API consumers to keep straight:** the browser (React) talks only to
  Express; Express talks to MongoDB *and* the ML service. React never talks to
  the ML service directly — this keeps auth/validation in one place.

---

## 4. Frontend Folder Structure (React + Vite)

Feature-based grouping inside `src/` — easy to find code, scales better than
"all components in one folder."

```
client/
├── public/                    # static assets
├── index.html
├── package.json
└── src/
    ├── main.jsx               # React entry point
    ├── App.jsx                # routes definition
    ├── api/                   # all server calls (axios)
    │   ├── client.js          # axios instance w/ JWT interceptor
    │   ├── auth.js
    │   ├── students.js
    │   ├── colleges.js
    │   ├── consultancies.js
    │   └── recommendations.js
    ├── components/            # shared, reusable UI
    │   ├── Navbar.jsx
    │   ├── ProtectedRoute.jsx
    │   ├── CollegeCard.jsx
    │   ├── Spinner.jsx
    │   └── ...
    ├── pages/                 # one folder per route/feature
    │   ├── auth/              # Login, Register
    │   ├── student/           # Profile, AcademicDetails, MyRecommendations
    │   ├── colleges/          # CollegeList, CollegeDetail
    │   ├── consultancies/     # ConsultancyList, ConsultancyDetail
    │   ├── admin/             # Dashboard, ManageColleges, VerifyConsultancies
    │   └── home/              # Home, About
    ├── context/               # global state
    │   ├── AuthContext.jsx    # current user + token
    │   └── ...
    ├── hooks/                 # custom hooks (useAuth, useFetch, ...)
    ├── utils/                 # helpers, constants (roles, exam lists)
    └── styles/                # global CSS / theme
```

Routing: **react-router-dom**. All student/admin routes wrapped in a
`ProtectedRoute` component that checks the JWT in `AuthContext` and the user's
role before rendering.

---

## 5. Backend Folder Structure (Express)

Layered: **routes → controllers → services → models**. Beginner-friendly because
each file has exactly one job:

```
server/
├── package.json
├── .env                     # PORT, MONGO_URI, JWT_SECRET, ML_SERVICE_URL
└── src/
    ├── server.js            # starts the app, connects to MongoDB
    ├── app.js               # express app: middleware, route mounting, error handler
    ├── config/
    │   ├── db.js            # mongoose connection
    │   └── env.js           # loads & validates environment variables
    ├── models/              # Mongoose schemas (one per collection)
    │   ├── User.js
    │   ├── Student.js
    │   ├── College.js
    │   ├── Consultancy.js
    │   └── Recommendation.js
    ├── routes/              # thin: defines URL → controller mapping
    │   ├── auth.routes.js
    │   ├── student.routes.js
    │   ├── college.routes.js
    │   ├── consultancy.routes.js
    │   ├── recommendation.routes.js
    │   └── admin.routes.js
    ├── controllers/         # request handling: validate input, call service, send response
    │   ├── auth.controller.js
    │   ├── student.controller.js
    │   ├── college.controller.js
    │   ├── consultancy.controller.js
    │   ├── recommendation.controller.js
    │   └── admin.controller.js
    ├── services/            # business logic (kept separate for testability)
    │   ├── auth.service.js      # password hashing, JWT issuing
    │   ├── recommendation.service.js  # calls the ML service
    │   └── ...
    ├── middleware/
    │   ├── auth.middleware.js   # verifies JWT, attaches req.user
    │   ├── role.middleware.js   # role checks (admin, consultancy, student)
    │   ├── error.middleware.js  # centralized error handler
    │   └── validate.middleware.js
    └── utils/               # small helpers (asyncHandler, pick, ...)
```

Key convention: **controllers never touch the database directly**; they call
services. Services use Mongoose models. This makes testing and swapping the ML
integration easy.

---

## 6. MongoDB Collections & Key Fields

MongoDB is schemaless, but **Mongoose schemas** give us structure + validation.
Naming convention: lowercase plural.

### `users` — everyone who can log in

| Field | Type | Notes |
|---|---|---|
| `name` | string | |
| `email` | string | unique, indexed |
| `passwordHash` | string | bcrypt hash — **never store plain text** |
| `role` | string | `student` \| `consultancy` \| `admin` |
| `status` | string | `active` \| `pending` \| `suspended` (consultancies start `pending` until verified) |
| `createdAt` / `updatedAt` | date | |

### `students` — student profile + academic details (references `users`)

| Field | Type | Notes |
|---|---|---|
| `userId` | ObjectId | ref `users`, unique |
| `profile` | object | phone, country, city, education level |
| `academics` | object | 10th %, 12th %, GPA, bachelor's GPA |
| `tests` | object | IELTS/TOEFL/PTE scores, GRE/GMAT/SAT |
| `preferences` | object | target country, course/field, budget, intake |
| `createdAt` / `updatedAt` | date | |

Splitting `students` from `users` keeps auth data minimal and lets academic
details grow without touching the auth collection.

### `colleges` — the catalog (managed by admin)

| Field | Type | Notes |
|---|---|---|
| `name` | string | indexed |
| `country` / `city` | string | |
| `ranking` | number | |
| `intakes` | [string] | e.g. `["Fall", "Spring"]` |
| `courses` | [object] | `{ name, level, duration, tuitionFees }` |
| `requirements` | object | min GPA, min test scores |
| `scholarships` | [object] | optional |
| `website` / `contact` | string | |
| `createdBy` | ObjectId | ref `users` (admin) |
| `createdAt` / `updatedAt` | date | |

### `consultancies` — verified consultancy directory

| Field | Type | Notes |
|---|---|---|
| `userId` | ObjectId | ref `users`, the consultancy account owner |
| `name` | string | |
| `description` | string | services offered |
| `contact` | object | email, phone, address, website |
| `services` | [string] | counseling, visa help, test prep, ... |
| `verified` | boolean | set by admin |
| `rating` | number | optional, future |
| `createdAt` / `updatedAt` | date | |

### `recommendations` — saved prediction results per student

| Field | Type | Notes |
|---|---|---|
| `studentId` | ObjectId | ref `students` |
| `inputSnapshot` | object | copy of the academic data used (keeps history) |
| `results` | [object] | `{ collegeId, score, reason, admitChance }` |
| `status` | string | `pending` \| `completed` \| `failed` |
| `createdAt` | date | |

Storing the **input snapshot** matters: if a student edits their academics later,
old recommendations stay meaningful and the UI can show "outdated" instead of
lying.

### Optional / future

- `applications` — students track their applications to colleges
  (`{ studentId, collegeId, status, deadline }`).
- `notifications` — if you add email/in-app alerts.

### Relationship map

```
users ──1:1──> students
users ──1:1──> consultancies
users ──1:N──> colleges (admin creates many)
students ──1:N──> recommendations ──N:1──> colleges
```

---

## 7. How the Pieces Communicate

### Request flow (example: "student requests college recommendations")

```
1. Student fills academic form in React
        │ POST /api/recommendations  (JSON + JWT in Authorization header)
        ▼
2. Express: auth middleware verifies JWT → req.user (role = student)
3. Controller validates input, service loads student data
4. Service POSTs the academic data to ML service  →  /predict
        │
        ▼
5. Python: loads model, scores colleges, returns ranked list w/ reasons
        │ JSON response
        ▼
6. Express service stores results in `recommendations` collection
7. Controller sends the ranked list back to React
8. React renders "Recommended colleges" page
```

### Data flows

| From → To | How | Payload |
|---|---|---|
| React → Express | REST over HTTP, JSON | JSON body + `Authorization: Bearer <JWT>` header |
| Express → MongoDB | Mongoose ODM | structured objects, `_id` references |
| Express → ML service | REST over HTTP, JSON (or a lightweight client like `axios`/`fetch`) | academic details; returns scored college list |
| ML service → model | in-process Python | model file trained offline (`.joblib`/`.pkl`) |

### JWT auth flow

1. Register/login → server verifies credentials → returns `{ token, user }`.
2. React stores the token (localStorage/sessionStorage), attaches it to every
   API call via the axios interceptor in `api/client.js`.
3. Express `auth.middleware` verifies the token on protected routes and sets
   `req.user`; `role.middleware` then enforces `student` / `consultancy` /
   `admin` access per route.

### ML service design (kept simple)

- **FastAPI** (or Flask — either is fine) with a single endpoint:
  `POST /predict` → `{ student_academics: {...} }` → `{ results: [{college_id, score, reason}] }`.
- The model is **trained offline** (notebook/script in `ml/`) and saved to disk;
  the service just loads it and serves predictions. No model training in
  production.
- **MVP fallback:** before the real ML model exists, the recommendation service
  can run a simple rule-based matcher (e.g., filter colleges where student meets
  min GPA/test requirements, score by country/course match). This ships the
  feature end-to-end, and swapping in the real model later only changes the
  `recommendation.service.js` internals — nothing else.

---

## 8. Recommended Development Order

Build top-down (visible features first), with auth early since everything is
protected. Each phase ends with something testable.

| Phase | What | Why this order | Done when |
|---|---|---|---|
| **1. Scaffolding** | Create `client` (Vite + React + react-router), `server` (Express + Mongoose), `ml` (FastAPI skeleton); connect to MongoDB; shared README | Every later step builds on this | Both apps start, `/api/health` returns ok |
| **2. Auth** | User model, register/login, bcrypt + JWT, auth & role middleware, React login/register pages + `ProtectedRoute` | Gate everything else | Student & consultancy can register/login; protected route blocks strangers |
| **3. Student profile & academics** | `students` model, CRUD routes, profile + academic forms in React | Recommendations need this data | Student saves profile + academics, sees it reloaded |
| **4. College catalog** | `colleges` model, admin CRUD + public list/detail, React browse + manage pages | Core content of the site; recommendation targets | Admin adds a college; student browses it |
| **5. Consultancy module** | `consultancies` model, consultancy CRUD for own listing, verification by admin, React directory + dashboard | Independent feature; gives admins a second job | Consultancy creates listing; admin verifies; students browse |
| **6. Recommendations** | Rule-based matcher first → then real ML service + `/predict`; `recommendations` model; React results page | Most complex, depends on phases 3–4 | Student gets ranked colleges from live data |
| **7. Admin dashboard** | Stats endpoints, aggregate views, management UX | Requires data from phases 3–6 | Dashboard shows real numbers, admin manages content |
| **8. Polish & deploy** | Error/loading states, form validation, empty states, seed data, deploy client/server/ml | Final quality pass | App usable end-to-end by all roles |

### Golden rules while building

- **One feature at a time** through the full stack (DB → API → UI). Don't build
  all models first, then all routes, then all pages.
- **Protect every route** with the auth middleware; add role checks the moment a
  route is created, not later.
- **Keep secrets in `.env`** (`JWT_SECRET`, `MONGO_URI`, `ML_SERVICE_URL`) — never
  commit them. Never store plain-text passwords.
- **Validate at the API boundary** (controllers/middleware) — don't trust the
  React app to send clean data.
- **Seed data script** for colleges and a demo admin — makes testing every screen
  fast instead of typing forms repeatedly.
