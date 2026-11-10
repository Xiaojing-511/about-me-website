const fs = require("fs");
const zlib = require("zlib");
const path = require("path");

const sourcePath =
  "/Users/zhangjingjing/.cursor/projects/Users-zhangjingjing-Desktop-vibe-coding-about-me-website/assets/image-dc583198-73b8-46d1-b1e5-bda112d0c1c0.png";
const outPath = path.join(__dirname, "../images/background.png");

function decodePng(file) {
  const buf = fs.readFileSync(file);
  let offset = 8;
  const chunks = [];
  while (offset < buf.length) {
    const length = buf.readUInt32BE(offset);
    const type = buf.slice(offset + 4, offset + 8).toString("ascii");
    chunks.push({ type, data: buf.slice(offset + 8, offset + 8 + length) });
    offset += 12 + length;
  }
  const ihdr = chunks.find((chunk) => chunk.type === "IHDR").data;
  const width = ihdr.readUInt32BE(0);
  const height = ihdr.readUInt32BE(4);
  const colorType = ihdr[9];
  const bpp = colorType === 6 ? 4 : colorType === 2 ? 3 : 0;
  if (!bpp) throw new Error("unsupported color type " + colorType);
  const raw = zlib.inflateSync(Buffer.concat(chunks.filter((chunk) => chunk.type === "IDAT").map((chunk) => chunk.data)));
  const stride = width * bpp;
  let index = 0;
  let prev = Buffer.alloc(stride);
  const rows = [];
  const paeth = (a, b, c) => {
    const p = a + b - c;
    const pa = Math.abs(p - a);
    const pb = Math.abs(p - b);
    const pc = Math.abs(p - c);
    return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
  };
  for (let y = 0; y < height; y += 1) {
    const filter = raw[index];
    index += 1;
    const row = Buffer.from(raw.subarray(index, index + stride));
    index += stride;
    if (filter === 1) {
      for (let x = 0; x < stride; x += 1) row[x] = (row[x] + (x >= bpp ? row[x - bpp] : 0)) & 255;
    } else if (filter === 2) {
      for (let x = 0; x < stride; x += 1) row[x] = (row[x] + prev[x]) & 255;
    } else if (filter === 3) {
      for (let x = 0; x < stride; x += 1) {
        row[x] = (row[x] + (((x >= bpp ? row[x - bpp] : 0) + prev[x]) >> 1)) & 255;
      }
    } else if (filter === 4) {
      for (let x = 0; x < stride; x += 1) {
        row[x] = (row[x] + paeth(x >= bpp ? row[x - bpp] : 0, prev[x], x >= bpp ? prev[x - bpp] : 0)) & 255;
      }
    } else if (filter !== 0) {
      throw new Error("filter " + filter);
    }
    rows.push(row);
    prev = row;
  }
  return { width, height, bpp, rows };
}

function crc32(buffer) {
  let crc = ~0;
  for (let i = 0; i < buffer.length; i += 1) {
    crc ^= buffer[i];
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return ~crc >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
}

const source = decodePng(sourcePath);
const columns = 4;
const rows = 12;
const tiledWidth = source.width * columns;
const tiledHeight = source.height * rows;
const outWidth = tiledWidth;
const outHeight = Math.round((outWidth * 9) / 16);
const cropY = Math.floor((tiledHeight - outHeight) / 2);
const outBpp = 3;
const rawParts = [];
let red = 0;
let green = 0;
let blue = 0;
let count = 0;

for (let y = 0; y < outHeight; y += 1) {
  const srcY = (cropY + y) % source.height;
  const srcRow = source.rows[srcY];
  const line = Buffer.alloc(1 + outWidth * outBpp);
  line[0] = 0;
  for (let x = 0; x < outWidth; x += 1) {
    const srcX = x % source.width;
    const src = srcX * source.bpp;
    const r = srcRow[src];
    const g = srcRow[src + 1];
    const b = srcRow[src + 2];
    const dest = 1 + x * outBpp;
    line[dest] = r;
    line[dest + 1] = g;
    line[dest + 2] = b;
    if ((x & 31) === 0 && (y & 31) === 0) {
      red += r;
      green += g;
      blue += b;
      count += 1;
    }
  }
  rawParts.push(line);
}

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(outWidth, 0);
ihdr.writeUInt32BE(outHeight, 4);
ihdr[8] = 8;
ihdr[9] = 2;
const png = Buffer.concat([
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
  chunk("IHDR", ihdr),
  chunk("IDAT", zlib.deflateSync(Buffer.concat(rawParts), { level: 6 })),
  chunk("IEND", Buffer.alloc(0)),
]);
fs.writeFileSync(outPath, png);
console.log(
  JSON.stringify({
    out: outPath,
    size: [outWidth, outHeight],
    tiles: [columns, rows],
    cropY,
    average: [Math.round(red / count), Math.round(green / count), Math.round(blue / count)],
    bytes: png.length,
  })
);
