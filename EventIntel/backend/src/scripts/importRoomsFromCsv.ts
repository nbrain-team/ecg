import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { parse } from 'csv-parse/sync';
import FormData from 'form-data';

type CsvRow = Record<string, string>;

function getArg(flag: string, fallback?: string): string | undefined {
  const idx = process.argv.indexOf(flag);
  if (idx !== -1 && process.argv[idx + 1]) return process.argv[idx + 1];
  return fallback;
}

function normalizeForMatch(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '');
}

async function main(): Promise<void> {
  const csvPath = getArg('--csv') || getArg('-c') || path.resolve(process.cwd(), 'rooms.csv');
  const imagesDir = getArg('--imagesDir') || getArg('-i');
  const apiUrl = (getArg('--apiUrl') || 'https://ecg-intelligence-api.onrender.com').replace(/\/$/, '');
  const email = getArg('--email') || 'manager@grandvelasloscabos.com';
  const password = getArg('--password') || 'hotel123';

  if (!csvPath || !fs.existsSync(csvPath)) {
    throw new Error(`CSV not found at ${csvPath}`);
  }
  if (!imagesDir || !fs.existsSync(imagesDir) || !fs.statSync(imagesDir).isDirectory()) {
    throw new Error(`Images directory not found or not a directory: ${imagesDir}`);
  }

  const csvContent = fs.readFileSync(csvPath, 'utf8');
  const rows: CsvRow[] = parse(csvContent, { columns: true, skip_empty_lines: true });

  // Login as hotel user
  const loginResp = await axios.post(`${apiUrl}/api/hotels/login`, { email, password });
  const token: string = loginResp.data?.token;
  if (!token) throw new Error('Failed to obtain hotel token');
  const authHeaders = { Authorization: `Bearer ${token}` };

  // Fetch existing rooms and delete them
  const existingRoomsResp = await axios.get(`${apiUrl}/api/hotels/rooms`, { headers: authHeaders });
  const existingRooms: Array<{ id: string }> = existingRoomsResp.data || [];
  for (const r of existingRooms) {
    try { await axios.delete(`${apiUrl}/api/hotels/rooms/${r.id}`, { headers: authHeaders }); } catch {}
  }

  // Pre-index images by normalized base name
  const imageFiles = fs.readdirSync(imagesDir).filter(f => !fs.statSync(path.join(imagesDir, f)).isDirectory());
  const index = imageFiles.map((filename) => {
    const basename = filename.replace(/\.[^.]+$/, '');
    return { filename, basename, norm: normalizeForMatch(basename) };
  });

  async function uploadImage(filePath: string, altText: string): Promise<string> {
    const form = new FormData();
    form.append('file', fs.createReadStream(filePath));
    form.append('alt', altText);
    form.append('category', 'room');
    const resp = await axios.post(`${apiUrl}/api/hotels/images/upload`, form, {
      headers: { ...form.getHeaders(), ...authHeaders }
    });
    return resp.data?.url || resp.data?.url;
  }

  function findImagesForRoom(roomName: string): string[] {
    const normName = normalizeForMatch(roomName);
    const exact = index.filter(e => e.norm === normName);
    const partial = index.filter(e => e.norm.includes(normName) || normName.includes(e.norm));
    const hits = exact.length > 0 ? exact : partial;
    // return full paths
    return hits.map(h => path.join(imagesDir, h.filename));
  }

  for (const row of rows) {
    const name = (row['Name'] || '').trim();
    if (!name) continue;
    const description = (row['Description'] || '').trim();
    const occupancy = (row['Occupancy'] || '').trim();
    const sizeLabel = (row['Size'] || '').trim();
    const sizeSqft = (() => {
      const m = sizeLabel.replace(/,/g, '').match(/(\d+)/);
      return m ? Number(m[1]) : null;
    })();
    const amenities: string[] = [row['Amenities 1'], row['Amenities 2'], row['Amenities 3'], row['Amenities 4']]
      .map(v => (v || '').trim())
      .filter(Boolean);

    const localImagePaths = findImagesForRoom(name);
    const uploadedUrls: string[] = [];
    for (const p of localImagePaths) {
      try {
        const url = await uploadImage(p, name);
        if (url) uploadedUrls.push(url);
      } catch {}
    }
    if (uploadedUrls.length === 0) {
      // No local image found; proceed without images
    }

    const payload: any = {
      name,
      description,
      size_sqft: sizeSqft,
      view: null,
      capacity: null,
      base_rate: null,
      images: uploadedUrls,
      attributes: {
        occupancy,
        size_label: sizeLabel,
        amenities
      }
    };

    await axios.post(`${apiUrl}/api/hotels/rooms`, payload, { headers: authHeaders });
  }

  // Done
  // eslint-disable-next-line no-console
  console.log(`Imported ${rows.length} rooms from CSV`);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Import failed:', err?.message || err);
  process.exit(1);
});


