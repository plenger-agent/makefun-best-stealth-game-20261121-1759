// Night Archive — the hand-in program (main.ts).
// It copies the game and its screenshots into the output directory and
// writes the dossier there, using the kit's buildDossier. Node 22
// standard library only; nothing is installed and nothing is fetched.

import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = dirname(fileURLToPath(new URL('./main.ts', import.meta.url)));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

rmSync(outputDir, { recursive: true, force: true });
mkdirSync(outputDir, { recursive: true });

for (const folder of ['game', 'screenshots']) {
  const source = join(repoRoot, folder);
  if (existsSync(source)) {
    cpSync(source, join(outputDir, folder), { recursive: true });
  }
}

const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
});
const dossierPath = join(outputDir, 'dossier.json');
writeFileSync(dossierPath, dossier);

// A short human-readable summary on stdout, so a local run shows what was
// handed in without opening the dossier.
const gameCount = countFiles(join(outputDir, 'game'));
const shotCount = countFiles(join(outputDir, 'screenshots'));
console.log(
  `Night Archive handed in: ${gameCount} game files, ${shotCount} screenshots, dossier ${dossier.length} bytes -> ${outputDir}`,
);

function countFiles(dir) {
  let total = 0;
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    total += statSync(path).isDirectory() ? countFiles(path) : 1;
  }
  return total;
}
