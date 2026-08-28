const STORAGE_PUBLIC_URL = import.meta.env.VITE_STORAGE_PUBLIC_URL ?? "http://localhost:9000";
const PACKS_PREFIX = `${STORAGE_PUBLIC_URL}/dotcard-cards/packs`;

// Static UI art (not tied to a catalog card entity) lives in its own
// "packs/" prefix in the same bucket as card images, uploaded directly —
// there's no admin CRUD/DB row for this the way there is for cards.
// Each collection gets its own cover, keyed by id ("packs/cover-<id>.jpg");
// "packs/cover.jpg" is the generic fallback for a collection that doesn't
// have one uploaded yet.
export const DEFAULT_PACK_COVER_URL = `${PACKS_PREFIX}/cover.jpg`;

export function getPackCoverUrl(collectionId: number | null): string {
  if (collectionId === null) return DEFAULT_PACK_COVER_URL;
  return `${PACKS_PREFIX}/cover-${collectionId}.jpg`;
}
