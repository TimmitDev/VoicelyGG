import Link from "next/link";
import { getAllClaims, isDatabaseConfigured } from "@/lib/claims";

type AdminPageProps = {
  searchParams: Promise<{
    key?: string;
  }>;
};

export const dynamic = "force-dynamic";

function formatDate(timestamp: string) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return timestamp;
  }

  return new Intl.DateTimeFormat("nl-NL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const { key } = await searchParams;
  const adminSecret = process.env.ADMIN_SECRET;
  const hasAccess = !adminSecret || key === adminSecret;

  if (!hasAccess) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-10 sm:px-8">
        <section className="mx-auto mt-10 w-full max-w-2xl rounded-2xl border border-card-border bg-card p-6">
          <h1 className="text-2xl font-semibold text-slate-100">Admin portal</h1>
          <p className="mt-3 text-sm text-slate-300">
            Toegang geweigerd. Voeg in de URL een geldige{" "}
            <code className="font-mono">key</code> query toe:
            <br />
            <code className="mt-2 inline-block rounded bg-slate-900/80 px-2 py-1">
              /admin?key=jouw_admin_secret
            </code>
          </p>
          <Link className="mt-5 inline-block text-sm font-semibold text-cyan-200" href="/">
            Terug naar claim pagina
          </Link>
        </section>
      </main>
    );
  }

  if (!isDatabaseConfigured()) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-10 sm:px-8">
        <section className="mx-auto mt-10 w-full max-w-2xl rounded-2xl border border-amber-400/50 bg-amber-500/15 p-6 text-amber-100">
          Database is niet geconfigureerd. Zet{" "}
          <code className="font-mono">DATABASE_URL</code> of{" "}
          <code className="font-mono">POSTGRES_URL</code>.
        </section>
      </main>
    );
  }

  const result = await getAllClaims();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-10 sm:px-8">
      <header className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.28em] text-cyan-200">
            VoicelyGG
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-100">
            Admin portal
          </h1>
          <p className="mt-2 text-sm text-slate-300">
            Overzicht van alle geclaimde usernames.
          </p>
        </div>
        <Link className="text-sm font-semibold text-cyan-200 hover:text-cyan-100" href="/">
          Naar claim pagina
        </Link>
      </header>

      {!result.ok ? (
        <div className="rounded-md border border-rose-400/50 bg-rose-500/15 px-4 py-3 text-sm text-rose-100">
          {result.error}
        </div>
      ) : result.claims.length === 0 ? (
        <div className="rounded-2xl border border-card-border bg-card p-6 text-sm text-slate-300">
          Nog geen claims gevonden.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-card-border bg-card">
          <table className="min-w-full text-left text-sm text-slate-200">
            <thead className="bg-slate-900/90 text-xs uppercase tracking-wide text-slate-300">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Username</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Datum</th>
              </tr>
            </thead>
            <tbody>
              {result.claims.map((claim) => (
                <tr key={claim.id} className="border-t border-slate-800/80">
                  <td className="px-4 py-3 text-slate-400">{claim.id}</td>
                  <td className="px-4 py-3 font-semibold text-cyan-100">
                    @{claim.username}
                  </td>
                  <td className="px-4 py-3">{claim.email}</td>
                  <td className="px-4 py-3 text-slate-400">
                    {formatDate(claim.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
