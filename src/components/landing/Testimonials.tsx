import { Star } from "lucide-react";
import { testimonials } from "@/data/marketing";
import { Reveal } from "./Reveal";

export function Testimonials() {
  return (
    <section id="reviews" className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
      <Reveal className="mx-auto max-w-2xl text-center">
        <h2 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl dark:text-white">
          What early access testers are saying
        </h2>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
          A first look from the small group of travelers piloting VoyageAI ahead
          of public launch.
        </p>
      </Reveal>

      <div className="mt-14 grid gap-6 sm:grid-cols-3">
        {testimonials.map((testimonial, index) => (
          <Reveal
            key={testimonial.name}
            delay={index * 0.1}
            className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
          >
          <figure className="flex h-full flex-col">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < testimonial.rating
                      ? "fill-amber-400 text-amber-400"
                      : "fill-slate-200 text-slate-200 dark:fill-slate-700 dark:text-slate-700"
                  }`}
                />
              ))}
            </div>
            <blockquote className="mt-4 grow text-sm text-slate-600 dark:text-slate-300">
              &ldquo;{testimonial.quote}&rdquo;
            </blockquote>
            <figcaption className="mt-6 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-indigo-600 text-sm font-semibold text-white">
                {testimonial.initials}
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {testimonial.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {testimonial.location}
                </p>
              </div>
            </figcaption>
          </figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
