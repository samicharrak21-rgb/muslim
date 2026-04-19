import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const note = `
لتعبئة النص الكامل تلقائياً، اجلب ملفات JSON الكاملة من مصدر منظم مثل quranjson/raw ثم استبدل src/data/quran/*.json.
أمثلة raw مذكورة في docs/HYDRATE-QURAN.md.
`;
mkdirSync(join(process.cwd(),'docs'), { recursive: true });
writeFileSync(join(process.cwd(),'docs','hydrate-result.txt'), note, 'utf8');
console.log('hydrate helper generated docs/hydrate-result.txt');
