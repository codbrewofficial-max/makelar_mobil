import sharp from "sharp";

export interface ProcessedImage {
  buffer: Buffer;
  sizeBytes: number;
}

/**
 * Resize (max WxH, preserve aspect ratio, no upscaling), convert to WebP,
 * and compress iteratively until under targetKb (or quality floor reached).
 */
export async function processImage(
  input: Buffer,
  maxWidth: number,
  maxHeight: number,
  targetKb = 500
): Promise<ProcessedImage> {
  let quality = 80;
  let buffer = await sharp(input)
    .resize({ width: maxWidth, height: maxHeight, fit: "inside", withoutEnlargement: true })
    .webp({ quality })
    .toBuffer();

  while (buffer.length > targetKb * 1024 && quality > 30) {
    quality -= 10;
    buffer = await sharp(input)
      .resize({ width: maxWidth, height: maxHeight, fit: "inside", withoutEnlargement: true })
      .webp({ quality })
      .toBuffer();
  }

  return { buffer, sizeBytes: buffer.length };
}
