"use client";

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((res, rej) => {
    if (!/^image\//.test(file.type)) return rej(new Error("not an image"));
    const fr = new FileReader();
    fr.onload = () => res(fr.result as string);
    fr.onerror = () => rej(fr.error);
    fr.readAsDataURL(file);
  });
}

const hx = (x: number) => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, "0");

/** Pull the dominant vivid colour out of a logo image element. Returns [c1, darker] or null. */
export function extractAccent(img: HTMLImageElement): [string, string] | null {
  const c = document.createElement("canvas");
  const w = (c.width = 52), h = (c.height = 52);
  const ctx = c.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(img, 0, 0, w, h);
  let d: Uint8ClampedArray;
  try { d = ctx.getImageData(0, 0, w, h).data; } catch { return null; }
  const buckets: Record<string, { r: number; g: number; b: number; n: number }> = {};
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i], g = d[i + 1], b = d[i + 2], a = d[i + 3];
    if (a < 128) continue;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), lum = (mx + mn) / 2, sat = mx - mn;
    if (lum > 238 || lum < 22 || sat < 26) continue;
    const k = (r >> 5) + "-" + (g >> 5) + "-" + (b >> 5);
    (buckets[k] ||= { r: 0, g: 0, b: 0, n: 0 });
    buckets[k].r += r; buckets[k].g += g; buckets[k].b += b; buckets[k].n++;
  }
  let best: { r: number; g: number; b: number; n: number } | null = null;
  for (const k in buckets) if (!best || buckets[k].n > best.n) best = buckets[k];
  if (!best) return null;
  const r = best.r / best.n, g = best.g / best.n, b = best.b / best.n;
  return ["#" + hx(r) + hx(g) + hx(b), "#" + hx(r * 0.78) + hx(g * 0.78) + hx(b * 0.78)];
}

/** Knock out the white background of a scanned signature / stamp. Returns a PNG data URL. */
export function removeBackground(dataUrl: string): Promise<string> {
  return new Promise((res) => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = img.width; c.height = img.height;
      const ctx = c.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      const im = ctx.getImageData(0, 0, c.width, c.height), d = im.data;
      for (let i = 0; i < d.length; i += 4) {
        const lum = (d[i] + d[i + 1] + d[i + 2]) / 3;
        if (lum > 238) d[i + 3] = 0;
        else if (lum > 200) d[i + 3] = Math.round(d[i + 3] * (1 - (lum - 200) / 38));
      }
      ctx.putImageData(im, 0, 0);
      res(c.toDataURL("image/png"));
    };
    img.src = dataUrl;
  });
}
