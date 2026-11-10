import { readdirSync } from "node:fs";
import path from "node:path";

/**
 * Every sticker in a folder of `public/kookify` ("stickers" or "words"), read at build time, so
 * adding art needs no code.
 */
export function listStickers(folder = "stickers"): string[] {
  try {
    return readdirSync(path.join(process.cwd(), "public", "kookify", folder))
      .filter((file) => /\.(webp|png)$/i.test(file))
      .sort()
      .map((file) => `/kookify/${folder}/${file}`);
  } catch {
    return [];
  }
}
