import fs from 'fs';
import path from 'path';

export interface BlockFile {
  /** Path the file should live at in the user's project. */
  path: string;
  code: string;
  language: string;
}

const LANGUAGE_BY_EXTENSION: Record<string, string> = { '.tsx': 'tsx', '.ts': 'ts', '.css': 'css' };

/** Main file first, then other scripts, then styles. */
function fileRank(file: string, slug: string): number {
  if (file === `${slug}.tsx`) return 0;
  if (file.endsWith('.css')) return 2;
  return 1;
}

/**
 * Reads a block's source straight from `components/blocks/<slug>`, so the code shown on its
 * page is always the code the site runs.
 */
export function getBlockFiles(slug: string): BlockFile[] {
  const directory = path.join(process.cwd(), 'components', 'blocks', slug);

  return fs
    .readdirSync(directory)
    .filter((file) => path.extname(file) in LANGUAGE_BY_EXTENSION)
    .sort((a, b) => fileRank(a, slug) - fileRank(b, slug) || a.localeCompare(b))
    .map((file) => ({
      path: `components/blocks/${slug}/${file}`,
      code: fs.readFileSync(path.join(directory, file), 'utf8'),
      language: LANGUAGE_BY_EXTENSION[path.extname(file)],
    }));
}
