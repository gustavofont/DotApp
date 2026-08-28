const STORAGE_PUBLIC_URL = import.meta.env.VITE_STORAGE_PUBLIC_URL ?? "http://localhost:9000";

// Static UI art (not tied to a catalog card entity) lives in its own
// "packs/" prefix in the same bucket as card images, uploaded directly —
// there's no admin CRUD/DB row for this the way there is for cards.
export const PACK_COVER_URL = `${STORAGE_PUBLIC_URL}/dotcard-cards/packs/cover.jpg`;
