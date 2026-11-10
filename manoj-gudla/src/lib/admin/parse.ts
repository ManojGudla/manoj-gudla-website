import type { Field } from "./collections";

export type FormErrors = Record<string, string>;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Removes control characters (except newlines/tabs) and trims. */
export function cleanText(v: FormDataEntryValue | null): string {
  return String(v ?? "")
    .replace(/\r\n?/g, "\n")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim();
}

export function isHttpsUrl(v: string): boolean {
  try {
    const u = new URL(v);
    return u.protocol === "https:" && !!u.hostname && v.length <= 500;
  } catch {
    return false;
  }
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/**
 * Server-side validation of an admin form against its field config.
 * The database repeats the important checks as constraints.
 */
export function parseFields(fields: Field[], fd: FormData): { data: Record<string, unknown>; errors: FormErrors } {
  const data: Record<string, unknown> = {};
  const errors: FormErrors = {};

  for (const f of fields) {
    const raw = fd.get(f.name);
    switch (f.type) {
      case "text":
      case "textarea": {
        const v = cleanText(raw);
        if (f.required && !v) errors[f.name] = `${f.label} is required.`;
        else if (v.length > f.max) errors[f.name] = `Keep this under ${f.max} characters (now ${v.length}).`;
        data[f.name] = v;
        break;
      }
      case "url": {
        const v = cleanText(raw);
        if (f.required && !v) errors[f.name] = `${f.label} is required.`;
        else if (v && !isHttpsUrl(v)) errors[f.name] = "Enter a full link starting with https://";
        data[f.name] = v;
        break;
      }
      case "slug": {
        const v = cleanText(raw).toLowerCase();
        if (!v) errors[f.name] = "A web address is required.";
        else if (!SLUG.test(v) || v.length > 80) errors[f.name] = "Use lowercase letters, numbers and single hyphens only.";
        data[f.name] = v;
        break;
      }
      case "number": {
        const v = cleanText(raw).replace(/[,\s]/g, "");
        if (!v) {
          if (f.required) errors[f.name] = `${f.label} is required.`;
          data[f.name] = 0;
        } else if (!/^\d{1,15}$/.test(v)) {
          errors[f.name] = "Enter a whole number, e.g. 10000.";
        } else {
          data[f.name] = Number(v);
        }
        break;
      }
      case "date": {
        const v = cleanText(raw);
        if (!v) {
          if (f.required) errors[f.name] = `${f.label} is required.`;
          data[f.name] = null;
        } else if (!DATE.test(v) || Number.isNaN(Date.parse(v))) {
          errors[f.name] = "Choose a valid date.";
        } else {
          data[f.name] = v;
        }
        break;
      }
      case "boolean":
        data[f.name] = raw === "on" || raw === "true";
        break;
      case "select": {
        const v = cleanText(raw);
        if (!v && f.nullable) {
          data[f.name] = null;
        } else if (!f.options.some((o) => o.value === v)) {
          errors[f.name] = "Choose one of the options.";
        } else {
          data[f.name] = v;
        }
        break;
      }
      case "list": {
        const items = cleanText(raw)
          .split("\n")
          .map((s) => s.trim().replace(/^[-•*]\s*/, ""))
          .filter(Boolean);
        if (items.length > f.maxItems) errors[f.name] = `Up to ${f.maxItems} lines.`;
        else if (items.some((i) => i.length > f.itemMax)) errors[f.name] = `Each line must be under ${f.itemMax} characters.`;
        data[f.name] = items;
        break;
      }
      case "relation": {
        // Converted to "select" by resolveRelations() before validation; treat stray values as unset.
        const v = cleanText(raw);
        data[f.name] = v && UUID.test(v) ? v : null;
        break;
      }
      case "media": {
        const v = cleanText(raw);
        if (!v) {
          if (f.required) errors[f.name] = `Choose or upload ${f.label.toLowerCase()}.`;
          data[f.name] = null;
        } else if (!UUID.test(v)) {
          errors[f.name] = "Invalid media selection.";
        } else {
          data[f.name] = v;
        }
        break;
      }
    }
  }
  return { data, errors };
}
