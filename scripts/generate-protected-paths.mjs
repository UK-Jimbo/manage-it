import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const protectedDir = path.join(__dirname, '..', 'app', '(protected)');

function getProtectedPaths(dir, basePath = '') {
  const paths = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // Recurse into subdirectories
      const subPaths = getProtectedPaths(fullPath, path.join(basePath, item));
      paths.push(...subPaths);
    } else if (item === 'page.tsx' || item === 'page.js') {
      // Found a page file, add the path
      const routePath = basePath ? `/${basePath}` : '/';
      paths.push(routePath);
    }
  }

  return paths;
}

const protectedPaths = getProtectedPaths(protectedDir);

const output = `// Auto-generated file. Do not edit manually.
// Run 'pnpm run generate-protected-paths' to update.

export const PROTECTED_PATHS = ${JSON.stringify(protectedPaths, null, 2)};
`;

const outputPath = path.join(__dirname, '..', 'lib', 'protected-paths.ts');
fs.writeFileSync(outputPath, output);

console.log('Protected paths generated:', protectedPaths);