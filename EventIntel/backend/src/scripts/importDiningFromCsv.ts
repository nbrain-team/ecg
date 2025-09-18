import fs from 'fs';
import path from 'path';
import axios from 'axios';
import FormData from 'form-data';
import { parse } from 'csv-parse/sync';

/**
 * Import dining outlets from a CSV and upload local images, replacing existing dining for the authenticated hotel.
 * Env vars required:
 *  - HOTEL_TOKEN: JWT for a hotel user
 *  - API_URL: API base (default https://ecg-intelligence-api.onrender.com)
 * Optional:
 *  - DINING_CSV: absolute path to CSV (default /Users/dannydemichele/ECG/dining.csv)
 *  - DINING_IMAGES_DIR: absolute path to images dir (default /Users/dannydemichele/ECG/EventIntel/frontend/public/images/dining)
 */
async function main(): Promise<void> {
  const API_URL = process.env.API_URL || 'https://ecg-intelligence-api.onrender.com';
  const TOKEN = process.env.HOTEL_TOKEN || process.env.TOKEN;
  if (!TOKEN) {
    throw new Error('HOTEL_TOKEN env var required');
  }

  const CSV_PATH = process.env.DINING_CSV || '/Users/dannydemichele/ECG/dining.csv';
  const IMAGES_DIR_PRIMARY = process.env.DINING_IMAGES_DIR || '/Users/dannydemichele/ECG/EventIntel/frontend/public/images/dining';
  const IMAGES_DIR_FALLBACK = '/Users/dannydemichele/ECG/grandvelas/meeting-venues';

  const csvRaw = fs.readFileSync(CSV_PATH, 'utf8');
  const records = parse(csvRaw, {
    columns: true,
    skip_empty_lines: true,
    relax_quotes: true,
    relax_column_count: true
  }) as Array<Record<string, string>>;

  const auth = { headers: { Authorization: `Bearer ${TOKEN}` } };

  // Delete existing dining
  const existing = await axios.get(`${API_URL}/api/hotels/dining`, auth).then(r => r.data as any[]);
  for (const d of existing) {
    try {
      await axios.delete(`${API_URL}/api/hotels/dining/${d.id}` , auth);
    } catch {}
  }

  const imageDirs = [IMAGES_DIR_PRIMARY, IMAGES_DIR_FALLBACK].filter(d => fs.existsSync(d));
  const dirFiles: Array<[string, string[]]> = imageDirs.map(d => [d, fs.readdirSync(d)]);

  function slugify(s: string): string {
    return s
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove accents
      .toLowerCase()
      .replace(/&/g, ' and ')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .replace(/--+/g, '-');
  }

  function findImageForName(outletName: string): string | null {
    const baseSlug = slugify(outletName);
    for (const [dir, files] of dirFiles) {
      // Exact base match
      for (const f of files) {
        const nameSlug = slugify(path.parse(f).name);
        if (nameSlug === baseSlug) return path.join(dir, f);
      }
      // Contains match
      const contains = files.find(f => slugify(path.parse(f).name).includes(baseSlug));
      if (contains) return path.join(dir, contains);
    }
    return null;
  }

  async function uploadImage(filePath: string): Promise<string> {
    const form = new FormData();
    const stream = fs.createReadStream(filePath);
    form.append('file', stream, path.basename(filePath));
    const resp = await axios.post(`${API_URL}/api/hotels/images/upload`, form, {
      headers: { ...form.getHeaders(), Authorization: `Bearer ${TOKEN}` },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      timeout: 120000
    });
    return resp.data?.url || resp.data?.url;
  }

  let created = 0;
  for (const rec of records) {
    const name = (rec['Name'] || '').trim();
    if (!name) continue;
    const description = (rec['Description'] || '').trim();
    const cuisine = (rec['Cuisine'] || '').trim();
    const attire = (rec['Attire'] || '').trim();
    const hours = (rec['Hours'] || '').trim();
    const attributes: any = {
      capacity: (rec['Capacity'] || '').trim(),
      rules: (rec['Rules'] || '').trim(),
      reservation_required: (rec['Reservation required'] || '').trim()
    };

    const found = findImageForName(name);
    let images: string[] = [];
    if (found && fs.existsSync(found)) {
      try {
        const url = await uploadImage(found);
        images = [url];
      } catch {}
    }

    const payload = { name, cuisine, description, hours, dress_code: attire, images, attributes };
    await axios.post(`${API_URL}/api/hotels/dining`, payload, auth);
    created += 1;
  }

  console.log(JSON.stringify({ deleted: existing.length, created }, null, 2));
}

main().catch((e) => { console.error('Import failed', e?.message || e); process.exit(1); });


