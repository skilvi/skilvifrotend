import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility for merging Tailwind CSS classes with CLSX and Tailwind-Merge.
 * Prevents class conflicts and enables conditional styling.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Returns a high-quality initials avatar from DiceBear if no image is available.
 */
export function getAvatarUrl(name?: string | null, customUrl?: string | null) {
  if (customUrl) return customUrl;
  
  const seed = (name || 'User').trim() || 'User';
  // Dicebear 9.x initials style - clean, high-performance SVG
  return `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(seed)}&backgroundColor=2563eb,059669,7c3aed,db2777&chars=1`;
}
/**
 * Prepares a media URL for Next.js Image components or standard img tags.
 * Ensures relative paths start with a leading slash and handles S3 keys.
 */
export function getMediaUrl(src?: string | null, fallback = '/course-ph.jpg') {
  if (!src) return fallback;
  if (src.startsWith('http') || src.startsWith('blob:')) return src;
  
// Ensure leading slash for relative paths (required by next/image)
  return src.startsWith('/') ? src : `/${src}`;
}

/**
 * Formats a Date object into a readable string (e.g., "October 24, 2023").
 */
export function formatDate(date: Date | string | number): string {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}
