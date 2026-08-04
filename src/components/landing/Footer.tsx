import { Compass } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 py-10 dark:border-slate-800">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400">
          <Compass className="h-4 w-4" />
          VoyageAI
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500">
          &copy; {new Date().getFullYear()} VoyageAI. Working title, product in
          development.
        </p>
      </div>
    </footer>
  );
}
