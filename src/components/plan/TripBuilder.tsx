"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Bus,
  CalendarDays,
  Car,
  Check,
  CircleCheck,
  Cloud,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  Compass,
  Footprints,
  Gauge,
  Home,
  Loader2,
  MapPin,
  RotateCcw,
  Sparkles,
  Star,
  Sun,
  TriangleAlert,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/lib/i18n/language-context";
import {
  COMPANION_OPTIONS,
  INTEREST_OPTIONS,
  PACE_OPTIONS,
  TRANSPORT_OPTIONS,
} from "@/lib/trip-options";
import {
  addDaysIso,
  diffInDaysIso,
  todayIso,
  DATE_LOCALE,
  MAX_TRIP_LENGTH_DAYS,
  WEATHER_FORECAST_HORIZON_DAYS,
} from "@/lib/dates";

type Stop = {
  time: string;
  title: string;
  description: string;
  reason: string;
  estimatedRating?: number;
  lat?: number;
  lon?: number;
};

type Weather = {
  tempMaxC: number;
  tempMinC: number;
  condition: "clear" | "cloudy" | "fog" | "rain" | "snow" | "storm";
  label: string;
};

type Day = {
  day: number;
  date?: string;
  theme: string;
  stops: Stop[];
  weather?: Weather;
};

type Plan = {
  destination: string;
  center?: { lat: number; lon: number };
  days: Day[];
  groundedPlaceCount?: number;
};

const STEPS = [
  "destination",
  "accommodation",
  "dates",
  "companions",
  "transport",
  "pace",
  "interests",
] as const;
type StepKey = (typeof STEPS)[number];

const STEP_ICON: Record<StepKey, LucideIcon> = {
  destination: MapPin,
  accommodation: Home,
  dates: CalendarDays,
  companions: Users,
  transport: Compass,
  pace: Gauge,
  interests: Sparkles,
};

const StopMap = dynamic(() => import("./StopMap").then((m) => m.StopMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-paper-dim text-sm text-ink-faint">
      <Loader2 className="h-5 w-5 animate-spin" />
    </div>
  ),
});

const WEATHER_ICON: Record<Weather["condition"], LucideIcon> = {
  clear: Sun,
  cloudy: Cloud,
  fog: CloudFog,
  rain: CloudRain,
  snow: CloudSnow,
  storm: CloudLightning,
};

const TRANSPORT_ICON: Record<(typeof TRANSPORT_OPTIONS)[number]["value"], LucideIcon> = {
  walking: Footprints,
  transit: Bus,
  car: Car,
};

type PlaceCheckStatus = "idle" | "checking" | "ok" | "fuzzy" | "notfound";

/**
 * Debounced live validation against the same OpenTripMap toponym lookup
 * /api/plan itself relies on for grounding and weather — catches a typo
 * before it silently produces a plan with no real places or forecast,
 * instead of only surfacing the problem after the full generation call.
 */
function usePlaceCheck(query: string) {
  const [status, setStatus] = useState<PlaceCheckStatus>("idle");
  const [resolvedName, setResolvedName] = useState("");

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setStatus("idle");
      setResolvedName("");
      return;
    }
    setStatus("checking");
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
        });
        const data = await res.json();
        if (!data.found) {
          setStatus("notfound");
          setResolvedName("");
        } else {
          setStatus(data.partialMatch ? "fuzzy" : "ok");
          setResolvedName(data.country ? `${data.name}, ${data.country}` : data.name);
        }
      } catch {
        if (!controller.signal.aborted) setStatus("idle");
      }
    }, 500);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  return { status, resolvedName };
}

function PlaceStatusRow({
  status,
  resolvedName,
  override,
  onContinueAnyway,
  t,
}: {
  status: PlaceCheckStatus;
  resolvedName: string;
  override: boolean;
  onContinueAnyway: () => void;
  t: ReturnType<typeof useLanguage>["t"];
}) {
  if (status === "idle") return null;
  return (
    <div className="mt-3 text-sm">
      {status === "checking" && (
        <span className="inline-flex items-center gap-1.5 text-ink-faint">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          {t.wizard.checkingPlace}
        </span>
      )}
      {status === "ok" && (
        <span className="inline-flex items-center gap-1.5 text-emerald-600">
          <CircleCheck className="h-3.5 w-3.5" />
          {t.wizard.placeFound(resolvedName)}
        </span>
      )}
      {status === "fuzzy" && (
        <span className="inline-flex items-center gap-1.5 text-amber-600">
          <TriangleAlert className="h-3.5 w-3.5" />
          {t.wizard.placeFuzzy(resolvedName)}
        </span>
      )}
      {status === "notfound" && (
        <span className="inline-flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-red-600">
            <TriangleAlert className="h-3.5 w-3.5" />
            {t.wizard.placeNotFound}
          </span>
          {override ? (
            <span className="text-xs text-ink-faint">{t.wizard.placeNotFoundOverridden}</span>
          ) : (
            <button
              type="button"
              onClick={onContinueAnyway}
              className="text-xs text-ink-faint underline decoration-dotted underline-offset-2 hover:text-ink-soft"
            >
              {t.wizard.continueAnyway}
            </button>
          )}
        </span>
      )}
    </div>
  );
}

type CurrentUser = {
  plan: "standard" | "pro";
  dayTokens: number;
  tokensResetAt: string;
};

export function TripBuilder({ user }: { user: CurrentUser | null }) {
  const { t, language } = useLanguage();
  const today = useMemo(() => todayIso(), []);
  const forecastLimit = useMemo(
    () => addDaysIso(today, WEATHER_FORECAST_HORIZON_DAYS),
    [today],
  );

  const [stepIndex, setStepIndex] = useState(0);
  const [destination, setDestination] = useState("");
  const [accommodation, setAccommodation] = useState("");
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(addDaysIso(today, 2));
  const [pace, setPace] = useState<(typeof PACE_OPTIONS)[number]["value"]>("balanced");
  const [companions, setCompanions] =
    useState<(typeof COMPANION_OPTIONS)[number]["value"]>("solo");
  const [transport, setTransport] =
    useState<(typeof TRANSPORT_OPTIONS)[number]["value"]>("walking");
  const [interests, setInterests] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error" | "no-tokens">("idle");
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [tokensLeft, setTokensLeft] = useState(user?.dayTokens ?? 0);
  const [noTokensResetAt, setNoTokensResetAt] = useState<string | null>(null);
  const [activeDay, setActiveDay] = useState(1);
  const [destinationOverride, setDestinationOverride] = useState(false);
  const [accommodationOverride, setAccommodationOverride] = useState(false);

  const destinationCheck = usePlaceCheck(destination);
  const accommodationQuery = accommodation.trim()
    ? `${accommodation.trim()}, ${destination.trim()}`
    : "";
  const accommodationCheck = usePlaceCheck(accommodationQuery);

  const days = Math.max(diffInDaysIso(startDate, endDate) + 1, 1);
  const endMax = addDaysIso(startDate, Math.min(MAX_TRIP_LENGTH_DAYS - 1, WEATHER_FORECAST_HORIZON_DAYS));

  const stepKey: StepKey = STEPS[stepIndex];
  const isLastStep = stepIndex === STEPS.length - 1;
  const destinationBlocked = destinationCheck.status === "notfound" && !destinationOverride;
  const accommodationBlocked =
    accommodation.trim().length > 0 &&
    accommodationCheck.status === "notfound" &&
    !accommodationOverride;
  const canAdvance =
    (stepKey !== "destination" || (destination.trim().length > 0 && !destinationBlocked)) &&
    (stepKey !== "accommodation" || !accommodationBlocked);

  function handleStartChange(value: string) {
    setStartDate(value);
    // Keep the range valid: end date can't be before the new start, or push
    // the trip past the 7-day / 16-day-forecast caps.
    const maxEnd = addDaysIso(value, Math.min(MAX_TRIP_LENGTH_DAYS - 1, WEATHER_FORECAST_HORIZON_DAYS));
    if (endDate < value) setEndDate(value);
    else if (endDate > maxEnd) setEndDate(maxEnd);
  }

  function toggleInterest(interest: string) {
    setInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest],
    );
  }

  function goNext() {
    if (!canAdvance) return;
    if (isLastStep) {
      void handleSubmit();
    } else {
      setStepIndex((i) => i + 1);
    }
  }

  function goBack() {
    setStepIndex((i) => Math.max(i - 1, 0));
  }

  async function handleSubmit() {
    setStatus("loading");
    setError(null);
    setPlan(null);

    try {
      const res = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination,
          accommodation,
          startDate,
          endDate,
          pace,
          interests,
          companions,
          transport,
          language,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data?.code === "SIGN_IN_REQUIRED") {
          window.location.href = "/auth/login";
          return;
        }
        if (data?.code === "OUT_OF_TOKENS") {
          setNoTokensResetAt(data.resetsAt ?? null);
          setStatus("no-tokens");
          return;
        }
        throw new Error(data?.error ?? "Something went wrong.");
      }
      setPlan(data);
      setActiveDay(1);
      if (typeof data.tokensRemaining === "number") setTokensLeft(data.tokensRemaining);
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  }

  function reset() {
    setPlan(null);
    setStatus("idle");
    setError(null);
    setNoTokensResetAt(null);
    setStepIndex(0);
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-paper">
        <header className="border-b border-line">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
            <Link href="/" className="flex items-center gap-2 font-semibold text-ink">
              <Logo size={32} />
              VoyageAI
            </Link>
            <LanguageSwitcher />
          </div>
        </header>
        <div className="mx-auto flex min-h-[calc(100vh-73px)] max-w-md flex-col justify-center px-6 py-16 text-center">
          <h1 className="font-display text-4xl font-semibold tracking-tight text-ink">
            {t.wizard.signInTitle}
          </h1>
          <p className="mt-3 text-lg text-ink-soft">{t.wizard.signInSubtitle}</p>
          <a
            href="/auth/login"
            className="mx-auto mt-9 inline-flex items-center gap-2 rounded-lg bg-ink px-6 py-3.5 text-base font-semibold text-paper transition hover:bg-accent"
          >
            {t.wizard.signInCta}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <Link href="/" className="flex items-center gap-2 font-semibold text-ink">
            <Logo size={32} />
            VoyageAI
          </Link>
          <div className="flex items-center gap-4">
            {plan && status === "done" && (
              <button
                onClick={reset}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft transition hover:text-ink"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                {t.results.planAnother}
              </button>
            )}
            <Link
              href="/account"
              className="hidden text-sm font-medium text-ink-soft transition hover:text-ink sm:inline"
            >
              {user.plan === "pro" ? t.wizard.unlimitedTokens : t.wizard.tokensLeft(tokensLeft)}
            </Link>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {status === "no-tokens" ? (
          <motion.section
            key="no-tokens"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mx-auto flex max-w-md flex-col items-center px-6 py-32 text-center sm:py-40"
          >
            <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">
              {t.wizard.noTokensTitle}
            </h1>
            <p className="mt-3 text-ink-soft">
              {t.wizard.noTokensSubtitle(
                noTokensResetAt
                  ? new Intl.DateTimeFormat(DATE_LOCALE[language] ?? "en-US", {
                      month: "long",
                      day: "numeric",
                    }).format(new Date(noTokensResetAt))
                  : "",
              )}
            </p>
            <Link
              href="/pricing"
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3.5 text-base font-semibold text-paper transition hover:bg-accent-dark"
            >
              {t.wizard.upgradeCta}
            </Link>
            <button
              type="button"
              onClick={reset}
              className="mt-4 text-sm font-medium text-ink-soft hover:text-ink"
            >
              {t.wizard.back}
            </button>
          </motion.section>
        ) : status === "loading" ? (
          <motion.section
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mx-auto flex max-w-2xl flex-col items-center px-6 py-32 text-center sm:py-40"
          >
            <Loader2 className="h-10 w-10 animate-spin text-accent" />
            <h1 className="mt-6 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              {t.loading.title}
            </h1>
            <p className="mt-3 text-ink-soft">{t.loading.subtitle(destination)}</p>
          </motion.section>
        ) : status === "done" && plan ? (
          <motion.section
            key="results"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-6xl px-6 py-16"
          >
            <div className="text-center">
              <p className="text-sm font-medium text-accent">
                {t.results.dayTrip(plan.days.length)}
              </p>
              <h1 className="mt-1 text-4xl font-bold tracking-tight text-ink sm:text-5xl">
                {plan.destination}
              </h1>
              {!!plan.groundedPlaceCount && plan.groundedPlaceCount > 0 && (
                <p className="mt-3 text-sm text-ink-faint">
                  {t.results.groundedIn(plan.groundedPlaceCount)}
                </p>
              )}
            </div>

            <div className="mt-10 flex justify-center gap-2 overflow-x-auto pb-2">
              {plan.days.map((d) => {
                const WeatherIcon = d.weather ? WEATHER_ICON[d.weather.condition] : null;
                return (
                  <button
                    key={d.day}
                    onClick={() => setActiveDay(d.day)}
                    className={`shrink-0 rounded-2xl border px-5 py-2 text-center text-sm font-semibold transition ${
                      activeDay === d.day
                        ? "border-ink bg-ink text-paper"
                        : "border-line text-ink-soft hover:border-ink/20"
                    }`}
                  >
                    <span className="block">{t.results.day(d.day)}</span>
                    {d.date && (
                      <span
                        className={`block text-xs font-normal ${
                          activeDay === d.day ? "text-paper/60" : "text-ink-faint"
                        }`}
                      >
                        {d.date}
                      </span>
                    )}
                    {d.weather && WeatherIcon && (
                      <span
                        className={`mt-1 flex items-center justify-center gap-1 text-xs font-normal ${
                          activeDay === d.day ? "text-paper/60" : "text-ink-faint"
                        }`}
                      >
                        <WeatherIcon className="h-3 w-3" />
                        {d.weather.tempMaxC}°C
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <AnimatePresence mode="wait">
              {plan.days
                .filter((d) => d.day === activeDay)
                .map((d) => {
                  const stopsWithCoords = d.stops.filter(
                    (s): s is Stop & { lat: number; lon: number } => s.lat != null && s.lon != null,
                  );
                  const mapCenter =
                    plan.center ??
                    (stopsWithCoords.length > 0
                      ? { lat: stopsWithCoords[0].lat, lon: stopsWithCoords[0].lon }
                      : null);

                  return (
                    <motion.div
                      key={d.day}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mx-auto mt-10"
                    >
                      <h2 className="text-center text-xl font-semibold text-ink">
                        {d.theme}
                      </h2>
                      {(d.date || d.weather) && (
                        <p className="mt-1 flex items-center justify-center gap-2 text-center text-sm text-ink-faint">
                          {d.date}
                          {d.date && d.weather && <span>&middot;</span>}
                          {d.weather &&
                            (() => {
                              const WeatherIcon = WEATHER_ICON[d.weather.condition];
                              return (
                                <span className="inline-flex items-center gap-1">
                                  <WeatherIcon className="h-3.5 w-3.5" />
                                  {d.weather.label}, {d.weather.tempMinC}–{d.weather.tempMaxC}°C
                                </span>
                              );
                            })()}
                        </p>
                      )}

                      <div className="mt-8 grid gap-6 lg:grid-cols-2">
                        <div className="h-[420px] overflow-hidden rounded-2xl border border-line lg:sticky lg:top-6 lg:h-[calc(100vh-8rem)] lg:max-h-[640px]">
                          {mapCenter ? (
                            <StopMap stops={d.stops} center={mapCenter} />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-paper-dim px-6 text-center text-sm text-ink-faint">
                              <MapPin className="mr-2 h-4 w-4" />
                              Map unavailable for this trip
                            </div>
                          )}
                        </div>

                        <ul className="space-y-6">
                          {d.stops.map((stop, i) => (
                            <motion.li
                              key={`${stop.title}-${i}`}
                              initial={{ opacity: 0, x: -12 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.08 }}
                              className="flex gap-3 rounded-2xl border border-line bg-paper-dim p-5"
                            >
                              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-white">
                                {i + 1}
                              </span>
                              <div className="min-w-0">
                                <p className="text-xs font-medium tracking-wide text-ink-faint uppercase">
                                  {stop.time}
                                </p>
                                <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                                  <p className="text-lg font-semibold text-ink">
                                    {stop.title}
                                  </p>
                                  {stop.estimatedRating != null && (
                                    <span
                                      title={t.results.aiEstimate}
                                      className="inline-flex items-center gap-1 text-xs font-medium text-amber-600"
                                    >
                                      <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                                      {stop.estimatedRating.toFixed(1)}
                                      <span className="text-ink-faint">({t.results.aiEstimate})</span>
                                    </span>
                                  )}
                                </div>
                                <p className="mt-1.5 text-sm text-ink-soft">
                                  {stop.description}
                                </p>
                                <p className="mt-2 text-xs text-accent-dark italic">
                                  {t.results.why}: {stop.reason}
                                </p>
                              </div>
                            </motion.li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  );
                })}
            </AnimatePresence>
          </motion.section>
        ) : (
          <motion.section
            key="wizard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mx-auto flex min-h-[calc(100vh-73px)] max-w-2xl flex-col justify-center px-6 py-16"
          >
            <div className="mb-10">
              <div className="flex items-center justify-center">
                {STEPS.map((s, i) => {
                  const Icon = STEP_ICON[s];
                  const isCurrent = i === stepIndex;
                  const isDone = i < stepIndex;
                  const canJump = i <= stepIndex;
                  return (
                    <div key={s} className="flex items-center">
                      <button
                        type="button"
                        onClick={() => canJump && setStepIndex(i)}
                        disabled={!canJump}
                        aria-label={s}
                        aria-current={isCurrent ? "step" : undefined}
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition sm:h-10 sm:w-10 ${
                          isCurrent
                            ? "border-accent bg-accent text-white shadow-sm shadow-accent-soft"
                            : isDone
                              ? "cursor-pointer border-accent bg-accent-soft text-accent hover:bg-accent-soft"
                              : "cursor-not-allowed border-line bg-paper-dim text-ink-faint"
                        }`}
                      >
                        {isDone ? (
                          <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        ) : (
                          <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        )}
                      </button>
                      {i < STEPS.length - 1 && (
                        <div
                          className={`h-0.5 w-2.5 shrink-0 transition-colors sm:w-6 ${
                            i < stepIndex ? "bg-accent" : "bg-paper-dim"
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="mt-3 text-center text-sm font-medium text-ink-faint">
                {t.wizard.stepsLeft(STEPS.length - stepIndex - 1)}
              </p>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={stepKey}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              >
                {stepKey === "destination" && (
                  <div>
                    <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">
                      {t.wizard.destinationTitle}
                    </h1>
                    <p className="mt-3 text-lg text-ink-soft">{t.wizard.destinationSubtitle}</p>
                    <div className="relative mt-10">
                      <MapPin className="pointer-events-none absolute top-1/2 left-5 h-5 w-5 -translate-y-1/2 text-ink-faint" />
                      <input
                        autoFocus
                        value={destination}
                        onChange={(e) => {
                          setDestination(e.target.value);
                          setDestinationOverride(false);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            goNext();
                          }
                        }}
                        placeholder={t.wizard.destinationPlaceholder}
                        maxLength={60}
                        className="w-full rounded-2xl border border-line bg-paper-dim py-4 pr-5 pl-12 text-lg text-ink placeholder:text-ink-faint focus:border-accent focus:bg-paper focus:outline-none"
                      />
                    </div>
                    <PlaceStatusRow
                      status={destinationCheck.status}
                      resolvedName={destinationCheck.resolvedName}
                      override={destinationOverride}
                      onContinueAnyway={() => setDestinationOverride(true)}
                      t={t}
                    />
                  </div>
                )}

                {stepKey === "accommodation" && (
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">
                        {t.wizard.accommodationTitle}
                      </h1>
                      <span className="rounded-full bg-paper-dim px-2.5 py-1 text-xs font-medium text-ink-soft">
                        {t.wizard.optional}
                      </span>
                    </div>
                    <p className="mt-3 text-lg text-ink-soft">{t.wizard.accommodationSubtitle}</p>
                    <div className="relative mt-10">
                      <Home className="pointer-events-none absolute top-1/2 left-5 h-5 w-5 -translate-y-1/2 text-ink-faint" />
                      <input
                        autoFocus
                        value={accommodation}
                        onChange={(e) => {
                          setAccommodation(e.target.value);
                          setAccommodationOverride(false);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            goNext();
                          }
                        }}
                        placeholder={t.wizard.accommodationPlaceholder}
                        maxLength={60}
                        className="w-full rounded-2xl border border-line bg-paper-dim py-4 pr-5 pl-12 text-lg text-ink placeholder:text-ink-faint focus:border-accent focus:bg-paper focus:outline-none"
                      />
                    </div>
                    {accommodation.trim().length > 0 && (
                      <PlaceStatusRow
                        status={accommodationCheck.status}
                        resolvedName={accommodationCheck.resolvedName}
                        override={accommodationOverride}
                        onContinueAnyway={() => setAccommodationOverride(true)}
                        t={t}
                      />
                    )}
                  </div>
                )}

                {stepKey === "dates" && (
                  <div>
                    <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">
                      {t.wizard.datesTitle}
                    </h1>
                    <p className="mt-3 text-lg text-ink-soft">
                      {t.wizard.datesSubtitle(WEATHER_FORECAST_HORIZON_DAYS)}
                    </p>
                    <div className="mt-10 grid grid-cols-2 gap-4">
                      <label className="block">
                        <span className="mb-2 block text-sm text-ink-soft">
                          {t.wizard.startLabel}
                        </span>
                        <input
                          type="date"
                          value={startDate}
                          min={today}
                          max={forecastLimit}
                          onChange={(e) => handleStartChange(e.target.value)}
                          className="w-full rounded-xl border border-line bg-paper-dim px-4 py-3 text-base text-ink focus:border-accent focus:bg-paper focus:outline-none"
                        />
                      </label>
                      <label className="block">
                        <span className="mb-2 block text-sm text-ink-soft">
                          {t.wizard.endLabel}
                        </span>
                        <input
                          type="date"
                          value={endDate}
                          min={startDate}
                          max={endMax}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-full rounded-xl border border-line bg-paper-dim px-4 py-3 text-base text-ink focus:border-accent focus:bg-paper focus:outline-none"
                        />
                      </label>
                    </div>
                    <p className="mt-4 text-sm font-medium text-accent">
                      {t.wizard.daysInDestination(days, destination)}
                    </p>
                  </div>
                )}

                {stepKey === "companions" && (
                  <div>
                    <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">
                      {t.wizard.companionsTitle}
                    </h1>
                    <p className="mt-3 text-lg text-ink-soft">{t.wizard.companionsSubtitle}</p>
                    <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {COMPANION_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setCompanions(option.value)}
                          className={`rounded-xl border px-4 py-4 text-base font-medium transition ${
                            companions === option.value
                              ? "border-accent bg-accent-soft text-accent-dark"
                              : "border-line text-ink-soft hover:border-ink/20"
                          }`}
                        >
                          {t.options.companions[option.value]}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {stepKey === "transport" && (
                  <div>
                    <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">
                      {t.wizard.transportTitle}
                    </h1>
                    <p className="mt-3 text-lg text-ink-soft">{t.wizard.transportSubtitle}</p>
                    <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-3">
                      {TRANSPORT_OPTIONS.map((option) => {
                        const Icon = TRANSPORT_ICON[option.value];
                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setTransport(option.value)}
                            className={`flex flex-col items-center gap-2 rounded-xl border px-4 py-6 text-base font-medium transition ${
                              transport === option.value
                                ? "border-accent bg-accent-soft text-accent-dark"
                                : "border-line text-ink-soft hover:border-ink/20"
                            }`}
                          >
                            <Icon className="h-6 w-6" />
                            {t.options.transport[option.value]}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {stepKey === "pace" && (
                  <div>
                    <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">
                      {t.wizard.paceTitle}
                    </h1>
                    <p className="mt-3 text-lg text-ink-soft">{t.wizard.paceSubtitle}</p>
                    <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                      {PACE_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setPace(option.value)}
                          className={`flex-1 rounded-xl border px-4 py-4 text-base font-medium transition ${
                            pace === option.value
                              ? "border-accent bg-accent-soft text-accent-dark"
                              : "border-line text-ink-soft hover:border-ink/20"
                          }`}
                        >
                          {t.options.pace[option.value]}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {stepKey === "interests" && (
                  <div>
                    <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">
                      {t.wizard.interestsTitle}
                    </h1>
                    <p className="mt-3 text-lg text-ink-soft">{t.wizard.interestsSubtitle}</p>
                    <div className="mt-10 flex flex-wrap gap-2.5">
                      {INTEREST_OPTIONS.map((interest) => (
                        <button
                          key={interest}
                          type="button"
                          onClick={() => toggleInterest(interest)}
                          className={`rounded-full border px-5 py-2.5 text-base transition ${
                            interests.includes(interest)
                              ? "border-accent bg-accent-soft text-accent-dark"
                              : "border-line text-ink-soft hover:border-ink/20"
                          }`}
                        >
                          {t.options.interests[interest as keyof typeof t.options.interests]}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {status === "error" && error && (
                  <p className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-center text-sm text-amber-800">
                    {error}
                  </p>
                )}

                <div className="mt-12 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={goBack}
                    disabled={stepIndex === 0}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft transition hover:text-ink disabled:cursor-not-allowed disabled:opacity-0"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    {t.wizard.back}
                  </button>

                  <button
                    type="button"
                    onClick={goNext}
                    disabled={!canAdvance}
                    className="inline-flex items-center gap-2 rounded-lg bg-ink px-6 py-3.5 text-base font-semibold text-white transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isLastStep ? t.wizard.buildTrip : t.wizard.next}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
