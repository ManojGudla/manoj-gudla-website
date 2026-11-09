export const ENQUIRY_CATEGORIES = ["career", "partnership", "brand", "project", "general"] as const;
export type FieldErrors = Partial<Record<"full_name" | "email" | "organisation" | "category" | "subject" | "message", string>>;
