import exifr from 'exifr';

const imagePath = 'images/WhatsApp Image 2026-01-06 at 12.02.45.jpeg';

try {
  const data = await exifr.parse(imagePath);
  console.log(data);
} catch (err) {
  console.error("Error reading EXIF:", err);
}
