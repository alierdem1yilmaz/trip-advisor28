/**
 * Placeholder marketing content for the pre-launch landing page.
 * Stats and testimonials below are illustrative mockups (design placeholders),
 * not measured product data or real user quotes yet. Swap them for real
 * telemetry and real reviews before this page goes in front of real users.
 */

export const stats = [
  { value: "190+", label: "countries & territories mapped" },
  { value: "10M+", label: "attractions, eats & hidden gems indexed" },
  { value: "38%", label: "less backtracking than a hand-built plan" },
  { value: "4.9/5", label: "avg. rating from early access testers" },
];

export type Feature = {
  icon:
    | "route"
    | "cloud-sun"
    | "users"
    | "utensils"
    | "sparkles"
    | "leaf"
    | "wand"
    | "gauge";
  title: string;
  description: string;
};

export const features: Feature[] = [
  {
    icon: "wand",
    title: "Intelligent Trip Builder",
    description:
      "Tell it your dates, budget, pace, and interests. Get a full day-by-day itinerary in seconds, not hours of tab-switching.",
  },
  {
    icon: "route",
    title: "AI Route Optimization",
    description:
      "Every day is sequenced to cut dead travel time, respecting opening hours, meal windows, and your walking tolerance.",
  },
  {
    icon: "cloud-sun",
    title: "Dynamic Weather Planning",
    description:
      "Rain rolling in at 2pm? Outdoor stops swap for museums and covered markets automatically, no manual replanning.",
  },
  {
    icon: "gauge",
    title: "Crowd Prediction",
    description:
      "Know before you go: \"Visit before 9am to skip the queue\" beats finding out after you've waited an hour.",
  },
  {
    icon: "utensils",
    title: "Restaurant Intelligence",
    description:
      "Picks meals by distance, price, dietary needs, and wait time, not just star rating, so lunch fits the day instead of derailing it.",
  },
  {
    icon: "sparkles",
    title: "Explainable AI",
    description:
      "Every recommendation comes with a reason: why this spot, why this time, why this order. No black-box scheduling.",
  },
  {
    icon: "users",
    title: "Built for how you actually travel",
    description:
      "Solo, couple, family, or friend group, relaxed or intensive pace, VoyageAI adjusts the whole plan around you.",
  },
  {
    icon: "leaf",
    title: "Sustainability Mode",
    description:
      "Prefer walking, cycling, and transit routes with a lower footprint, and see the estimated carbon impact of your trip.",
  },
];

export const steps = [
  {
    title: "Tell us about your trip",
    description:
      "Destination, dates, budget, who's coming, and how you like to move through a city.",
  },
  {
    title: "Get an optimized itinerary",
    description:
      "VoyageAI builds a day-by-day plan, sequenced for minimal backtracking and maximum enjoyment.",
  },
  {
    title: "Adapt on the go",
    description:
      "Skip a stop, run late, or hit bad weather, the plan recalculates instantly instead of falling apart.",
  },
];

export type Testimonial = {
  name: string;
  location: string;
  initials: string;
  quote: string;
  rating: number;
};

export const testimonials: Testimonial[] = [
  {
    name: "Elena Marchetti",
    location: "Early access tester, Rome trip",
    initials: "EM",
    quote:
      "It rescheduled our whole afternoon around a rain forecast before I even noticed clouds rolling in. First planner that felt like it was actually paying attention.",
    rating: 5,
  },
  {
    name: "Daniel Osei",
    location: "Early access tester, Tokyo trip",
    initials: "DO",
    quote:
      "The crowd timing tips alone saved us two hours of queueing. Told us to hit the market at 8am instead of 11, and it was right.",
    rating: 5,
  },
  {
    name: "Priya Nandakumar",
    location: "Early access tester, Lisbon trip",
    initials: "PN",
    quote:
      "I liked that it explained *why* each stop was scheduled when it was. Made it easy to trust the plan instead of second-guessing every stop.",
    rating: 4,
  },
];
