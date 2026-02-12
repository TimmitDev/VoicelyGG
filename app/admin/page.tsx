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
      <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-10 sm:px-8">
        <header className="mb-8 text-center">
          <h1 className="game-title text-5xl font-extrabold leading-none text-cyan-200 drop-shadow-[0_0_18px_rgba(34,211,238,0.45)] sm:text-7xl">
            VoicelyGG
          </h1>
          <p className="mt-3 text-base tracking-[0.2em] text-cyan-100/85">
            ADMIN PORTAL
          </p>
        </header>
        <section className="game-panel mx-auto w-full max-w-2xl rounded-2xl p-6">
          <h2 className="font-display text-2xl uppercase tracking-wider text-slate-100">
            Geen toegang
          </h2>
          <p className="mt-3 text-sm text-slate-200">
            Toegang geweigerd. Voeg in de URL een geldige{" "}
            <code className="font-mono">key</code> query toe:
            <br />
            <code className="mt-2 inline-block rounded bg-slate-950/80 px-2 py-1">
              /admin?key=jouw_admin_secret
            </code>
          </p>
          <Link className="mt-5 inline-block text-sm font-semibold text-cyan-200 hover:text-cyan-100" href="/">
            Terug naar claim pagina
          </Link>
        </section>
      </main>
    );
  }

  if (!isDatabaseConfigured()) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-10 sm:px-8">
        <header className="mb-8 text-center">
          <h1 className="game-title text-5xl font-extrabold leading-none text-cyan-200 drop-shadow-[0_0_18px_rgba(34,211,238,0.45)] sm:text-7xl">
            VoicelyGG
          </h1>
          <p className="mt-3 text-base tracking-[0.2em] text-cyan-100/85">
            ADMIN PORTAL
          </p>
        </header>
        <section className="mx-auto w-full max-w-2xl rounded-2xl border border-amber-400/50 bg-amber-500/15 p-6 text-amber-100">
          Database mist. Zet <code className="font-mono">DATABASE_URL</code> of{" "}
          <code className="font-mono">POSTGRES_URL</code>.
        </section>
      </main>
    );
  }

  const result = await getAllClaims();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-10 sm:px-8">
      <header className="mb-8 text-center">
        <h1 className="game-title text-5xl font-extrabold leading-none text-cyan-200 drop-shadow-[0_0_18px_rgba(34,211,238,0.45)] sm:text-7xl">
          VoicelyGG
        </h1>
        <p className="mt-3 text-base tracking-[0.2em] text-cyan-100/85">
          ADMIN PORTAL
        </p>
        <Link className="mt-3 inline-block text-sm font-semibold text-cyan-200 hover:text-cyan-100" href="/">
          Naar claim pagina
        </Link>
      </header>

      {!result.ok ? (
        <div className="rounded-md border border-rose-400/50 bg-rose-500/15 px-4 py-3 text-sm text-rose-100">
          {result.error}
        </div>
      ) : result.claims.length === 0 ? (
        <div className="game-panel rounded-2xl p-6 text-sm text-slate-300">
          Nog geen claims gevonden.
        </div>
      ) : (
        <div className="game-panel overflow-hidden rounded-2xl">
          <table className="min-w-full text-left text-sm text-slate-200">
            <thead className="bg-slate-950/85 text-xs uppercase tracking-[0.14em] text-cyan-100/90">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Username</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Datum</th>
              </tr>
            </thead>
            <tbody>
              {result.claims.map((claim) => (
                <tr key={claim.id} className="border-t border-cyan-300/15">
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
