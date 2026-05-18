/**
 * seed_firestore.mjs
 * ──────────────────
 * One-time script to upload cases.json into Firebase Firestore.
 * Run once from the project root:
 *
 *   npm install firebase
 *   node seed_firestore.mjs
 *
 * After seeding you no longer need this file.
 */

import { readFileSync } from 'fs';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, writeBatch } from 'firebase/firestore';

// ─── Firebase config ──────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey:            "AIzaSyAsCIyQ6JcjFUecOJKY6MY3uzgffRSTR98",
  authDomain:        "yahakeem-b9349.firebaseapp.com",
  projectId:         "yahakeem-b9349",
  storageBucket:     "yahakeem-b9349.firebasestorage.app",
  messagingSenderId: "533411259533",
  appId:             "1:533411259533:web:bdceb1b45ab2b9b7326ec4",
  measurementId:     "G-FHFYJVFRFK"
};

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

// ─── Load local JSON ──────────────────────────────────────────────────────────
const { cases, qr_rules } = JSON.parse(readFileSync('./cases.json', 'utf8'));

// ─── Helpers ──────────────────────────────────────────────────────────────────
// Firestore writeBatch is limited to 500 ops per batch.
async function batchWrite(collectionName, docs, idFn) {
  const COL = collection(db, collectionName);
  let batch  = writeBatch(db);
  let count  = 0;

  for (const item of docs) {
    const docId = idFn(item);
    batch.set(doc(COL, docId), item);
    count++;

    if (count === 499) {              // flush before hitting the 500-op limit
      await batch.commit();
      console.log(`  ✓ Flushed batch of ${count} docs to "${collectionName}"`);
      batch = writeBatch(db);
      count = 0;
    }
  }

  if (count > 0) {
    await batch.commit();
    console.log(`  ✓ Flushed final batch of ${count} docs to "${collectionName}"`);
  }
}

// ─── Seed ─────────────────────────────────────────────────────────────────────
async function seed() {
  console.log(`\nSeeding Firestore project: ${firebaseConfig.projectId}\n`);

  // Cases — document ID = question ID (e.g. "8663")
  console.log(`Uploading ${cases.length} cases …`);
  await batchWrite('cases', cases, c => String(c.id));

  // QR Rules — document ID = chapter-slug + index (e.g. "adult_inflammatory_arthritis-0")
  const slugify = str => str.toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 50);
  const qrWithIdx = qr_rules.map((r, i) => ({ ...r, _idx: i }));
  console.log(`Uploading ${qr_rules.length} QR rules …`);
  await batchWrite('qr_rules', qrWithIdx, r => `${slugify(r.chapter)}-${r._idx}`);

  console.log('\n✅  Seeding complete.\n');
  process.exit(0);
}

seed().catch(err => {
  console.error('❌  Seeding failed:', err);
  process.exit(1);
});
