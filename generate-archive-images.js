const fs = require("fs");
const path = require("path");

const imagesDir = path.join(__dirname, "archive_images");
const outputPath = path.join(__dirname, "archive-images.json");
const allowedExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"]);

function generateArchiveImagesManifest() {
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }

  const images = fs
    .readdirSync(imagesDir, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => allowedExtensions.has(path.extname(name).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }));

  const manifest = {
    folder: "archive_images",
    images,
  };

  fs.writeFileSync(outputPath, JSON.stringify(manifest, null, 2) + "\n", "utf8");
  return images.length;
}

if (require.main === module) {
  const count = generateArchiveImagesManifest();
  console.log(`archive-images.json updated with ${count} image(s).`);
}

module.exports = {
  generateArchiveImagesManifest,
};
