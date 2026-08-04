import {
  CloudSun,
  Gauge,
  Leaf,
  Route,
  Sparkles,
  Users,
  Utensils,
  Wand2,
  type LucideIcon,
} from "lucide-react";
import { features, type Feature } from "@/data/marketing";

const iconMap: Record<Feature["icon"], LucideIcon> = {
  route: Route,
  "cloud-sun": CloudSun,
  users: Users,
  utensils: Utensils,
  sparkles: Sparkles,
  leaf: Leaf,
  wand: Wand2,
  gauge: Gauge,
};

export function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-6 py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
          Every travel question, answered before you ask it
        </h2>
        <p className="mt-4 text-slate-600 dark:text-slate-300">
          Not just a list of attractions, a plan that understands opening hours,
          weather, crowds, and how tired you&apos;ll be by 4pm.
        </p>
      </div>

      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => {
          const Icon = iconMap[feature.icon];
          return (
            <div
              key={feature.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-900"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-indigo-600 text-white">
                <Icon className="h-5 w-5" strokeWidth={2} />
              </span>
              <h3 className="mt-4 font-semibold text-slate-900 dark:text-white">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
