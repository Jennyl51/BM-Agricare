# BM AgriCare

BM AgriCare is a mobile and web platform for Behn Meyer AgriCare Vietnam. The project supports retailers, TCEs, and admins in tracking invoice submissions, managing loyalty points, reviewing rewards redemption, and viewing admin analytics.

## Project Overview

The platform is designed for three main roles:

- **Retailers**: submit invoices, view points, redeem rewards, and access product resources/news.
- **TCEs**: review retailer invoice submissions and manage assigned retailers.
- **Admins**: oversee users, invoices, rewards, product data, and analytics workflows.

## Repository Structure

```txt
BM-Agricare/
├── bm-frontend/         # Main React Native / Expo mobile app
├── bm-admin/            # React + TypeScript + Vite admin dashboard
├── bm-web/              # Older Express + EJS + Tailwind wireframe/prototype app
├── bm-backend/          # Backend app structure, if used
├── api/                 # Backend route files
├── db/                  # Database helper files
├── services/            # Backend service logic
├── requirements.txt     # Python backend dependencies
└── README.md            # Main project README
```

## Main Components

| Component | Folder | Description |
|---|---|---|
| Mobile App | `bm-frontend/` | Main Expo mobile app for Retailer and TCE users. |
| Admin Dashboard | `bm-admin/` | Desktop dashboard for BM admin/manager users. |
| Wireframe App | `bm-web/` | Older prototype/wireframe web version. |
| Backend | `api/`, `db/`, `services/`, `bm-backend/` | FastAPI backend and database logic. |

## GitHub Development Options

BM can continue development in either of these ways.

### Option 1: Collaborator Access

BM IT can be added directly to this repository as collaborators.

This is recommended if BM wants Open Project to continue having visibility or support access.

### Option 2: Fork the Repository

BM IT can create a fork of this repository under BM's own GitHub account or organization.

This is recommended if BM wants future development to happen privately without sharing all future changes with the full Open Project team.

To clone the repository:

```bash
git clone https://github.com/Jennyl51/BM-Agricare.git
cd BM-Agricare
```

To pull latest changes:

```bash
git pull
```

## Frontend: Mobile App

The main mobile frontend is located in:

```bash
bm-frontend/
```

It is built with:

- Expo
- React Native
- Expo Router
- TypeScript
- React Navigation

### Install Mobile Frontend Dependencies

```bash
cd bm-frontend
npm install
```

### Run Mobile Frontend on Web

```bash
npm run web
```

or:

```bash
npx expo start --web
```

### Run Mobile Frontend on Phone with Expo Go

```bash
npx expo start
```

After running this command, scan the QR code using the Expo Go app on your phone.

## Admin Dashboard

The admin dashboard is located in:

```bash
bm-admin/
```

It is built with:

- React
- TypeScript
- Vite
- React Router DOM
- Recharts
- Lucide React

### Run Admin Dashboard Locally

```bash
cd bm-admin
npm install
npm run dev
```

Open the local Vite URL, usually:

```txt
http://localhost:5173
```

Login page:

```txt
http://localhost:5173/login
```

## Wireframe Web App

The wireframe/prototype web version is located in:

```bash
bm-web/
```

It uses:

- Express
- EJS
- Tailwind CSS

### Run the Wireframe App

```bash
cd bm-web
npm install
npm run dev
```

Note: `bm-web/` is an older prototype/wireframe version. The main mobile app is `bm-frontend/`.

## Backend

The backend uses:

- FastAPI
- Uvicorn
- SQLAlchemy
- PostgreSQL
- Pydantic
- boto3 / AWS-related tools
- JWT authentication with `python-jose`

### Install Backend Dependencies

From the root directory:

```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

On Windows:

```bash
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

### Run the Backend

Use the current backend route path:

```bash
python -m uvicorn api.routes.main:app --reload
```

If that command does not work, try one of the alternate entry points depending on the current backend structure:

```bash
uvicorn main:app --reload
```

or:

```bash
uvicorn app.main:app --reload
```

The backend should run at:

```txt
http://127.0.0.1:8000
```

FastAPI docs should be available at:

```txt
http://127.0.0.1:8000/docs
```

## Backend Dependencies

The backend dependencies are listed in `requirements.txt`:

```txt
fastapi
uvicorn[standard]
python-multipart
boto3
python-jose[cryptography]
sqlalchemy
psycopg2-binary
pydantic
pydantic-settings
python-dotenv
httpx
```

## Useful Commands

### Pull Latest Code

```bash
git pull
```

### Run Mobile Frontend on Web

```bash
cd bm-frontend
npm install
npm run web
```

### Run Mobile Frontend on Phone

```bash
cd bm-frontend
npm install
npx expo start
```

### Run Admin Dashboard

```bash
cd bm-admin
npm install
npm run dev
```

### Run Wireframe Web App

```bash
cd bm-web
npm install
npm run dev
```

### Install Backend Dependencies

```bash
pip install -r requirements.txt
```

### Run Backend

```bash
python -m uvicorn api.routes.main:app --reload
```

## Development Notes

- The main mobile frontend is in `bm-frontend/`.
- The admin dashboard is in `bm-admin/`.
- The older prototype/wireframe web app is in `bm-web/`.
- The backend uses FastAPI and PostgreSQL/RDS.
- Some frontend data may still use mock/demo data.
- Official BM product, news, resource, reward, and translation data should replace mock/demo data as development continues.
- Backend structure may include root-level folders and/or `bm-backend/`, depending on the active backend organization.

## Links

- Figma: https://www.figma.com/design/uRZm2ei1yoH2CIRCKwd5tr/Behn-Meyer-AgriCare?node-id=0-1&t=QGOxIa4nA4k53cdG-1
- GitHub: https://github.com/Jennyl51/BM-Agricare
