/**
 * seed.mjs  —  EventAura Firestore seeder (client SDK, no firebase-admin needed)
 * Run: node scripts/seed.mjs
 *
 * Deletes ALL existing vendors & categories, then pushes fresh seed data.
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

// ── Load .env manually ────────────────────────────────────────────────────────
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath   = path.join(__dirname, '../.env');
const envLines  = readFileSync(envPath, 'utf8').split('\n');
const env = {};
for (const line of envLines) {
  const eqIdx = line.indexOf('=');
  if (eqIdx > 0) {
    const k = line.slice(0, eqIdx).trim();
    const v = line.slice(eqIdx + 1).trim();
    if (k) env[k] = v;
  }
}

// ── Firebase client SDK ───────────────────────────────────────────────────────
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  writeBatch,
  doc,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey:            env['VITE_FIREBASE_API_KEY'],
  authDomain:        env['VITE_FIREBASE_AUTH_DOMAIN'],
  projectId:         env['VITE_FIREBASE_PROJECT_ID'],
  storageBucket:     env['VITE_FIREBASE_STORAGE_BUCKET'],
  messagingSenderId: env['VITE_FIREBASE_MESSAGING_SENDER_ID'],
  appId:             env['VITE_FIREBASE_APP_ID'],
};

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

// ── Helpers ───────────────────────────────────────────────────────────────────

async function deleteCollection(colName) {
  const snap = await getDocs(collection(db, colName));
  if (snap.empty) { console.log(`  ✓ "${colName}" already empty`); return; }
  const chunks = [];
  for (let i = 0; i < snap.docs.length; i += 400) {
    chunks.push(snap.docs.slice(i, i + 400));
  }
  for (const chunk of chunks) {
    const batch = writeBatch(db);
    chunk.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }
  console.log(`  🗑  Deleted ${snap.docs.length} doc(s) from "${colName}"`);
}

async function seedCollection(colName, items) {
  for (const item of items) {
    await addDoc(collection(db, colName), { ...item, createdAt: serverTimestamp() });
  }
  console.log(`  ✅ Seeded ${items.length} doc(s) into "${colName}"`);
}

// ── Seed Data ─────────────────────────────────────────────────────────────────

const CATEGORIES = [
  {
    id: 'birthday', name: 'Birthday Planning', icon: '🎂',
    description: 'Themed packages & custom builder',
    color: '#f472b6', gradient: 'linear-gradient(135deg, #f472b6, #a855f7)',
  },
  {
    id: 'wedding', name: 'Wedding Decoration', icon: '💍',
    description: 'Elegant galleries & tiering options',
    color: '#fbbf24', gradient: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
  },
  {
    id: 'dj', name: 'DJ Booking', icon: '🎧',
    description: 'Genre filters & mock portfolios',
    color: '#60a5fa', gradient: 'linear-gradient(135deg, #60a5fa, #3b82f6)',
  },
  {
    id: 'photography', name: 'Photography', icon: '📷',
    description: 'Candid, traditional & cinematic',
    color: '#34d399', gradient: 'linear-gradient(135deg, #34d399, #10b981)',
  },
];

const VENDORS = [
  // ── Birthday ──────────────────────────────────────────────────────────────
  {
    name: 'Dreamland Celebrations',
    category: 'birthday', city: 'Kolkata',
    rating: 4.9, reviewCount: 214, basePrice: 18000,
    description: "Kolkata's most-loved birthday planners. We craft magical experiences from fairy-tale princess setups to neon gamer parties.",
    tags: ['Themed Decor', 'Balloon Art', 'Catering'],
    emoji: '🎂',
    imageUrl: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80',
    galleryUrls: [
      'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800&q=80',
      'https://images.unsplash.com/photo-1558636508-e0969431e2f5?w=800&q=80',
      'https://images.unsplash.com/photo-1567636788276-40a47795ba4d?w=800&q=80',
    ],
    featured: true,
    heroGradient: 'linear-gradient(135deg, #f472b6, #a855f7)',
    packages: [
      { name: 'Starter',  price: 18000, features: ['Basic balloon decor', 'Welcome banner', '2-hr setup', 'Cleanup'] },
      { name: 'Premium',  price: 32000, features: ['Full themed setup', 'Customised backdrop', 'Props & Photobooth', '5-hr coverage', 'Catering (50 pax)'], popular: true },
      { name: 'Elite',    price: 55000, features: ['Luxury floral decor', 'LED wall', 'Live music (1 hr)', 'Catering (100 pax)', 'Photography'] },
    ],
  },
  {
    name: 'Balloon & Beyond',
    category: 'birthday', city: 'Kolkata',
    rating: 4.7, reviewCount: 178, basePrice: 12000,
    description: 'Specialists in balloon architecture and kids party decor. Turn any venue into a wonderland your child will never forget.',
    tags: ['Kids Parties', 'Balloon Sculpting', 'Character Themes'],
    emoji: '🎈',
    imageUrl: 'https://images.unsplash.com/photo-1647179388085-ac39c65da29e?w=800&q=80',
    galleryUrls: [
      'https://images.unsplash.com/photo-1602631985686-1bb0e6a8696e?w=800&q=80',
      'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80',
    ],
    featured: false,
    heroGradient: 'linear-gradient(135deg, #fb923c, #f472b6)',
    packages: [
      { name: 'Basic',  price: 12000, features: ['Balloon arch', 'Theme banner', '1-hr setup'] },
      { name: 'Deluxe', price: 24000, features: ['Sculpted balloon display', 'Character backdrop', 'Gift table styling', 'Return gifts (20 pax)'], popular: true },
    ],
  },
  {
    name: 'Party Wizards',
    category: 'birthday', city: 'Howrah',
    rating: 4.6, reviewCount: 93, basePrice: 9500,
    description: 'Budget-friendly yet spectacular birthday setups for all age groups. Great for intimate house parties or grand hall events.',
    tags: ['Budget-Friendly', 'Adults', 'Corporate Birthdays'],
    emoji: '🪄',
    imageUrl: 'https://images.unsplash.com/photo-1519671282429-b8f35f5bfb54?w=800&q=80',
    galleryUrls: [
      'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800&q=80',
    ],
    featured: false,
    heroGradient: 'linear-gradient(135deg, #a78bfa, #6d28d9)',
    packages: [
      { name: 'Starter', price: 9500,  features: ['Basic setup', 'Paper decor', 'Cake table'] },
      { name: 'Plus',    price: 18000, features: ['Themed decor', 'LED lights', 'Backdrop + props', 'DJ (2 hrs)'], popular: true },
    ],
  },

  // ── Wedding ───────────────────────────────────────────────────────────────
  {
    name: 'Royal Knot Decorators',
    category: 'wedding', city: 'Kolkata',
    rating: 4.95, reviewCount: 341, basePrice: 85000,
    description: 'Award-winning wedding decorators bringing opulence and elegance to your most special day. Full venue transformation guaranteed.',
    tags: ['Luxury', 'Floral', 'Mandap Setup', 'Lighting'],
    emoji: '💍',
    imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80',
    galleryUrls: [
      'https://images.unsplash.com/photo-1478146059778-26028b07395a?w=800&q=80',
      'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=800&q=80',
      'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&q=80',
    ],
    featured: true,
    heroGradient: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
    packages: [
      { name: 'Silver',   price: 85000,  features: ['Mandap setup', 'Stage floral', 'Entry gate decor', 'Basic lighting'] },
      { name: 'Gold',     price: 160000, features: ['Full venue draping', 'Designer mandap', 'LED wall', 'Floral aisle', 'Photo zone'], popular: true },
      { name: 'Platinum', price: 280000, features: ['5-star grade decor', 'Imported flowers', 'Drone coverage', 'Video mapping', 'Live flowers'] },
    ],
  },
  {
    name: 'The Wedding Canvas',
    category: 'wedding', city: 'Kolkata',
    rating: 4.8, reviewCount: 207, basePrice: 60000,
    description: 'Crafting cinematic wedding stories through stunning decor and impeccable styling. Specialising in intimate and destination weddings.',
    tags: ['Destination', 'Minimalist', 'Bohemian', 'Intimate'],
    emoji: '🌸',
    imageUrl: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800&q=80',
    galleryUrls: [
      'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80',
      'https://images.unsplash.com/photo-1478146059778-26028b07395a?w=800&q=80',
    ],
    featured: false,
    heroGradient: 'linear-gradient(135deg, #fde68a, #fbbf24)',
    packages: [
      { name: 'Essentials', price: 60000,  features: ['Stage setup', 'Welcome arch', 'Table centrepieces'] },
      { name: 'Grand',      price: 120000, features: ['Full venue floral', 'Bridal entry car decor', 'Phoolon ki chadar', 'Photo zones (3)'], popular: true },
    ],
  },
  {
    name: 'Shubh Vivah Decors',
    category: 'wedding', city: 'Dum Dum',
    rating: 4.6, reviewCount: 145, basePrice: 45000,
    description: 'Traditional Bengali & North-Indian wedding decor specialists. Authentic themes with modern flair at competitive prices.',
    tags: ['Bengali Wedding', 'Traditional', 'Affordable Luxury'],
    emoji: '🪔',
    imageUrl: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=800&q=80',
    galleryUrls: [
      'https://images.unsplash.com/photo-1537633552985-df8429e8244b?w=800&q=80',
    ],
    featured: false,
    heroGradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
    packages: [
      { name: 'Classic',  price: 45000, features: ['Mandap', 'Flower stage', 'Gate decor'] },
      { name: 'Premium',  price: 90000, features: ['Full Bengali thematic setup', 'Alpana & props', 'LED backdrop', 'Catering assist'], popular: true },
    ],
  },

  // ── DJ ────────────────────────────────────────────────────────────────────
  {
    name: 'DJ Nitro',
    category: 'dj', city: 'Kolkata',
    rating: 4.9, reviewCount: 512, basePrice: 25000,
    description: "Kolkata's #1 DJ for weddings, corporate nights, and club events. 10+ years of experience. Fully equipped with top-tier sound systems.",
    tags: ['Bollywood', 'EDM', 'Commercial', 'Live Mixing'],
    emoji: '🎧',
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
    galleryUrls: [
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80',
      'https://images.unsplash.com/photo-1504704911898-68304a7d2807?w=800&q=80',
      'https://images.unsplash.com/photo-1547778317-a60b0a1dbf7d?w=800&q=80',
    ],
    featured: true,
    heroGradient: 'linear-gradient(135deg, #60a5fa, #3b82f6)',
    packages: [
      { name: 'Standard', price: 25000, features: ['4-hr set', 'PA system', 'Basic lights', 'Playlist collab'] },
      { name: 'Pro',      price: 45000, features: ['6-hr set', 'Premium sound', 'LED wall', 'Wireless mic', 'Fog machine'], popular: true },
      { name: 'VIP',      price: 80000, features: ['Full night (8 hrs)', 'Festival-grade rig', 'Laser lights', 'Live drummer', 'MC service'] },
    ],
  },
  {
    name: 'Bass Republic',
    category: 'dj', city: 'Salt Lake',
    rating: 4.7, reviewCount: 289, basePrice: 18000,
    description: 'Electrifying sets tailored to your crowd. Experts in Bollywood remixes, EDM drops, and retro nights. Equipment included.',
    tags: ['Retro', 'Bollywood', 'Techno', 'House'],
    emoji: '🔊',
    imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80',
    galleryUrls: [
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
      'https://images.unsplash.com/photo-1504704911898-68304a7d2807?w=800&q=80',
    ],
    featured: false,
    heroGradient: 'linear-gradient(135deg, #818cf8, #4f46e5)',
    packages: [
      { name: 'Basic',   price: 18000, features: ['3-hr set', 'Sound system', 'Lighting rig'] },
      { name: 'Premium', price: 35000, features: ['5-hr set', 'Advanced sound', 'LED strips', 'Smoke machine', 'Wireless mic'], popular: true },
    ],
  },
  {
    name: 'DJ Krossroads',
    category: 'dj', city: 'Behala',
    rating: 4.5, reviewCount: 134, basePrice: 12000,
    description: 'Affordable and energetic DJ service for birthdays, pujas, and small gatherings. Always a crowd-pleaser!',
    tags: ['Budget', 'Puja', 'Birthday', 'Local Events'],
    emoji: '🎵',
    imageUrl: 'https://images.unsplash.com/photo-1547778317-a60b0a1dbf7d?w=800&q=80',
    galleryUrls: [],
    featured: false,
    heroGradient: 'linear-gradient(135deg, #38bdf8, #0ea5e9)',
    packages: [
      { name: 'Starter', price: 12000, features: ['2-hr set', 'Bluetooth speakers', 'Basic songs list'] },
      { name: 'Event',   price: 22000, features: ['4-hr set', 'DJ console', 'Portable lights', 'Mic'], popular: true },
    ],
  },

  // ── Photography ───────────────────────────────────────────────────────────
  {
    name: 'Frame & Soul Studio',
    category: 'photography', city: 'Kolkata',
    rating: 4.95, reviewCount: 448, basePrice: 40000,
    description: 'Documentary-style wedding and event photography. We capture raw emotions, candid moments and cinematic reels that last forever.',
    tags: ['Candid', 'Cinematic', 'Drone', 'Couple Shoot'],
    emoji: '📷',
    imageUrl: 'https://images.unsplash.com/photo-1554080353-a576cf803bda?w=800&q=80',
    galleryUrls: [
      'https://images.unsplash.com/photo-1493863641943-9b68992a8d07?w=800&q=80',
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80',
      'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800&q=80',
    ],
    featured: true,
    heroGradient: 'linear-gradient(135deg, #34d399, #10b981)',
    packages: [
      { name: 'Silver',  price: 40000,  features: ['6-hr coverage', '300+ edited photos', 'Online gallery', '1 photographer'] },
      { name: 'Gold',    price: 75000,  features: ['Full day', '600+ edited photos', 'Cinematic reel (5 min)', '2 photographers', 'Drone shots'], popular: true },
      { name: 'Diamond', price: 130000, features: ['Pre-wedding shoot', 'Full album (hardbound)', 'Feature film (15 min)', 'Photo booth', 'Same-day edit'] },
    ],
  },
  {
    name: 'Lenscraft by Aryan',
    category: 'photography', city: 'Park Street',
    rating: 4.8, reviewCount: 267, basePrice: 28000,
    description: 'Artistic portrait and event photography with a Bollywood-inspired cinematic flair. Every frame tells a story.',
    tags: ['Portrait', 'Traditional', 'Highlight Film', 'Instagram Ready'],
    emoji: '🎞️',
    imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80',
    galleryUrls: [
      'https://images.unsplash.com/photo-1554080353-a576cf803bda?w=800&q=80',
      'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800&q=80',
    ],
    featured: false,
    heroGradient: 'linear-gradient(135deg, #6ee7b7, #059669)',
    packages: [
      { name: 'Basic',     price: 28000, features: ['5-hr coverage', '200+ photos', 'Highlight reel (3 min)'] },
      { name: 'Cinematic', price: 55000, features: ['Full day', '400+ photos', 'Feature film', 'Drone', 'Album'], popular: true },
    ],
  },
  {
    name: 'Pixel Perfect Events',
    category: 'photography', city: 'Newtown',
    rating: 4.6, reviewCount: 189, basePrice: 20000,
    description: 'Premium photography for corporate events, product launches, and social celebrations. Crisp, professional results every time.',
    tags: ['Corporate', 'Product Launch', 'Conference', 'Social Events'],
    emoji: '🖼️',
    imageUrl: 'https://images.unsplash.com/photo-1493863641943-9b68992a8d07?w=800&q=80',
    galleryUrls: [
      'https://images.unsplash.com/photo-1554080353-a576cf803bda?w=800&q=80',
    ],
    featured: false,
    heroGradient: 'linear-gradient(135deg, #4ade80, #16a34a)',
    packages: [
      { name: 'Essential',    price: 20000, features: ['4-hr coverage', '150+ photos', 'Quick delivery (48 hrs)'] },
      { name: 'Professional', price: 38000, features: ['8-hr coverage', '300+ photos', 'Video highlights', 'Same-day preview'], popular: true },
    ],
  },
];

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🚀 EventAura Firestore Seeder\n');

  console.log('Step 1 — Clearing existing data...');
  await deleteCollection('vendors');
  await deleteCollection('categories');

  console.log('\nStep 2 — Seeding categories...');
  await seedCollection('categories', CATEGORIES);

  console.log('\nStep 3 — Seeding vendors...');
  await seedCollection('vendors', VENDORS);

  console.log('\n🎉 Done! Firestore seeded with', CATEGORIES.length, 'categories and', VENDORS.length, 'vendors.\n');
  process.exit(0);
}

main().catch((err) => {
  console.error('\n❌ Seeder failed:', err);
  process.exit(1);
});
