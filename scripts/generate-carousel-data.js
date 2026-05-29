const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const PROJECTS_DIR = path.join(ROOT_DIR, 'projects');
const OUTPUT_FILE = path.join(PROJECTS_DIR, 'media-index.js');

const MEDIA_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif', '.mp4', '.webm', '.ogg', '.m4v', '.mov']);

function getTrailingNumber(fileName) {
	const baseName = path.parse(fileName).name;
	const match = baseName.match(/(\d+)$/);
	return match ? Number.parseInt(match[1], 10) : Number.POSITIVE_INFINITY;
}

function compareByOrderThenName(a, b) {
	const numberDiff = getTrailingNumber(a) - getTrailingNumber(b);
	if (numberDiff !== 0) {
		return numberDiff;
	}
	return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}

function getRelativeWebPath(absolutePath) {
	const relativePath = path.relative(ROOT_DIR, absolutePath);
	return relativePath.split(path.sep).join('/');
}

function collectMediaByFolder(currentPath, accumulator) {
	const entries = fs.readdirSync(currentPath, { withFileTypes: true });
	const filesInCurrentFolder = entries
		.filter((entry) => entry.isFile())
		.filter((entry) => MEDIA_EXTENSIONS.has(path.extname(entry.name).toLowerCase()))
		.map((entry) => entry.name)
		.sort(compareByOrderThenName)
		.map((fileName) => getRelativeWebPath(path.join(currentPath, fileName)));

	if (filesInCurrentFolder.length > 0) {
		const key = getRelativeWebPath(currentPath);
		accumulator[key] = filesInCurrentFolder;
	}

	entries
		.filter((entry) => entry.isDirectory())
		.forEach((entry) => {
			collectMediaByFolder(path.join(currentPath, entry.name), accumulator);
		});
}

function buildProjectMediaIndex() {
	if (!fs.existsSync(PROJECTS_DIR)) {
		return {};
	}

	const mediaIndex = {};
	collectMediaByFolder(PROJECTS_DIR, mediaIndex);
	return mediaIndex;
}

function writeOutput(projectMedia) {
	const fileContent = `window.generatedProjectMediaIndex = ${JSON.stringify(projectMedia, null, 2)};\n`;
	fs.writeFileSync(OUTPUT_FILE, fileContent, 'utf8');
}

const projectMedia = buildProjectMediaIndex();
writeOutput(projectMedia);
console.log(`Generated media index for ${Object.keys(projectMedia).length} folder(s) at ${OUTPUT_FILE}`);
