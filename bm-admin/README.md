# BM Admin Dashboard

BM Admin is the desktop admin dashboard for the BM AgriCare project. It is built separately from the Expo mobile app so BM managers can eventually access it through a web browser.

The dashboard is used for:

- Admin sign-in
- Viewing analytics summaries
- Reviewing invoice activity
- Viewing retailer performance
- Managing product information
- Viewing rewards and redemption requests

## Tech Stack

- React
- TypeScript
- Vite
- React Router DOM
- Recharts
- Lucide React

## Folder Structure

```txt
bm-admin/
├── src/
│   ├── components/        # Shared dashboard components
│   ├── data/              # Mock/dashboard data
│   ├── pages/             # Main dashboard pages
│   ├── App.tsx            # Route definitions
│   ├── main.tsx           # React app entry point
│   └── index.css          # Global styles
├── package.json
└── README.md
```

## Get Started

Install dependencies:

```bash
npm install
```

If packages are missing, install:

```bash
npm install react-router-dom lucide-react recharts
```

## Run the Admin Dashboard Locally

From the root repository:

```bash
cd bm-admin
npm install
npm run dev
```

Open the local Vite URL, usually:

```txt
http://localhost:5173
```

The login page is available at:

```txt
http://localhost:5173/login
```

## Run the Backend Locally

Open a separate terminal tab.

From the root repository:

```bash
source venv/bin/activate
python -m uvicorn api.routes.main:app --reload
```

The backend should run at:

```txt
http://127.0.0.1:8000
```

FastAPI docs are available at:

```txt
http://127.0.0.1:8000/docs
```

## Admin Analytics API Endpoints

The current admin dashboard can connect to these backend endpoints:

```txt
GET /admin/analytics/summary
GET /admin/analytics/sales
GET /admin/analytics/tier-composition
```

Example test URL:

```txt
http://127.0.0.1:8000/admin/analytics/summary
```

## Where to Make Common Changes

| Change Type | Location |
|---|---|
| Admin pages | `src/pages/` |
| Shared dashboard components | `src/components/` |
| Mock/dashboard data | `src/data/` |
| Route definitions | `src/App.tsx` |
| React app entry point | `src/main.tsx` |
| Global styles/colors | `src/index.css` |

## Change Text

Most visible dashboard text is inside:

```txt
src/pages/
src/components/
```

Example:

```tsx
<h1>Dashboard</h1>
```

Change to:

```tsx
<h1>Admin Dashboard</h1>
```

## Change Colors or Styles

Global styles are located in:

```txt
src/index.css
```

Page/component-specific styles may also be inside individual files under:

```txt
src/pages/
src/components/
```

## Edit Mock Data

Mock/dashboard data is located in:

```txt
src/data/
```

As development continues, mock data should be replaced with backend API calls and real database data.

## Recommended Development Flow

1. Start backend in one terminal:

```bash
source venv/bin/activate
python -m uvicorn api.routes.main:app --reload
```

2. Start admin frontend in another terminal:

```bash
cd bm-admin
npm run dev
```

3. Check backend docs:

```txt
http://127.0.0.1:8000/docs
```

4. Check admin dashboard:

```txt
http://localhost:5173/login
```

## AWS Login for Backend

Some backend routes may connect to AWS/RDS through Secrets Manager or AWS credentials. If the backend fails with an expired AWS session, run:

```bash
aws login
```

Then verify login:

```bash
aws sts get-caller-identity
```

Then restart the backend:

```bash
python -m uvicorn api.routes.main:app --reload
```

## Common Issues / FAQ

**Q: What should I do if the admin dashboard opens as a blank page?**

A: Open the browser console to check the error message:

```txt
Right click → Inspect → Console
```

Common causes include:

- Missing import in `App.tsx`
- Empty page/component file
- Route points to a component that is not exported
- Required package is not installed

---

**Q: What should I do if I see `Products is not defined`?**

A: Make sure `src/App.tsx` includes the Products page import:

```tsx
import Products from "./pages/Products";
```

---

**Q: What should I do if the backend has a module error?**

A: Try running the backend with the current route path:

```bash
python -m uvicorn api.routes.main:app --reload
```

If this does not work, check where the active FastAPI `main.py` file is located and adjust the command.

---

**Q: What should I do if the AWS login/session is expired?**

A: Refresh the AWS login:

```bash
aws login
```

Then verify the account:

```bash
aws sts get-caller-identity
```

After that, restart the backend.

## Current Development Notes

- `bm-admin/` currently uses mock/dashboard data for some UI sections.
- Backend admin analytics endpoints have been added for dashboard testing.
- The admin dashboard should eventually fetch real analytics data from the backend and RDS database.
- Real PostgreSQL seed data can be added after dashboard/API shapes are stable.
- BM users should not need to run this app locally after deployment. Once deployed, they should only need a website link and login credentials.
