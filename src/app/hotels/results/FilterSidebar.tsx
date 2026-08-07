"use client";

import { Star } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";

const RATING_OPTIONS = [5, 4, 3, 2, 1];

/** Splits sorted prices into `count` quantile buckets — equal-ish result counts per bucket, not equal price width, same idea as typical e-commerce price filters. */
function priceBuckets(
  sortedPrices: number[],
  count: number,
): { min: number; max: number }[] {
  if (sortedPrices.length === 0) return [];
  const overallMax = sortedPrices[sortedPrices.length - 1];
  const buckets: { min: number; max: number }[] = [];
  for (let i = 0; i < count; i++) {
    const lo = sortedPrices[Math.floor((i / count) * sortedPrices.length)];
    const hiIdx = Math.floor(((i + 1) / count) * sortedPrices.length) - 1;
    const hi = i === count - 1 ? overallMax : sortedPrices[Math.max(hiIdx, 0)];
    if (
      buckets.length > 0 &&
      buckets[buckets.length - 1].min === lo &&
      buckets[buckets.length - 1].max === hi
    ) {
      continue; // skip duplicate buckets when there aren't enough distinct prices
    }
    buckets.push({ min: lo, max: hi });
  }
  return buckets;
}

export function FilterSidebar({
  minRating,
  onRatingChange,
  priceBounds,
  priceRange,
  onPriceRangeChange,
  sortedPrices,
  onClear,
}: {
  minRating: number | null;
  onRatingChange: (rating: number | null) => void;
  priceBounds: [number, number] | null;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  sortedPrices: number[];
  onClear: () => void;
}) {
  const { t } = useLanguage();
  const hasActiveFilters =
    minRating !== null ||
    (priceBounds != null &&
      (priceRange[0] > priceBounds[0] || priceRange[1] < priceBounds[1]));

  const thumbClass =
    "pointer-events-none absolute inset-0 h-2 w-full appearance-none bg-transparent " +
    "[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-accent [&::-webkit-slider-thumb]:bg-paper [&::-webkit-slider-thumb]:shadow " +
    "[&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-accent [&::-moz-range-thumb]:bg-paper [&::-moz-range-thumb]:shadow";

  return (
    <aside className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-ink">
          {t.hotels.filterTitle}
        </h2>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-medium text-ink-faint underline decoration-dotted underline-offset-2 hover:text-ink-soft"
          >
            {t.hotels.clearFilters}
          </button>
        )}
      </div>

      <div>
        <h3 className="text-sm font-semibold text-ink">
          {t.hotels.filterRatingLabel}
        </h3>
        <div className="mt-3 space-y-1.5">
          {RATING_OPTIONS.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onRatingChange(minRating === n ? null : n)}
              className={`flex w-full items-center gap-1 rounded-lg px-2 py-1.5 text-left transition ${
                minRating === n ? "bg-accent-soft" : "hover:bg-paper-dim"
              }`}
            >
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    star <= n
                      ? "fill-amber-500 text-amber-500"
                      : "fill-transparent text-line"
                  }`}
                />
              ))}
              <span
                className={`ml-1.5 text-sm ${minRating === n ? "font-semibold text-accent-dark" : "text-ink-soft"}`}
              >
                {t.hotels.ratingAndUp(n)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {priceBounds && (
        <div>
          <h3 className="text-sm font-semibold text-ink">
            {t.hotels.priceFilterLabel}
          </h3>
          <p className="mt-2 text-sm text-ink-soft">
            ${priceRange[0].toLocaleString()} – $
            {priceRange[1].toLocaleString()}
            {priceRange[1] >= priceBounds[1] ? "+" : ""}
          </p>

          <div className="relative mt-4 h-2">
            <div className="absolute inset-0 rounded-full bg-line" />
            <div
              className="absolute h-full rounded-full bg-accent"
              style={{
                left: `${((priceRange[0] - priceBounds[0]) / (priceBounds[1] - priceBounds[0] || 1)) * 100}%`,
                right: `${100 - ((priceRange[1] - priceBounds[0]) / (priceBounds[1] - priceBounds[0] || 1)) * 100}%`,
              }}
            />
            <input
              type="range"
              min={priceBounds[0]}
              max={priceBounds[1]}
              value={priceRange[0]}
              onChange={(e) =>
                onPriceRangeChange([
                  Math.min(Number(e.target.value), priceRange[1]),
                  priceRange[1],
                ])
              }
              className={thumbClass}
            />
            <input
              type="range"
              min={priceBounds[0]}
              max={priceBounds[1]}
              value={priceRange[1]}
              onChange={(e) =>
                onPriceRangeChange([
                  priceRange[0],
                  Math.max(Number(e.target.value), priceRange[0]),
                ])
              }
              className={thumbClass}
            />
          </div>

          <div className="mt-4 space-y-1">
            {priceBuckets(sortedPrices, 4).map((bucket, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onPriceRangeChange([bucket.min, bucket.max])}
                className={`block w-full rounded-lg px-2 py-1.5 text-left text-sm transition ${
                  priceRange[0] === bucket.min && priceRange[1] === bucket.max
                    ? "bg-accent-soft font-semibold text-accent-dark"
                    : "text-ink-soft hover:bg-paper-dim"
                }`}
              >
                ${bucket.min.toLocaleString()} – ${bucket.max.toLocaleString()}
                {bucket.max >= priceBounds[1] ? "+" : ""}
              </button>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
