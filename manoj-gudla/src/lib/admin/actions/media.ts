"use server";

import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { assertAdmin } from "@/lib/auth";
import { MEDIA_BUCKET, mediaPublicUrl } from "@/lib/media-url";
import { createSessionClient } from "@/lib/supabase/server";
import type { MediaAsset, MediaCategory } from "@/lib/types";
import { dbErrorMessage, refreshSite, type ActionState } from "./shared";

const CATEGORIES: MediaCategory[] = ["profile", "lifestyle", "project", "certificate", "thumbnail", "banner", "gallery", "document"];
const INCOMING_RE = /^[0-9a-f-]{36}\.[a-z0-9]{1,5}$/;
const UUID = /^[0-9a-f-]{36}$/i;
const MAX_IMAGE = 20 * 1024 * 1024;
const MAX_PDF = 10 * 1024 * 1024;

export interface MediaItem {
  id: string;
  url: string;
  file_name: string;
  alt_text: string;
  category: MediaCategory;
  mime_type: string;
  width: number | null;
  height: number | null;
  size_bytes: number;
  created_at: string;
}

function toItem(m: MediaAsset): MediaItem {
  return {
    id: m.id,
    url: mediaPublicUrl(m.storage_path),
    file_name: m.file_name,
    alt_text: m.alt_text,
    category: m.category,
    mime_type: m.mime_type,
    width: m.width,
    height: m.height,
    size_bytes: m.size_bytes,
    created_at: m.created_at,
  };
}

/** Identify the real file type from its first bytes — never trust the name or browser. */
function sniff(buf: Buffer): "jpeg" | "png" | "webp" | "avif" | "pdf" | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpeg";
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  if (buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") return "webp";
  if (buf.toString("ascii", 4, 8) === "ftyp" && /avi[fs]/.test(buf.toString("ascii", 8, 12))) return "avif";
  if (buf.toString("ascii", 0, 5) === "%PDF-") return "pdf";
  return null;
}

function cleanName(name: string): string {
  return name.replace(/[^\w.\- ()]/g, "").trim().slice(0, 200) || "file";
}

export async function listMedia(): Promise<MediaItem[]> {
  await assertAdmin();
  const db = await createSessionClient();
  const { data, error } = await db.from("media_assets").select("*").order("created_at", { ascending: false }).limit(500);
  if (error) throw new Error(dbErrorMessage(error));
  return (data as MediaAsset[]).map(toItem);
}

/**
 * Second half of an upload. The browser has already put the original file
 * in the private `incoming` bucket; here we verify it, strip metadata (such
 * as GPS location), resize and convert images to WebP, move it to the
 * public `media` bucket and record it. With `replaceId`, the existing asset
 * keeps its ID (so everything using it updates) and its old file is removed.
 */
export async function finalizeUpload(input: {
  incomingPath: string;
  fileName: string;
  category: string;
  alt: string;
  replaceId?: string;
}): Promise<{ ok: true; item: MediaItem } | { ok: false; message: string }> {
  const admin = await assertAdmin();
  const { incomingPath, replaceId } = input;
  const category = input.category as MediaCategory;
  if (!INCOMING_RE.test(incomingPath)) return { ok: false, message: "Invalid upload." };
  if (!CATEGORIES.includes(category)) return { ok: false, message: "Choose a category." };
  if (replaceId && !UUID.test(replaceId)) return { ok: false, message: "Invalid file to replace." };

  const db = await createSessionClient();
  const cleanupIncoming = () => db.storage.from("incoming").remove([incomingPath]);

  try {
    const { data: blob, error: dlErr } = await db.storage.from("incoming").download(incomingPath);
    if (dlErr || !blob) return { ok: false, message: "The upload could not be read. Try again." };
    const input0 = Buffer.from(await blob.arrayBuffer());

    const kind = sniff(input0);
    if (!kind) return { ok: false, message: "Only JPEG, PNG, WebP, AVIF images or PDF files are allowed. (iPhone HEIC photos: export as JPEG first.)" };

    let out: Buffer;
    let mime: string;
    let ext: string;
    let width: number | null = null;
    let height: number | null = null;

    if (kind === "pdf") {
      if (input0.length > MAX_PDF) return { ok: false, message: "PDFs must be 10 MB or smaller." };
      out = input0;
      mime = "application/pdf";
      ext = "pdf";
    } else {
      if (input0.length > MAX_IMAGE) return { ok: false, message: "Images must be 20 MB or smaller." };
      const maxSide = category === "banner" ? 2400 : category === "thumbnail" ? 1600 : 2400;
      const { data, info } = await sharp(input0, { limitInputPixels: 60_000_000, failOn: "error" })
        .rotate() // honour camera orientation, then metadata is dropped
        .resize({ width: maxSide, height: maxSide, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 82, effort: 4 })
        .toBuffer({ resolveWithObject: true });
      out = data;
      width = info.width;
      height = info.height;
      mime = "image/webp";
      ext = "webp";
    }

    const storagePath = `${category}/${randomUUID()}.${ext}`;
    const { error: upErr } = await db.storage.from(MEDIA_BUCKET).upload(storagePath, out, {
      contentType: mime,
      cacheControl: "31536000",
      upsert: false,
    });
    if (upErr) return { ok: false, message: "Saving the file failed. Try again." };

    const record = {
      storage_path: storagePath,
      file_name: cleanName(input.fileName),
      mime_type: mime,
      size_bytes: out.length,
      width,
      height,
      category,
      ...(input.alt.trim() ? { alt_text: input.alt.trim().slice(0, 300) } : {}),
    };

    if (replaceId) {
      const { data: old } = await db.from("media_assets").select("storage_path").eq("id", replaceId).single();
      const { data: row, error } = await db.from("media_assets").update(record).eq("id", replaceId).select("*").single();
      if (error || !row) {
        await db.storage.from(MEDIA_BUCKET).remove([storagePath]);
        return { ok: false, message: dbErrorMessage(error) };
      }
      if (old?.storage_path) await db.storage.from(MEDIA_BUCKET).remove([old.storage_path]);
      refreshSite();
      return { ok: true, item: toItem(row as MediaAsset) };
    }

    const { data: row, error } = await db
      .from("media_assets")
      .insert({ ...record, created_by: admin.userId })
      .select("*")
      .single();
    if (error || !row) {
      await db.storage.from(MEDIA_BUCKET).remove([storagePath]);
      return { ok: false, message: dbErrorMessage(error) };
    }
    refreshSite();
    return { ok: true, item: toItem(row as MediaAsset) };
  } catch (e) {
    console.error("finalizeUpload", e);
    return { ok: false, message: "That file couldn't be processed. It may be damaged — try exporting it again." };
  } finally {
    await cleanupIncoming();
  }
}

export async function updateMedia(_prev: ActionState, fd: FormData): Promise<ActionState> {
  await assertAdmin();
  const id = String(fd.get("id") ?? "");
  const alt = String(fd.get("alt_text") ?? "").trim();
  const category = String(fd.get("category") ?? "") as MediaCategory;
  if (!UUID.test(id)) return { ok: false, message: "Invalid file.", at: Date.now() };
  const errors: Record<string, string> = {};
  if (alt.length > 300) errors.alt_text = "Keep the description under 300 characters.";
  if (!CATEGORIES.includes(category)) errors.category = "Choose a category.";
  if (Object.keys(errors).length) return { ok: false, message: "Please fix the highlighted fields.", errors, at: Date.now() };
  const db = await createSessionClient();
  const { error } = await db.from("media_assets").update({ alt_text: alt, category }).eq("id", id);
  if (error) return { ok: false, message: dbErrorMessage(error), at: Date.now() };
  refreshSite();
  return { ok: true, message: "Saved.", at: Date.now() };
}

export async function deleteMedia(fd: FormData): Promise<void> {
  await assertAdmin();
  const id = String(fd.get("id") ?? "");
  if (!UUID.test(id)) throw new Error("Invalid request");
  const db = await createSessionClient();
  const { data: row } = await db.from("media_assets").select("storage_path").eq("id", id).single();
  const { error } = await db.from("media_assets").delete().eq("id", id);
  if (error) throw new Error(dbErrorMessage(error));
  if (row?.storage_path) await db.storage.from(MEDIA_BUCKET).remove([row.storage_path]);
  refreshSite();
}
