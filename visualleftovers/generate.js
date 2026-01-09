import fs from "fs";
import path from "path";
import exifr from "exifr";
import sharp from "sharp";

const fullDir = "./images/full";
const thumbDir = "./images/thumbs";
const output = "./images.json";

// Make sure thumbs folder exists
if (!fs.existsSync(thumbDir)) {
  fs.mkdirSync(thumbDir, { recursive: true });
}

const files = fs.readdirSync(fullDir).filter(f => f.match(/\.(jpg|jpeg|png|webp)$/i));
const result = [];

for (const file of files) {
  const fullPath = path.join(fullDir, file);
  const thumbPath = path.join(thumbDir, file);

  let date = "Unknown date";

  try {
    const exif = await exifr.parse(fullPath);
    if (exif?.DateTimeOriginal) {
      date = new Date(exif.DateTimeOriginal).toISOString().split("T")[0];
    } else {
      const stats = fs.statSync(fullPath);
      date = stats.birthtime.toISOString().split("T")[0];
    }
  } catch {
    const stats = fs.statSync(fullPath);
    date = stats.birthtime.toISOString().split("T")[0];
  }

  // Generate thumbnail if it doesn't exist
  if (!fs.existsSync(thumbPath)) {
    await sharp(fullPath)
      .resize({ width: 300 }) // width in pixels for thumbnail
      .toFile(thumbPath);
  }

  result.push({
    full: `images/full/${file}`,
    thumb: `images/thumbs/${file}`,
    date
  });
}

// Sort newest → oldest
result.sort((a, b) => new Date(b.date) - new Date(a.date));

fs.writeFileSync(output, JSON.stringify(result, null, 2));
console.log("images.json updated with thumbnails!");

