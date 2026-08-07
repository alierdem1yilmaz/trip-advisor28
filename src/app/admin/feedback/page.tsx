import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/dal";
import { SimpleHeader } from "@/components/SimpleHeader";

// Internal-only page, not linked from anywhere in the app — gated by a
// single owner email rather than a role system, since there's exactly one
// admin. Deliberately not localized (t.*): this is a tool for us, not a
// user-facing page.
export default async function AdminFeedbackPage() {
  const user = await getCurrentUser();
  if (
    !user ||
    !process.env.ADMIN_EMAIL ||
    user.email !== process.env.ADMIN_EMAIL
  ) {
    notFound();
  }

  const feedback = await prisma.feedback.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-paper">
      <SimpleHeader />
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">
          Feedback ({feedback.length})
        </h1>

        {feedback.length === 0 ? (
          <p className="mt-8 text-ink-faint">No feedback submitted yet.</p>
        ) : (
          <ul className="mt-8 space-y-4">
            {feedback.map((entry) => (
              <li
                key={entry.id}
                className="rounded-2xl border border-line bg-paper-dim p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-ink-faint">
                  <span>{entry.email ?? "anonymous"}</span>
                  <span>
                    {new Intl.DateTimeFormat("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(entry.createdAt)}
                  </span>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm text-ink">
                  {entry.message}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
