/**
 * Non-text testimonial data (name/initials/rating are proper nouns and a
 * number — they don't need translation). The quote and location text live
 * in src/lib/i18n/dictionaries.ts (testimonials.items), indexed by the same
 * position as this array, since those do need per-language copies.
 */
export type Testimonial = {
  name: string;
  initials: string;
  rating: number;
};

export const testimonials: Testimonial[] = [
  { name: "Elena Marchetti", initials: "EM", rating: 5 },
  { name: "Daniel Osei", initials: "DO", rating: 5 },
  { name: "Priya Nandakumar", initials: "PN", rating: 4 },
];
