// Convert a product name into a URL-safe slug:
//   "Blue Cotton T-Shirt!" → "blue-cotton-t-shirt"
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-') // non-alphanumerics → hyphen
    .replace(/^-+|-+$/g, ''); // trim leading/trailing hyphens
}
