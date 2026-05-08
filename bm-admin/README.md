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
│   ├── data/              # Mock dashboard data
│   ├── pages/             # Main dashboard pages
│   ├── App.tsx            # Route definitions
│   ├── main.tsx           # React app entry point
│   └── index.css          # Global styles
├── package.json
└── README.md
```

## Required Packages

Install dependencies with:

```bash
npm install
```

Additional packages used by this app:

```bash
npm install react-router-dom lucide-react recharts
```

## Run the Admin Dashboard Locally

From the root repo:

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

From the root repo:

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

## AWS Login for Backend

Some backend routes connect to AWS/RDS through Secrets Manager. If the backend fails with an expired AWS session, run:

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

## Current Development Notes

- `bm-admin` currently uses mock data for the dashboard UI.
- Backend mock admin analytics endpoints have been added.
- The admin dashboard should eventually fetch data from the backend instead of local mock data.
- Real PostgreSQL seed data can be added later after the dashboard and API shapes are stable.
- BM users should not need to run this app locally. Once deployed, they should only need a website link and login credentials.

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

## Common Issues

### Blank page in browser

Open browser console:

```txt
Right click → Inspect → Console
```

Common causes:

- Missing import in `App.tsx`
- Empty page/component file
- Route points to a component that is not exported
- Package not installed

### `Products is not defined`

Make sure `src/App.tsx` includes:

```tsx
import Products from "./pages/Products";
```

### `ModuleNotFoundError: No module named 'main'`

Use the correct backend module path:

```bash
python -m uvicorn api.routes.main:app --reload
```

### `LoginRefreshRequired`

AWS login expired. Run:

```bash
aws login
```

## Default Vite Template Notes

This project was created with the React + TypeScript + Vite template.

Vite provides a minimal setup to get React working with hot module replacement and ESLint rules. (The following ReadMe is the set up instruction.)



# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
