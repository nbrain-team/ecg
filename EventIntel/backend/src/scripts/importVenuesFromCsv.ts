import fs from 'fs';
import path from 'path';
import axios from 'axios';
import FormData from 'form-data';
import { parse } from 'csv-parse/sync';

/**
 * Import venues from a CSV and upload local images, replacing existing venues for the authenticated hotel.
 * Env vars required:
 *  - HOTEL_TOKEN: JWT for a hotel user
 *  - API_URL: API base (default https://ecg-intelligence-api.onrender.com)
 * Optional:
 *  - VENUES_CSV: absolute path to CSV (default /Users/dannydemichele/ECG/meetings/ECG Grand Velas Docs - Meeting Spaces.csv)
 *  - VENUE_IMAGES_DIR: absolute path to images dir (default /Users/dannydemichele/ECG/grandvelas/meeting-venues)
 */
async function main(): Promise<void> {
  const API_URL = process.env.API_URL || 'https://ecg-intelligence-api.onrender.com';
  const TOKEN = process.env.HOTEL_TOKEN || process.env.TOKEN;
  if (!TOKEN) {
    throw new Error('HOTEL_TOKEN env var required');
  }

  const CSV_PATH = process.env.VENUES_CSV || '/Users/dannydemichele/ECG/meetings/ECG Grand Velas Docs - Meeting Spaces.csv';
  const IMAGES_DIR = process.env.VENUE_IMAGES_DIR || '/Users/dannydemichele/ECG/grandvelas/meeting-venues';

  const csvRaw = fs.readFileSync(CSV_PATH, 'utf8');
  const records = parse(csvRaw, {
    columns: true,
    skip_empty_lines: true,
    relax_quotes: true,
    relax_column_count: true
  }) as Array<Record<string, string>>;

  const auth = { headers: { Authorization: `Bearer ${TOKEN}` } };

  // Delete existing venues
  const existing = await axios.get(`${API_URL}/api/hotels/venues`, auth).then(r => r.data as any[]);
  for (const v of existing) {
    try {
      await axios.delete(`${API_URL}/api/hotels/venues/${v.id}` , auth);
    } catch {}
  }

  // Helper to find image file by venue name (case/spacing tolerant)
  const imageFiles = fs.existsSync(IMAGES_DIR) ? fs.readdirSync(IMAGES_DIR) : [];
  function findImageForName(venueName: string): string | null {
    const normalized = venueName.trim().toLowerCase().replace(/\s+/g, ' ').replace(/\./g, '');
    const candidates = imageFiles.filter(f => {
      const base = path.parse(f).name.trim().toLowerCase().replace(/\s+/g, ' ').replace(/\./g, '');
      return base === normalized;
    });
    if (candidates.length > 0) return path.join(IMAGES_DIR, candidates[0]);
    // Loose match contains
    const contains = imageFiles.find(f => f.toLowerCase().includes(venueName.trim().toLowerCase()));
    return contains ? path.join(IMAGES_DIR, contains) : null;
  }

  async function uploadImage(filePath: string): Promise<string> {
    const form = new FormData();
    const stat = fs.statSync(filePath);
    const stream = fs.createReadStream(filePath);
    form.append('file', stream, path.basename(filePath));
    const resp = await axios.post(`${API_URL}/api/hotels/images/upload`, form, {
      headers: { ...form.getHeaders(), Authorization: `Bearer ${TOKEN}` },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      timeout: 120000
    });
    return resp.data?.url || resp.data?.url; // server returns record with url
  }

  let created = 0;
  for (const rec of records) {
    const name = (rec['Name'] || '').trim();
    if (!name) continue;

    const description = (rec['Description'] || '').trim();
    const attributes: any = {
      room_size_label: (rec['Room size'] || '').replace(/\s+/g, ' ').trim(),
      ceiling_height_label: (rec['Ceiling height'] || '').trim(),
      maximum_capacity: (rec['Maximum capacity'] || '').trim(),
      u_shape: (rec['U-Shape'] || '').trim(),
      banquet_rounds: (rec['Banquet rounds'] || '').trim(),
      cocktail_rounds: (rec['Cocktail rounds'] || '').trim(),
      theater: (rec['Theater'] || '').trim(),
      classroom: (rec['Classroom'] || '').trim(),
      boardroom: (rec['Boardroom'] || '').trim(),
      crescent_rounds_cabaret: (rec['Crescent rounds (Cabaret)'] || '').trim(),
      hollow_square: (rec['Hollow square'] || '').trim(),
      royal_conference: (rec['Royal conference'] || '').trim(),
    };

    const found = findImageForName(name);
    let images: string[] = [];
    if (found && fs.existsSync(found)) {
      try {
        const url = await uploadImage(found);
        images = [url];
      } catch {}
    }

    const payload = { name, description, images, attributes };
    await axios.post(`${API_URL}/api/hotels/venues`, payload, auth);
    created += 1;
  }

  console.log(JSON.stringify({ deleted: existing.length, created }, null, 2));
}

main().catch((e) => { console.error('Import failed', e?.message || e); process.exit(1); });


