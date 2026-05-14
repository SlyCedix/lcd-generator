import sharp from "npm:sharp";
import { BitSet } from "npm:bitset";

const CELL_WIDTH = 715 / 15;
const CELL_HEIGHT = 1045 / 16;
const LEFT_PAD = 8;
const TOP_PAD = 2;
const GRID_WIDTH = 29;
const GRID_HEIGHT = 44;

const PIXEL_COLS = 5; // target bitmap width
const PIXEL_ROWS = 8; // target bitmap height

const PIXEL_HEIGHT = GRID_HEIGHT / PIXEL_ROWS;
const PIXEL_WIDTH = GRID_WIDTH / PIXEL_COLS;

const CHARSET = "                " +
  " !\"#$%&'()*+,-./" +
  "0123456789:;<=>?" +
  "@ABCDEFGHIJKLMNO" +
  "PQRSTUVWXYZ[¥]^_" +
  "`abcdefghijklmno" +
  "pqrstuvwxyz{|}→←" +
  "                " +
  "                " +
  " 。「」、·ヲァィゥェォャュョッ" +
  "ーアイウエオカキクケコサシスセソ" +
  "タチツテトナニヌネノハヒフヘホマ" +
  "ミムメモヤユヨラリルレロワン゛゜" +
  "αäβεμδρɡ√⁻ⅉⁿ¢£ñö" +
  "ᴘԛθ∞ΩüΣπ×у千万円÷ █";

async function extract() {
  const image = sharp("util/font.png");
  const meta = await image.metadata();

  if (!meta.width || !meta.height) {
    throw new Error("Invalid image");
  }

  const cols = 15;
  const rows = 16;

  const chars: Record<string, BitSet> = {};

  let charIndex = 0;

  for (let col = 0; col < cols; col++) {
    for (let row = 0; row < rows; row++) {
      if (charIndex >= CHARSET.length) break;
      const char = CHARSET[charIndex++];
      if (char in chars) continue;
      const region = image
        .clone()
        .threshold(128)
        .extract({
          left: Math.floor(col * CELL_WIDTH + LEFT_PAD),
          top: Math.floor(row * CELL_HEIGHT + TOP_PAD),
          width: GRID_WIDTH,
          height: GRID_HEIGHT,
        });

      const bs = new BitSet();
      for (let y = 0; y < PIXEL_ROWS; y++) {
        const line = [];

        for (let x = 0; x < PIXEL_COLS; x++) {
          const cell = region.clone()
            .extract({
              top: Math.ceil(y * PIXEL_HEIGHT + PIXEL_HEIGHT / 4),
              left: Math.ceil(x * PIXEL_WIDTH + PIXEL_HEIGHT / 4),
              width: Math.floor(PIXEL_WIDTH / 2),
              height: Math.floor(PIXEL_HEIGHT / 2),
            });

          const buffer: Uint8Array = await cell.clone().raw().toBuffer();
          const value = buffer.reduce((a, b) => a + b) / buffer.length;

          const black = value < 205;
          bs.set(x + y * PIXEL_COLS, value < 205 ? 1 : 0);
          line.push(black);
        }
      }
      console.log(`${row}, ${col}, '${char}': ${bs}`);
      chars[char] = bs;
    }
  }

  let output = 'import {BitSet} from "npm:bitset"\n' +
    "export const char_map: Record<string, BitSet> = {";
  for (const c in chars) {
    output += `\n  '${c == "'" ? "\\'" : c}': new BitSet("${
      chars[c].toString()
    }"),`;
  }
  output += "\n};";

  Deno.writeFileSync("util/char_map.ts", new TextEncoder().encode(output));

  console.log("Done!");
}

extract();
