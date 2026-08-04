# VoyageAI

> "Your smartest travel companion — from planning to exploring."

An AI-powered travel planner that turns maps, reviews, weather, and transit
data into one adaptive itinerary. See [`docs/Project Vision.pdf`](docs/Project%20Vision.pdf)
for the full product vision.

## Status

Pre-alpha. What exists right now is the **marketing landing page** only
(hero, stats, feature grid, how-it-works, testimonials, waitlist form).
There is no backend, no real trip builder, and no live data yet.

The stats and testimonials on the landing page (`src/data/marketing.ts`)
are **illustrative placeholders**, not measured data or real user quotes.
Replace them with real numbers/testimonials before this page is shown to
real users — it's just not true yet.

## Tech stack

- Next.js 16 (App Router) + React + TypeScript
- Tailwind CSS v4
- lucide-react for icons

## Getting started

```bash
npm install
npm run dev
```

Then open http://localhost:3000 (Next.js will pick another port if that
one's busy).

## Environment variables

Copy `.env.example` to `.env.local` and fill in keys as you build out real
features. Nothing is required for the landing page. See `.env.example` for
sign-up links and what each key unlocks; short version:

| Service | Free tier | Powers |
|---|---|---|
| [Gemini API](https://aistudio.google.com/apikey) | Free, no card | LLM reasoning — the live "Try VoyageAI" demo and default itinerary generation |
| [Anthropic API](https://console.anthropic.com) | Paid, pay-as-you-go | Optional upgrade path once quality/production needs outgrow Flash |
| [OpenTripMap](https://opentripmap.io/product) | Free (rate-limited) | Worldwide POI database: attractions, museums, hidden gems |
| [OpenRouteService](https://openrouteservice.org/dev/#/signup) | Free: 2,500 req/day, 40k/month | Route optimization, geocoding, isochrones |
| [Open-Meteo](https://open-meteo.com) | Free, **no key needed** | Weather-adaptive planning |
| [Nager.Date](https://date.nager.at) | Free, **no key needed** | Public holidays for crowd prediction |
| [Yelp Fusion](https://docs.developer.yelp.com/docs/fusion-intro) | Free (rate-limited) | Restaurant intelligence (optional, later) |
| [Ticketmaster Discovery](https://developer.ticketmaster.com) | Free | Local events awareness (optional, later) |

## Roadmap (suggested order)

1. **Landing page** — done (this commit).
2. **Trip Builder form → mock itinerary**: collect destination/dates/budget/
   interests, return a hand-crafted or lightly-templated itinerary. No real
   optimization yet, this is to validate the UX before investing in the AI
   layer.
3. **Real POI + weather data**: wire up OpenTripMap and Open-Meteo, replace
   mock itinerary data with real places for a small pilot set of cities
   (don't attempt "every city on Earth" yet).
4. **Route optimization**: a real (non-LLM) algorithm — nearest-neighbor
   or 2-opt TSP heuristic, or OR-Tools if complexity grows — sequences the
   day. Keep this deterministic; don't ask an LLM to solve routing.
5. **Explainable AI layer**: an LLM (Gemini Flash by default, free tier;
   swap in Anthropic for production quality) generates the natural-language
   "why" behind each scheduling decision, using the optimizer's output as
   structured input. This is where the LLM adds real value: reasoning and
   language, not math. A first version of this already ships as the "Try
   VoyageAI" demo on the landing page.
6. **Adaptive replanning**: recalculate remaining stops when the user
   skips something, weather changes, or they run behind schedule.
7. Everything else in the vision doc (crowd prediction, restaurant
   intelligence, sustainability mode, etc.) layers on top of steps 3–6.

### A few notes on scope

- "Every country, every city, every hidden gem" is a multi-year, well
  -funded endeavor. Pick 5–10 pilot cities with good open data coverage
  (major European/US cities tend to have the richest OpenStreetMap/
  OpenTripMap data) and prove the core loop works there before going wider.
- Treat "crowd prediction" and "energy planning" as rule-based heuristics
  at first (e.g. known peak hours, a fixed effort budget per day). Real
  ML models need historical usage data you don't have yet — that comes
  *after* you have users, not before.
- Keep the constraint-solving (routing, timing) as classic algorithms.
  Reserve the LLM for what LLMs are actually good at: interpreting
  preferences, generating explanations, and conversational replanning.
