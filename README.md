# BM AgriCare

BM AgriCare is a mobile and web platform for Behn Meyer AgriCare. The project supports retailers, TCEs, and admins in tracking sales/invoice submissions, managing loyalty points, and handling rewards redemption.

## Project Overview

The platform is designed for three main roles:

- **Retailers**: submit invoices, view points, redeem rewards, and access product resources.
- **TCEs**: review retailer invoice submissions and manage assigned retailers.
- **Admins**: oversee users, invoices, rewards, and approval workflows.

## Repository Structure

```txt
BM-Agricare/
├── bm-frontend/         # React Native / Expo mobile frontend
├── bm-web/              # Express + EJS + Tailwind wireframe web app
├── bm-backend/          # Backend app structure
├── api/                 # Backend route files
├── db/                  # Database helper files
├── services/            # Backend service logic
├── requirements.txt     # Python backend dependencies
└── README.md
```

## Frontend: Mobile App

The main frontend is located in:

```bash
bm-frontend/
```

It is built with:

- Expo
- React Native
- Expo Router
- TypeScript
- React Navigation

### Frontend Folder Structure

```txt
bm-frontend/
├── app/
│   ├── (auth)/          # Authentication screens
│   ├── (retailer)/      # Retailer-facing screens
│   └── (tce)/           # TCE-facing screens
├── assets/              # Images and static assets
├── components/          # Shared UI components
├── constants/           # Shared constants
├── hooks/               # Custom React hooks
├── services/            # API request functions
└── scripts/             # Utility scripts
```

### Install Frontend Dependencies

```bash
cd bm-frontend
npm install
```

### Run the Frontend on Web

```bash
npm run web
```

or:

```bash
npx expo start --web
```

### Run the Frontend on Phone with Expo

```bash
npx expo start
```

After running this command, scan the QR code using the Expo Go app on your phone.

## Wireframe Web App

The wireframe web version is located in:

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

The frontend package also includes a helper command:

```bash
cd bm-frontend
npm run wireframe
```

## Backend

The backend uses:

- FastAPI
- Uvicorn
- SQLAlchemy
- PostgreSQL
- Pydantic
- AWS-related tools such as boto3
- JWT authentication with python-jose

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

Depending on the current backend entry point, use one of the following:

```bash
uvicorn main:app --reload
```

or:

```bash
uvicorn app.main:app --reload
```

If one command fails with a module import error, try the other based on whether the active `main.py` file is in the root directory or inside an `app/` folder.

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

## Development Notes

- The main mobile frontend is in `bm-frontend`.
- The older wireframe/prototype web app is in `bm-web`.
- The backend structure is still being finalized between root-level folders and `bm-backend/app`.
- Some backend endpoints may still be in progress.
- Retailer frontend screens are currently the most developed.
- TCE and Admin flows are still being expanded.

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
uvicorn main:app --reload
```

## Links

- Figma: https://www.figma.com/design/uRZm2ei1yoH2CIRCKwd5tr/Behn-Meyer-AgriCare?node-id=0-1&t=QGOxIa4nA4k53cdG-1
- GitHub: https://github.com/Jennyl51/BM-Agricare
