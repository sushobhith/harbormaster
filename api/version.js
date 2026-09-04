import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

let pkgVersion = '1.0.0';
try {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const pkgPath = join(__dirname, '..', 'package.json');
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
  if (pkg && pkg.version) {
    pkgVersion = pkg.version;
  }
} catch {
  // fallback if package.json is ignored or not bundled
  pkgVersion = '1.0.0';
}

export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  return res.status(200).json({ version: pkgVersion });
}
