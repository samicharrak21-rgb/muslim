import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
const qdir = join(process.cwd(), 'src/data/quran');
const files = readdirSync(qdir).filter(f => /^surah_\d+\.json$/.test(f));
if (files.length !== 114) throw new Error(`Expected 114 surah files, got ${files.length}`);
const index = JSON.parse(readFileSync(join(qdir, 'index.json'), 'utf8'));
if (index.length !== 114) throw new Error('index.json must contain 114 records');
console.log('doctor passed');
