const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const imgs = [
  path.join(__dirname, "assets", "img", "hero image.jpeg"),
  path.join(__dirname, "assets", "img", "mobile.jpg"),
  path.join(__dirname, "assets", "img", "salon.jpeg"),
  path.join(__dirname, "assets", "img", "shirt.jpeg"),
];

(async () => {
  for (const file of imgs) {
    if (!fs.existsSync(file)) { console.log("missing", file); continue; }
    const before = fs.statSync(file).size;
    const tmp = file + ".tmp";
    try {
      const img = sharp(file, { limitInputPixels: false });
      const meta = await img.metadata();
      const w = meta.width || 0;
      const maxW = /\.png$/i.test(file) ? 1200 : 1000;
      const q = /\.png$/i.test(file) ? undefined : 82;
      let p = img.resize({ width: Math.min(maxW, w), withoutEnlargement: true });
      p = /\.png$/i.test(file) ? p.png({ compressionLevel: 9 }) : p.jpeg({ quality: q, mozjpeg: true });
      await p.toFile(tmp);
      const after = fs.statSync(tmp).size;
      if (after < before) {
        fs.renameSync(tmp, file);
        console.log(`${path.basename(file)}: ${(before/1024).toFixed(0)}KB -> ${(after/1024).toFixed(0)}KB`);
      } else {
        if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
        console.log(`${path.basename(file)}: kept original`);
      }
    } catch (err) {
      if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
      console.error(`FAILED ${file}: ${err.message}`);
    }
  }
})();
