# BM AgriCare Mobile Frontend

This folder contains the main BM AgriCare mobile app built with Expo and React Native.

The mobile app supports two main user groups:

- **Retailers**: submit invoices, view points, redeem rewards, and access product resources/news.
- **TCEs**: review retailer invoice submissions and manage assigned retailers.

## Tech Stack

- Expo
- React Native
- Expo Router
- TypeScript
- React Navigation

## Folder Structure

```txt
bm-frontend/
├── app/
│   ├── (auth)/          # Authentication and onboarding screens
│   ├── (retailer)/      # Retailer-facing screens
│   └── (tce)/           # TCE-facing screens
├── assets/              # Images and static assets
├── components/          # Shared UI components
├── constants/           # Shared constants/colors
├── hooks/               # Custom React hooks
├── services/            # API request functions
└── scripts/             # Utility scripts
```

## Get Started

Install dependencies:

```bash
npm install
```

Start the Expo app:

```bash
npx expo start
```

In the Expo output, you can choose to open the app using:

- Expo Go on a physical phone
- iOS simulator
- Android emulator
- Web browser

## Run on Web

```bash
npm run web
```

or:

```bash
npx expo start --web
```

## Run on Phone with Expo Go

```bash
npx expo start
```

Then scan the QR code using the Expo Go app.

Make sure the phone and computer are connected to the same Wi-Fi network.

## Main App Routes

The app uses Expo Router with file-based routing.

| Folder | Purpose |
|---|---|
| `app/(auth)/` | Login, onboarding, and authentication-related screens. |
| `app/(retailer)/` | Retailer mobile app screens. |
| `app/(tce)/` | TCE mobile app screens. |

## Where to Make Common Changes

| Change Type | Location |
|---|---|
| Login/onboarding screens | `app/(auth)/` |
| Retailer screens | `app/(retailer)/` |
| TCE screens | `app/(tce)/` |
| Shared UI components | `components/` |
| Images/assets | `assets/` |
| App colors/constants | `constants/` |
| API request functions | `services/` |

## Change Text

Most visible app text is inside files under:

```txt
app/
```

Example:

```tsx
<Text>Submit Invoice</Text>
```

Change to:

```tsx
<Text>Upload Invoice</Text>
```

## Change Colors

Check shared constants first:

```txt
constants/
```

If colors are written directly inside styles, look for values such as:

```tsx
backgroundColor: "#FFFFFF"
```

Then replace with the desired color:

```tsx
backgroundColor: "#F5F1E8"
```

## Add or Replace Images

Add images to:

```txt
assets/
```

Then import and use them in a screen/component:

```tsx
import productImage from "../../assets/product.png";

<Image source={productImage} />
```

## Mock Data Notes

Some screens may currently use local mock/demo data. As development continues, this data should be replaced with backend API calls.

Common places to check:

```txt
constants/
services/
app/
```

## Backend API Connection

API request functions should be organized under:

```txt
services/
```

The backend usually runs at:

```txt
http://127.0.0.1:8000
```

When testing on a physical phone, `127.0.0.1` refers to the phone itself, not the computer. In that case, use the computer's local network IP address instead.

Example:

```txt
http://192.168.x.x:8000
```

## Common Issues / FAQ

**Q: What should I do if Expo does not start?**

A: Reinstall dependencies and restart Expo:

```bash
npm install
npx expo start
```

---

**Q: What should I do if changes are not showing up?**

A: Restart Expo and clear cache:

```bash
npx expo start -c
```

---

**Q: What should I do if the app cannot connect to backend on my phone?**

A: Make sure the backend is running and replace `127.0.0.1` with your computer's local network IP address.

---

**Q: Where should I edit retailer pages?**

A: Retailer screens are located in:

```txt
app/(retailer)/
```

---

**Q: Where should I edit TCE pages?**

A: TCE screens are located in:

```txt
app/(tce)/
```

## Development Notes

- `bm-frontend/` is the main mobile app.
- Retailer and TCE screens are separated using Expo Router route groups.
- Some app content may still be mock/demo data.
- Official BM product, news, resource, reward, and translation data should replace mock data as development continues.
