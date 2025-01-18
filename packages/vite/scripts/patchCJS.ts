import { readFileSync, writeFileSync } from 'node:fs';
import colors from 'picocolors';

const indexPath = process.argv[2] || 'dist/index.cjs';
let code = readFileSync(indexPath, 'utf-8');

const matchMixed = code.match(/\nexports.default = (\w+);/);
if (matchMixed) {
  const name = matchMixed[1];

  const lines = code.trimEnd().split('\n');

  for (let i = lines.length - 1; i > 0; i--) {
    if (lines[i].startsWith('exports')) lines[i] = 'module.' + lines[i];
    else {
      lines[i] += `\nmodule.exports = ${name};`;
      break;
    }
  }

  writeFileSync(indexPath, lines.join('\n'));

  console.log(colors.bold(`${indexPath} CJS patched`));
  process.exit(0);
}

const matchDefault = code.match(/\nmodule.exports = (\w+);/);

if (matchDefault) {
  code += `module.exports.default = ${matchDefault[1]};\n`;
  writeFileSync(indexPath, code);
  console.log(colors.bold(`${indexPath} CJS patched`));
  process.exit(0);
}

console.error(colors.red(`${indexPath} CJS patch failed`));
process.exit(1);
