/**
 * generate-packages.mjs  —  EventAura Package Generator
 *
 * What this script does:
 *   1. Backs up ALL Firestore vendor documents to a timestamped JSON file
 *   2. Fetches every vendor from the database
 *   3. Analyses each vendor's category, basePrice, tags & description to
 *      generate 3 distinct packages: Basic, Premium, Elite
 *   4. Updates Firestore with the new packages (non-destructive: preserves all
 *      other vendor fields)
 *
 * Run:  node scripts/generate-packages.mjs
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

// ─── 1. Load .env manually (same technique as seed.mjs) ───────────────────────

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

// ─── 2. Firebase client SDK ───────────────────────────────────────────────────

import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  updateDoc,
  doc,
  writeBatch,
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

// ─── 3. Package Generator ─────────────────────────────────────────────────────

/**
 * Generates 3 tailored packages for a given vendor.
 * Uses the vendor's category, basePrice, tags and description as context.
 *
 * @param {Object} vendor - Full vendor document from Firestore
 * @returns {Array} Array of 3 package objects: Basic, Premium, Elite
 */
function generatePackages(vendor) {
  const { category, basePrice = 10000, tags = [], description = '', name } = vendor;

  // Derive sensible price multipliers
  const basic   = Math.round(basePrice);
  const premium = Math.round(basePrice * 2.2);
  const elite   = Math.round(basePrice * 4.5);

  // Round prices to nearest sensible values (₹500 increments)
  const snap = (n) => Math.round(n / 500) * 500;

  const b = snap(basic);
  const p = snap(premium);
  const e = snap(elite);

  // ── Birthday Packages ──────────────────────────────────────────────────────
  if (category === 'birthday') {
    const hasKids       = tags.some(t => /kid|child|baby|unicorn|candy|sweet/i.test(t));
    const hasLuxury     = tags.some(t => /luxury|premium|gold|royal/i.test(t));
    const hasBalloon    = tags.some(t => /balloon/i.test(t));
    const hasCatering   = tags.some(t => /cater/i.test(t));
    const hasCharacter  = tags.some(t => /character|theme/i.test(t));
    const hasEntertain  = tags.some(t => /entertain|music|magic|mascot/i.test(t));

    return [
      {
        name: 'Starter Spark',
        price: b,
        features: [
          hasBalloon ? 'Balloon arch & garland' : 'Themed balloon decor',
          'Birthday banner & backdrop',
          '3-hour event coverage',
          'Cake table styling',
          'Basic cleanup included',
        ],
      },
      {
        name: 'Celebration Pro',
        price: p,
        popular: true,
        features: [
          'Full themed room transformation',
          'Custom photo booth setup',
          hasCatering ? 'Catering for up to 50 guests' : 'Candy/dessert buffet table',
          hasKids ? 'Kids entertainment (games & activities)' : 'Live DJ (2 hrs)',
          hasCharacter ? 'Character or mascot appearance' : 'Customised backdrop + props',
          '6-hour end-to-end service',
          'On-site coordinator',
        ],
      },
      {
        name: 'Grand Elite Experience',
        price: e,
        features: [
          hasLuxury ? 'Premium luxury décor with LED walls' : 'Complete premium themed setup',
          'Professional photographer (4 hrs)',
          hasEntertain ? 'Live entertainment + DJ' : 'Live band or DJ for full event',
          hasCatering ? 'Full catering for up to 100 guests' : 'Premium candy bar + dessert wall',
          'Personalised invitations & return gifts',
          'Drone photo/video highlights',
          'Full-day service with personal event manager',
        ],
      },
    ];
  }

  // ── Wedding Packages ──────────────────────────────────────────────────────
  if (category === 'wedding') {
    const hasFloral       = tags.some(t => /floral|flower|bloom|garden|bloom/i.test(t));
    const hasLuxury       = tags.some(t => /luxury|crystal|diamond|platinum|premium/i.test(t));
    const hasTraditional  = tags.some(t => /traditional|marigold|desi|bengali|diya/i.test(t));
    const hasDestination  = tags.some(t => /destination|beach|palace|heritage/i.test(t));
    const hasLighting     = tags.some(t => /light|led|fairy|crystal/i.test(t));

    return [
      {
        name: 'Blissful Beginnings',
        price: b,
        features: [
          hasFloral ? 'Floral mandap setup' : 'Decorated mandap & stage',
          'Entry gate décor',
          'Aisle decoration',
          'Centrepieces for 10 tables',
          'Stage backdrop',
          '1-day setup & breakdown',
        ],
      },
      {
        name: 'Dream Wedding',
        price: p,
        popular: true,
        features: [
          hasFloral ? 'Premium floral mandap with imported blooms' : 'Designer mandap & full stage setup',
          hasLighting ? 'Fairy-light canopy & LED ambience' : 'Full venue draping & mood lighting',
          'Complete floral aisle',
          hasDestination ? 'Venue transformation (indoor + outdoor)' : 'Full venue decoration (all areas)',
          'Bridal entry setup (phoolon ki chadar)',
          'Photo zones (3 setups)',
          'Dedicated on-site coordinator',
        ],
      },
      {
        name: 'Royal Grand Affair',
        price: e,
        features: [
          hasLuxury ? 'Star-grade luxury décor with crystals & gold draping' : 'Premium full-venue transformation',
          hasTraditional ? 'Authentic traditional theme with modern luxury touches' : 'Exclusive designer theme execution',
          'Imported flowers & premium materials',
          '360° venue coverage with photo ops at every turn',
          hasDestination ? '2-day destination wedding setup' : '2-day full-event service',
          'Live streaming setup',
          'Personal event manager + full décor team',
        ],
      },
    ];
  }

  // ── DJ Packages ──────────────────────────────────────────────────────────
  if (category === 'dj') {
    const hasBollywood  = tags.some(t => /bollywood|hindi|desi/i.test(t));
    const hasEDM        = tags.some(t => /edm|techno|house|bass/i.test(t));
    const hasBhangra    = tags.some(t => /bhangra|punjabi|garba|dandiya/i.test(t));
    const hasLounge     = tags.some(t => /lounge|ambient|corporate|retro/i.test(t));
    const hasCorporate  = tags.some(t => /corporate/i.test(t));

    const genreDesc = hasBhangra
      ? 'Bhangra/Punjabi & Folk playlist'
      : hasBollywood
      ? 'Bollywood, Pop & Fusion playlist'
      : hasEDM
      ? 'EDM, Techno & House playlist'
      : hasLounge
      ? 'Ambient lounge & retro playlist'
      : 'Custom crowd-pleasing playlist';

    return [
      {
        name: 'Beat Starter',
        price: b,
        features: [
          `4-hour ${hasLounge ? 'ambient/lounge' : 'high-energy'} set`,
          'Quality PA sound system',
          genreDesc,
          'Basic LED lighting rig',
          hasBhangra ? 'Dhol player (1 hr)' : '1 wireless microphone',
        ],
      },
      {
        name: 'Party Pro',
        price: p,
        popular: true,
        features: [
          '7-hour premium DJ set',
          'Professional-grade sound system',
          'Custom playlist collaboration with client',
          'Full LED lighting rig + fog machine',
          hasBhangra ? 'Live dhol player (full set)' : hasEDM ? 'Laser light show' : 'Live drummer (1 hr)',
          '2 wireless microphones',
          hasCorporate ? 'Professional MC service' : 'DJ + VJ simultaneous performance',
        ],
      },
      {
        name: 'Festival Elite',
        price: e,
        features: [
          'Full-night set (up to 10 hours)',
          'Concert / festival-grade sound & subwoofer rig',
          hasBhangra ? 'Professional dhol team + folk performers' : 'DJ + live drummer combo',
          'Laser, strobe & fog full production',
          'Custom artist branding & screen graphics',
          hasEDM ? 'VJ visuals & LED video wall' : 'LED wall + custom lighting design',
          'Dedicated sound engineer on-site',
          'Celebrity/VIP rider accommodation',
        ],
      },
    ];
  }

  // ── Photography Packages ──────────────────────────────────────────────────
  if (category === 'photography') {
    const hasVideo      = tags.some(t => /video|film|cinema|reel/i.test(t));
    const hasDrone      = tags.some(t => /drone|aerial/i.test(t));
    const hasCorporate  = tags.some(t => /corporate|product|conference/i.test(t));
    const hasPreWedding = tags.some(t => /pre-wedding|couple|destination/i.test(t));
    const hasPortrait   = tags.some(t => /portrait|family|maternity/i.test(t));
    const hasCandid     = tags.some(t => /candid|documentary|lifestyle/i.test(t));

    const coverageDesc = hasCorporate
      ? 'corporate event'
      : hasPortrait
      ? 'portrait session'
      : 'event';

    return [
      {
        name: 'Classic Capture',
        price: b,
        features: [
          `1 professional photographer`,
          hasCorporate ? '4-hour corporate event coverage' : '6-hour event coverage',
          `${hasCorporate ? '150+' : '200+'} fully edited high-res photos`,
          'Private online gallery (30-day access)',
          hasPortrait ? 'Studio or outdoor location shoot' : 'Digital delivery within 7 days',
        ],
      },
      {
        name: 'Premium Lens',
        price: p,
        popular: true,
        features: [
          '2 photographers',
          hasVideo ? '1 professional videographer' : 'Full-day photo coverage (8 hrs)',
          hasCandid ? '400+ candid + posed edited photos' : '350+ edited professional photos',
          hasVideo ? 'Cinematic highlight reel (5 min)' : 'Slideshow highlight video (3 min)',
          hasDrone ? 'Drone aerial photography included' : 'Same-day photo preview (10 selects)',
          'Private gallery + USB delivery',
          hasPreWedding ? 'Pre-wedding shoot (1 location)' : 'Social media ready edits',
        ],
      },
      {
        name: 'Epic Story Film',
        price: e,
        features: [
          '3 photographers + 2 videographers',
          hasDrone ? 'Full drone aerial coverage' : 'Multi-angle camera setup',
          hasPreWedding ? 'Pre-wedding + event coverage (2 days)' : 'Multi-day full event coverage',
          '700+ curated & edited photos',
          hasVideo ? '30-min cinematic feature film (4K)' : '20-min documentary-style film',
          hasCorporate ? 'Professional corporate headshots for team' : 'Fine-art hardbound photo album (50 pages)',
          'Instagram reels (3) + full social media package',
          'Dedicated post-production team | 48-hr turnaround preview',
        ],
      },
    ];
  }

  // ── Fallback generic packages (for any unlisted category) ─────────────────
  return [
    {
      name: 'Basic',
      price: b,
      features: [
        'Core service delivery',
        'Standard equipment / setup',
        'Up to 4 hours',
        'Email support',
      ],
    },
    {
      name: 'Premium',
      price: p,
      popular: true,
      features: [
        'Enhanced service package',
        'Premium equipment / materials',
        'Up to 8 hours',
        'Dedicated support',
        'Extra add-on included',
      ],
    },
    {
      name: 'Elite',
      price: e,
      features: [
        'Full-service experience',
        'Top-tier equipment & team',
        'Full-day availability',
        'Personal event manager',
        'All add-ons included',
        'Post-event follow-up',
      ],
    },
  ];
}

// ─── 4. Backup Helper ─────────────────────────────────────────────────────────

function createBackup(vendors) {
  const backupsDir = path.join(__dirname, '../backups');
  if (!existsSync(backupsDir)) mkdirSync(backupsDir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const backupFile = path.join(backupsDir, `vendors-backup-${timestamp}.json`);

  writeFileSync(backupFile, JSON.stringify({ backedUpAt: new Date().toISOString(), count: vendors.length, vendors }, null, 2), 'utf8');
  return backupFile;
}

// ─── 5. Main ──────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log('║   EventAura — Vendor Package Generator           ║');
  console.log('╚══════════════════════════════════════════════════╝\n');

  // ── Step 1: Fetch all vendors ─────────────────────────────────────────────
  console.log('📥  Step 1 — Fetching all vendors from Firestore...');
  const snap = await getDocs(collection(db, 'vendors'));
  if (snap.empty) {
    console.error('❌  No vendors found in Firestore. Run the seeder first.\n');
    process.exit(1);
  }
  const vendors = snap.docs.map((d) => ({ _docId: d.id, ...d.data() }));
  console.log(`    ✓ Fetched ${vendors.length} vendor(s)\n`);

  // ── Step 2: Backup ────────────────────────────────────────────────────────
  console.log('💾  Step 2 — Creating backup...');
  const backupPath = createBackup(vendors);
  console.log(`    ✓ Backup saved → ${backupPath}\n`);

  // ── Step 3: Generate packages ─────────────────────────────────────────────
  console.log('🧠  Step 3 — Generating packages for each vendor...\n');
  const updates = [];

  for (const vendor of vendors) {
    const { _docId, name, category, basePrice } = vendor;
    const packages = generatePackages(vendor);

    console.log(`  🏷  ${name} (${category}) — base ₹${(basePrice || 0).toLocaleString('en-IN')}`);
    packages.forEach((pkg) => {
      const popBadge = pkg.popular ? ' ⭐ popular' : '';
      console.log(`       • ${pkg.name.padEnd(25)} ₹${pkg.price.toLocaleString('en-IN')}${popBadge}`);
    });
    console.log('');

    updates.push({ docId: _docId, packages });
  }

  // ── Step 4: Write packages to Firestore in batches ────────────────────────
  console.log('☁️   Step 4 — Updating Firestore (batched writes)...');

  // Firestore batch limit = 500 ops; packages update = 1 op per vendor
  const BATCH_SIZE = 400;
  const chunks = [];
  for (let i = 0; i < updates.length; i += BATCH_SIZE) {
    chunks.push(updates.slice(i, i + BATCH_SIZE));
  }

  let totalUpdated = 0;
  for (const chunk of chunks) {
    const batch = writeBatch(db);
    for (const { docId, packages } of chunk) {
      batch.update(doc(db, 'vendors', docId), { packages });
    }
    await batch.commit();
    totalUpdated += chunk.length;
    console.log(`    ✓ Batch committed — ${totalUpdated}/${updates.length} vendor(s) updated`);
  }

  // ── Done ──────────────────────────────────────────────────────────────────
  console.log('\n╔══════════════════════════════════════════════════╗');
  console.log(`║  ✅  Done! ${String(vendors.length).padStart(3)} vendors updated with 3 packages each. ║`);
  console.log('╚══════════════════════════════════════════════════╝\n');

  process.exit(0);
}

main().catch((err) => {
  console.error('\n❌  Script failed:', err.message || err);
  process.exit(1);
});
