# MRCP SCE — Rheumatology Review
## Deployment Guide (GitHub Actions → Firebase Hosting)

---

### Repository structure

```
/
├── index.html              ← the app (edit this)
├── cases.json              ← source data (used by seeder only)
├── seed_firestore.mjs      ← one-time Firestore seeder (run once, then ignore)
├── firebase.json           ← Firebase Hosting + Firestore config
├── firestore.rules         ← Firestore security rules
├── firestore.indexes.json  ← Firestore composite index definitions
└── .github/
    └── workflows/
        └── deploy.yml      ← GitHub Actions CI/CD pipeline
```

---

### One-time setup (do this once from any machine with Node.js)

#### 1. Create a GitHub repository
Go to github.com → New repository → name it (e.g. `mrcp-rheumatology`) → push all these files.

#### 2. Seed Firestore with the case data
You only need to run this once. After that the data lives in Firestore.

```bash
npm install firebase
node seed_firestore.mjs
```

You'll see output like:
```
Uploading 20 cases …
  ✓ Flushed final batch of 20 docs to "cases"
Uploading 126 QR rules …
  ✓ Flushed final batch of 126 docs to "qr_rules"
✅  Seeding complete.
```

#### 3. Get your Firebase service account key
This is what GitHub Actions uses to deploy on your behalf.

1. Open [Firebase Console](https://console.firebase.google.com) → Project `yahakeem-b9349`
2. Go to **Project Settings** (gear icon) → **Service accounts**
3. Click **Generate new private key** → download the JSON file
4. Go to your GitHub repo → **Settings** → **Secrets and variables** → **Actions**
5. Click **New repository secret**
   - Name:  `FIREBASE_SERVICE_ACCOUNT`
   - Value: paste the entire contents of the downloaded JSON file
6. Click **Add secret**

#### 4. Push to deploy
Every push to the `main` branch now automatically deploys:

```bash
git add .
git commit -m "update"
git push origin main
```

Watch the progress under your repo's **Actions** tab. A green ✓ means the site is live at:

```
https://yahakeem-b9349.web.app
```

---

### Making edits (from your tablet)

Since you're on a tablet, the easiest workflow is:

1. Edit `index.html` directly in the **GitHub web editor** (tap the pencil icon on the file)
2. Scroll down and tap **Commit changes** → commit to `main`
3. GitHub Actions picks it up automatically — the site is live in ~30 seconds

Alternatively, use the **GitHub Mobile** app (iOS/Android) for the same flow.

---

### Adding more cases later

1. Run `seed_firestore.mjs` again after updating `cases.json`
   — existing documents are overwritten (`setDoc` with `merge: false`)
2. No redeployment of the HTML needed; the app reads from Firestore at runtime

---

### Firestore rules summary

| Collection   | Read  | Write           |
|-------------|-------|-----------------|
| `cases`      | ✅ Public | ❌ Blocked   |
| `qr_rules`   | ✅ Public | ❌ Blocked   |
| `progress`   | ✅ Public | ✅ Public (scoped by sessionId in app logic) |

To lock down `progress` writes once you add authentication, change the rule to:
```
allow read, write: if request.auth != null && request.auth.uid == sessionId;
```
