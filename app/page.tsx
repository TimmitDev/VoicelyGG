import Link from "next/link";
import { isDatabaseConfigured } from "@/lib/claims";

type HomePageProps = {
  searchParams: Promise<{
    status?: string;
    message?: string;
  }>;
};

function Banner({ status, message }: { status?: string; message?: string }) {
  if (!message) {
    return null;
  }

  const isSuccess = status === "success";

  return (
    <p
      className={`mb-6 rounded-md border px-4 py-3 text-sm ${
        isSuccess
          ? "border-emerald-400/50 bg-emerald-500/20 text-emerald-100"
          : "border-rose-400/50 bg-rose-500/20 text-rose-100"
      }`}
    >
      {message}
    </p>
  );
}

export default async function Home({ searchParams }: HomePageProps) {
  const { status, message } = await searchParams;
  const databaseConfigured = isDatabaseConfigured();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-4 py-10 sm:px-8">
      <section className="mx-auto mt-10 w-full max-w-2xl rounded-2xl border border-card-border bg-card p-6 shadow-2xl shadow-slate-950/50 backdrop-blur sm:p-8">
        <p className="mb-4 text-xs font-medium uppercase tracking-[0.28em] text-cyan-200">
          VoicelyGG
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-100 sm:text-4xl">
          Claim je username
        </h1>
        <p className="mt-3 text-sm text-slate-300 sm:text-base">
          Vul je gewenste username en e-mailadres in. Elke username kan maar
          een keer geclaimd worden.
        </p>

        <Banner status={status} message={message} />

        {!databaseConfigured ? (
          <div className="mt-6 rounded-md border border-amber-400/50 bg-amber-500/15 px-4 py-3 text-sm text-amber-100">
            Database is nog niet geconfigureerd. Zet{" "}
            <code className="font-mono">DATABASE_URL</code> (of{" "}
            <code className="font-mono">POSTGRES_URL</code>) in je environment
            variables.
          </div>
        ) : null}

        <form action="/api/claims" method="POST" className="mt-6 space-y-5">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-200">
              Username
            </span>
            <input
              name="username"
              required
              minLength={3}
              maxLength={20}
              pattern="[A-Za-z0-9_]{3,20}"
              placeholder="bijv. timwa"
              className="w-full rounded-md border border-slate-700 bg-slate-900/70 px-3 py-2 text-slate-100 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/40"
            />
            <span className="mt-2 block text-xs text-slate-400">
              Alleen letters, cijfers en underscore. 3 tot 20 tekens.
            </span>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-200">
              E-mailadres
            </span>
            <input
              type="email"
              name="email"
              required
              placeholder="naam@voorbeeld.nl"
              className="w-full rounded-md border border-slate-700 bg-slate-900/70 px-3 py-2 text-slate-100 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/40"
            />
          </label>

          <button
            type="submit"
            disabled={!databaseConfigured}
            className="inline-flex h-11 w-full items-center justify-center rounded-md bg-cyan-400 px-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-300"
          >
            Username claimen
          </button>
        </form>

        <div className="mt-8 border-t border-slate-700 pt-4 text-sm text-slate-300">
          Claims bekijken? Open{" "}
          <Link className="font-semibold text-cyan-200 hover:text-cyan-100" href="/admin">
            /admin
          </Link>
          . Als <code className="font-mono">ADMIN_SECRET</code> is ingesteld,
          gebruik dan <code className="font-mono">?key=JOUW_SECRET</code>.
        </div>
      </section>
    </main>
  );
}
