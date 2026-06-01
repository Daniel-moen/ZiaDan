// Convert an uploaded image File into a compressed JPEG data URL.
//
// localStorage is limited (~5MB across the whole app on most browsers), so we
// downscale very large photos and re-encode them as JPEG. This keeps multiple
// background images well within budget while still looking great as a
// full-screen background.

export type ImageToDataUrlOptions = {
  maxDimension?: number; // longest side, in CSS pixels
  quality?: number;      // JPEG quality, 0..1
};

const DEFAULT_OPTIONS: Required<ImageToDataUrlOptions> = {
  maxDimension: 2000,
  quality: 0.82,
};

export async function fileToDataUrl(
  file: File,
  options: ImageToDataUrlOptions = {},
): Promise<string> {
  const { maxDimension, quality } = { ...DEFAULT_OPTIONS, ...options };

  if (!file.type.startsWith('image/')) {
    throw new Error('Not an image file.');
  }

  // SVGs can't easily be drawn through createImageBitmap on all browsers;
  // just embed them as-is.
  if (file.type === 'image/svg+xml') {
    return readAsDataUrl(file);
  }

  const dataUrl = await readAsDataUrl(file);
  const img = await loadImage(dataUrl);

  const longest = Math.max(img.width, img.height);
  const scale = longest > maxDimension ? maxDimension / longest : 1;
  const w = Math.round(img.width * scale);
  const h = Math.round(img.height * scale);

  // If no resize is needed and it's already a JPEG, return the original
  // data URL to avoid an unnecessary re-encode (and quality loss).
  if (scale === 1 && file.type === 'image/jpeg') {
    return dataUrl;
  }

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable.');
  ctx.drawImage(img, 0, 0, w, h);

  return canvas.toDataURL('image/jpeg', quality);
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error ?? new Error('Read failed.'));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Could not decode image.'));
    img.src = src;
  });
}
