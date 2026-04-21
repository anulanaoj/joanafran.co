const fs = require("fs");
const path = require("path");
const { generateArchiveImagesManifest } = require("./generate-archive-images.js");

const imagesDir = path.join(__dirname, "archive_images");

if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

let timer = null;

function regenerate(reason) {
  try {
    const count = generateArchiveImagesManifest();
    console.log(`[archive watcher] ${reason}: archive-images.json updated with ${count} image(s).`);
  } catch (error) {
    console.error("[archive watcher] Failed to update archive-images.json", error);
  }
}

function scheduleRegenerate(reason) {
  clearTimeout(timer);
  timer = setTimeout(() => regenerate(reason), 200);
}

regenerate("initial run");
console.log("[archive watcher] Watching archive_images for changes...");

fs.watch(imagesDir, { persistent: true }, (eventType, filename) => {
  const fileLabel = filename || "(unknown file)";
  scheduleRegenerate(`${eventType} ${fileLabel}`);
});
