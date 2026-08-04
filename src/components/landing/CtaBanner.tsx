import { Reveal } from "./Reveal";

export function CtaBanner() {
  return (
    <section id="waitlist" className="mx-auto max-w-6xl px-6 pb-24 sm:pb-32">
      <Reveal className="overflow-hidden rounded-3xl bg-gradient-to-br from-teal-500 to-indigo-600 px-8 py-16 text-center sm:px-16 sm:py-20">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Be first in line when VoyageAI launches
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-teal-50">
          Join the early access list and help shape the smartest travel planner
          on the web.
        </p>

        <form className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
          <label htmlFor="email" className="sr-only">
            Email address
          </label>
          <input
            id="email"
            type="email"
            required
            placeholder="you@example.com"
            className="w-full rounded-full border-0 px-5 py-3 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:ring-2 focus:ring-white focus:outline-none"
          />
          <button
            type="submit"
            className="shrink-0 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Join the waitlist
          </button>
        </form>
      </Reveal>
    </section>
  );
}
