export const PACE_OPTIONS = [
  { value: "relaxed", label: "Relaxed" },
  { value: "balanced", label: "Balanced" },
  { value: "intensive", label: "Intensive" },
] as const;

export const INTEREST_OPTIONS = [
  "Food",
  "History",
  "Art",
  "Nature",
  "Nightlife",
  "Shopping",
];

export const COMPANION_OPTIONS = [
  { value: "solo", label: "Solo" },
  { value: "couple", label: "Couple" },
  { value: "family", label: "Family" },
  { value: "friends", label: "Friends" },
] as const;

export const TRANSPORT_OPTIONS = [
  { value: "walking", label: "Walking" },
  { value: "transit", label: "Public transit" },
  { value: "car", label: "Car" },
] as const;

export const SEASON_OPTIONS = [
  { value: "summer", label: "Summer" },
  { value: "autumn", label: "Autumn" },
  { value: "winter", label: "Winter" },
  { value: "spring", label: "Spring" },
] as const;
