// Import script: reads cards_source.tsv and bulk-inserts into Supabase.
//
// Usage:
//   1. Make sure your .env has VITE_SUPABASE_URL and a SERVICE ROLE key
//      (not the anon key — this script needs to bypass RLS to insert).
//      Add SUPABASE_SERVICE_ROLE_KEY=... to .env (get it from
//      Supabase Dashboard → Project Settings → API → service_role key).
//      NEVER expose the service role key in client-side code — this
//      script only runs locally/once, it's not shipped to the browser.
//   2. yarn node scripts/importCards.mjs
//
// The TSV format (tab-separated):
//   Category | Difficulty | Card (the safe word) | CantSay1..5
//
// Blank CantSay cells are skipped. Rows with no Card value are skipped.

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import 'dotenv/config';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TSV_PATH = join(__dirname, '..', 'cards_source.tsv');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    'Missing env vars. Need VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env'
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

function parseTsv(raw) {
  const lines = raw.split('\n').filter((l) => l.trim().length > 0);
  const [, ...rows] = lines; // drop header row
  const cards = [];

  for (const line of rows) {
    const cols = line.split('\t');
    const [category, difficulty, card, ...cantSayCols] = cols;

    if (!card || !card.trim()) continue; // skip blank/malformed rows

    const cantSay = cantSayCols
      .map((c) => (c ?? '').trim())
      .filter((c) => c.length > 0);

    cards.push({
      category: category.trim(),
      difficulty: difficulty.trim(),
      safe_word: card.trim(),
      cant_say: cantSay,
      active: true,
    });
  }

  return cards;
}

async function main() {
  const raw = readFileSync(TSV_PATH, 'utf-8');
  const cards = parseTsv(raw);

  console.log(`Parsed ${cards.length} cards from ${TSV_PATH}`);

  // Insert in batches to stay well under request size limits
  const BATCH_SIZE = 50;
  let inserted = 0;

  for (let i = 0; i < cards.length; i += BATCH_SIZE) {
    const batch = cards.slice(i, i + BATCH_SIZE);
    const { error, data } = await supabase.from('cards').insert(batch).select('id');

    if (error) {
      console.error(`Batch starting at row ${i} failed:`, error.message);
      process.exit(1);
    }

    inserted += data.length;
    console.log(`Inserted ${inserted}/${cards.length}...`);
  }

  console.log(`Done. Inserted ${inserted} cards.`);
}

main().catch((err) => {
  console.error('Import failed:', err);
  process.exit(1);
});
