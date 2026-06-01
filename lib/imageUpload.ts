// Convert uploaded image files into display-friendly images before upload.
//
// Very large photos are downscaled and re-encoded as JPEG so they upload faster
// and display consistently as full-screen backgrounds.

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

export async function uploadImageFiles(files: FileList | File[]): Promise<string[]> {
  const list = Array.from(files);
  if (list.length === 0) return [];

  const formData = new FormData();
  for (const file of await Promise.all(list.map(prepareImageForUpload))) {
    if (!file.type.startsWith('image/')) {
      throw new Error('Only image files can be uploaded.');
    }
    formData.append('images', file);
  }

  const res = await fetch('/api/images', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    let message = 'Could not upload image.';
    try {
      const body = (await res.json()) as { error?: string };
      if (body.error) message = body.error;
    } catch {
      // Keep the generic message.
    }
    throw new Error(message);
  }

  const body = (await res.json()) as { urls: string[] };
  return body.urls;
}

async function prepareImageForUpload(file: File): Promise<File> {
  if (file.type === 'image/svg+xml') return file;

  try {
    const dataUrl = await fileToDataUrl(file);
    const blob = await (await fetch(dataUrl)).blob();
    const type = blob.type || 'image/jpeg';

    return new File([blob], replaceImageExtension(file.name, extensionForType(type)), {
      lastModified: Date.now(),
      type,
    });
  } catch {
    return file;
  }
}

function replaceImageExtension(name: string, extension: string): string {
  const base = name.replace(/\.[^.]+$/, '') || 'upload';
  return `${base}.${extension}`;
}

function extensionForType(type: string): string {
  switch (type) {
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    case 'image/svg+xml':
      return 'svg';
    default:
      return 'jpg';
  }
}
