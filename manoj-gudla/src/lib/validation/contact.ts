import { z } from "zod";
import { ENQUIRY_CATEGORIES } from "./categories";

export { ENQUIRY_CATEGORIES };
export type { FieldErrors } from "./categories";

const clean = (max: number) =>
  z
    .string()
    .transform((s) => s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim())
    .pipe(z.string().max(max, `Keep this under ${max} characters.`));

export const contactSchema = z.object({
  full_name: clean(120).pipe(z.string().min(2, "Please enter your name.")),
  email: clean(254).pipe(z.string().email("Please enter a valid email address.")),
  organisation: clean(160).optional().default(""),
  category: z.enum(ENQUIRY_CATEGORIES, { message: "Please choose what this is about." }),
  subject: clean(200).pipe(z.string().min(3, "Please add a short subject.")),
  message: clean(5000).pipe(z.string().min(20, "Please write at least 20 characters so I can help properly.")),
  // Spam protection
  website: z.string().max(200).optional().default(""), // honeypot: must stay empty
  started_at: z.number().int().positive(),
  turnstile_token: z.string().max(4096).optional().default(""),
});

export type ContactInput = z.input<typeof contactSchema>;
