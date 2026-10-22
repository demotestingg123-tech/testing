import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const source = fileURLToPath(new URL('../public/icons/system-pro.svg', import.meta.url));
const outputDirectory = fileURLToPath(new URL('../public/icons/', import.meta.url));

await mkdir(outputDirectory, { recursive: true });

for (const size of [192, 512]) {
	await sharp(source)
		.resize(size, size)
		.png()
		.toFile(`${outputDirectory}icon-${size}.png`);
}

await sharp(source)
	.resize(512, 512)
	.png()
	.toFile(`${outputDirectory}icon-maskable-512.png`);