const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;

// Per-file target max width (px) and quality
const rules = [
  // giant file -> bring way down
  { match: /mine\.png$/i, maxW: 1400, quality: 80 },
  // other large portfolio PNGs
  { match: /Weekly-Project\.png$/i, maxW: 1200, quality: 80 },
  { match: /Kwakyewaa\.png$/i, maxW: 1200, quality: 80 },
  { match: /Abdul Rashid Yussif\.png$/i, maxW: 1200, quality: 80 },
  { match: /Week 2\.png$/i, maxW: 1200, quality: 80 },
  { match: /Heritage\.png$/i, maxW: 1200, quality: 80 },
  { match: /hero picture\.png$/i, maxW: 1200, quality: 80 },
  { match: /smart\.png$/i, maxW: 1200, quality: 80 },
  { match: /mary(\s*\(1\))?\.png$/i, maxW: 800, quality: 80 },
  // assets/img
  { match: /assets[\\/]img[\\/]hero image\.jpeg$/i, maxW: 900, quality: 82 },
  { match: /assets[\\/]img[\\/]mobile\.jpg$/i, maxW: 1000, quality: 82 },
  { match: /assets[\\/]img[\\/](salon|shirt)\.jpeg$/i, maxW: 1000, quality: 82 },
  { match: /assets[\\/]img[\\/]Weekly-Project\.png$/i, maxW: 1200, quality: 80 },
];

function findRule(file) {
  return rules.find((r) => r.match.test(file));
}

function walk(dir, out) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === "node_modules" || e.name === ".git") continue;
      walk(full, out);
    } else if (/\.(png|jpe?g)$/i.test(e.name)) {
      out.push(full);
    }
  }
}

const files = [];
walk(ROOT, files);

(async () => {
  let totalBefore = 0;
  let totalAfter = 0;
  for (const file of files) {
    const rule = findRule(file);
    if (!rule) continue;
    const before = fs.statSync(file).size;
    totalBefore += before;
    try {
      const img = sharp(file, { limitInputPixels: false });
      const meta = await img.metadata();
      const w = meta.width || 0;
      const resizeW = Math.min(rule.maxW, w);
      let pipeline = img.resize({ width: resizeW, withoutEnlargement: true });
      if (/\.png$/i.test(file)) {
        pipeline = pipeline.png({ compressionLevel: 9, adaptiveFiltering: true });
      } else {
        pipeline = pipeline.jpeg({ quality: rule.quality, mozjpeg: true });
      }
      const buf = await pipeline.toBuffer();
      if (buf.length >= before) {
        console.log(`${path.relative(ROOT, file)}: ${(before/1024).toFixed(0)}KB -> kept original (re-encode larger)`);
        totalAfter += before;
        continue;
      }
      fs.writeFileSync(file, buf);
      const after = buf.length;
      totalAfter += after;
      const pct = (((before - after) / before) * 100).toFixed(1);
      console.log(`${path.relative(ROOT, file)}: ${(before/1024).toFixed(0)}KB -> ${(after/1024).toFixed(0)}KB (-${pct}%)`);
    } catch (err) {
      console.error(`FAILED ${file}: ${err.message}`);
    }
  }
  console.log(`\nTOTAL: ${(totalBefore/1024/1024).toFixed(1)}MB -> ${(totalAfter/1024/1024).toFixed(1)}MB`);
})();
