"use client";

import { useRef, useState } from "react";

const MAX_SIDE = 1600, TARGET = 300_000, MAX_ORIGINAL = 10_000_000;

// Shrinks a photo in the browser: max 1600 px, WebP (JPEG on older Safari),
// about 250-300 KB. Redrawing on a canvas also drops location (EXIF) data.
async function shrink(file: File, MAX_SIDE: number, TARGET: number): Promise<File> {
  const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, MAX_SIDE / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas");
  c.width = Math.round(bmp.width * scale); c.height = Math.round(bmp.height * scale);
  c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
  bmp.close();
  const enc = (type: string, q: number) => new Promise<Blob | null>((r) => c.toBlob(r, type, q));
  let type = "image/webp";
  let q = 0.82, blob = await enc(type, q);
  if (!blob || blob.type !== "image/webp") { type = "image/jpeg"; blob = await enc(type, q); }
  while (blob && blob.size > TARGET && q > 0.45) { q -= 0.1; blob = await enc(type, q); }
  if (!blob) throw new Error("encode");
  return new File([blob], file.name.replace(/\.\w+$/, "") + (type === "image/webp" ? ".webp" : ".jpg"), { type });
}

// Documents use doc: bigger and sharper so the text stays readable.
export function PhotoPicker({ name, label, max = 1, hint, doc = false, required = false }: { name: string; label: string; max?: number; hint?: string; doc?: boolean; required?: boolean }) {
  const ref = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<{ url: string; kb: number }[]>([]);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [over, setOver] = useState(false);

  // Drag and drop: dropped photos go into the same file box, then get shrunk like picked ones.
  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setOver(false);
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/") || /\.(heic|heif)$/i.test(f.name));
    if (!files.length) { setMsg("Please drop photo files (JPG, PNG, WebP or HEIC)."); return; }
    const dt = new DataTransfer();
    files.forEach((f) => dt.items.add(f));
    ref.current!.files = dt.files;
    void onChange();
  }

  async function onChange() {
    const input = ref.current!;
    const picked = Array.from(input.files ?? []);
    setMsg("");
    if (picked.length > max) setMsg(`Only the first ${max} photo${max > 1 ? "s" : ""} will be used.`);
    const tooBig = picked.find((f) => f.size > MAX_ORIGINAL);
    if (tooBig) { input.value = ""; setItems([]); setMsg("That photo is over 10 MB. Please pick a smaller one."); return; }
    setBusy(true);
    try {
      const out = await Promise.all(picked.slice(0, max).map((f) => (doc ? shrink(f, 2200, 800_000) : shrink(f, MAX_SIDE, TARGET))));
      const dt = new DataTransfer();
      out.forEach((f) => dt.items.add(f));
      input.files = dt.files;
      setItems(out.map((f) => ({ url: URL.createObjectURL(f), kb: Math.round(f.size / 1024) })));
    } catch {
      setMsg("Couldn’t shrink this photo here. It will be sent as is if it is under 1 MB.");
    }
    setBusy(false);
  }

  return (
    <div className="flex flex-col gap-1.5 text-[13px] font-semibold text-ink-soft">
      <label className="flex flex-col gap-1.5">{label}
        <span data-dropzone onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "copy"; setOver(true); }} onDragLeave={() => setOver(false)} onDrop={onDrop}
          className={`flex flex-col gap-2 rounded-xl border-2 border-dashed p-3 transition-colors ${over ? "border-crimson bg-cream" : "border-sand bg-ivory/60"}`}>
          <span className="text-[13px] font-normal text-muted">{over ? "Drop to add" : `Drag ${max > 1 ? "photos" : "a photo"} here, or choose:`}</span>
          <input ref={ref} type="file" name={name} accept="image/jpeg,image/png,image/webp,image/heic,image/heif" multiple={max > 1} required={required} onChange={onChange}
            className="text-[14px] font-normal file:mr-3 file:min-h-10 file:cursor-pointer file:rounded-full file:border file:border-sand file:bg-cream file:px-4 file:font-semibold file:text-crimson" />
        </span>
      </label>
      <span className="text-[12px] font-normal text-muted">{hint ?? (max > 1 ? `Up to ${max} photos.` : "One photo.")} {doc ? "Photos are shrunk automatically but kept sharp enough to read." : "Photos are shrunk automatically (about 300 KB each)."}</span>
      {busy && <span className="text-[12px] font-normal text-muted">Shrinking photo…</span>}
      {msg && <span className="text-[12px] font-normal text-wine">{msg}</span>}
      {items.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {items.map((it) => (
            <span key={it.url} className="flex flex-col items-center gap-0.5">
              <img src={it.url} alt="" className="size-20 rounded-lg object-cover" />
              <span className="text-[11px] font-normal text-muted">{it.kb} KB</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
