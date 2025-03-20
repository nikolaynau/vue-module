import { defineConfig } from 'bumpp';
import fs from 'fs';
import { glob } from 'glob';

const packages = glob.sync('packages/*/package.json');

const publicPackages = packages.filter(file => {
  const content = JSON.parse(fs.readFileSync(file, 'utf-8'));
  return !content.private;
});

export default defineConfig({
  all: true,
  files: ['package.json', ...publicPackages]
});
