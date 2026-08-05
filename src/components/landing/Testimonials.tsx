"use client";

import { Star } from "lucide-react";
import { testimonials } from "@/data/marketing";
import { Reveal } from "./Reveal";
import { useLanguage } from "@/lib/i18n/language-context";

export function Testimonials() {
  const { t } = useLanguage();

  return (
    <section id="reviews" className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
      <Reveal className="mx-auto max-w-2xl text-center">
        <h2 className="font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
          {t.testimonials.title}
        </h2>
        <p className="mt-4 text-lg text-ink-soft">
          {t.testimonials.subtitle}
        </p>
      </Reveal>

      <div className="mt-14 grid gap-6 sm:grid-cols-3">
        {testimonials.map((testimonial, index) => {
          const localized = t.testimonials.items[index];
          return (
            <Reveal
              key={testimonial.name}
              delay={index * 0.1}
              className={`flex h-full flex-col rounded-2xl border border-line bg-paper p-6 ${
                index === 1 ? "sm:-translate-y-4" : ""
              }`}
            >
              <figure className="flex h-full flex-col">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < testimonial.rating
                          ? "fill-gold text-gold"
                          : "fill-line text-line"
                      }`}
                    />
                  ))}
                </div>
                <blockquote className="mt-4 grow text-sm text-ink-soft">
                  &ldquo;{localized.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-sm font-semibold text-paper">
                    {testimonial.initials}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-ink">
                      {testimonial.name}
                    </p>
                    <p className="text-xs text-ink-faint">
                      {localized.location}
                    </p>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
