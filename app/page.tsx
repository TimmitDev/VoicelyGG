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
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-10 sm:px-8">
      <header className="mb-8 text-center">
        <h1 className="game-title text-5xl font-extrabold leading-none text-cyan-200 drop-shadow-[0_0_18px_rgba(34,211,238,0.45)] sm:text-7xl">
          VoicelyGG
        </h1>
        <p className="mt-3 text-base tracking-[0.2em] text-cyan-100/85 sm:text-lg">
          LAUNCHING SOON, CLAIM YOUR USERNAME!
        </p>
      </header>

      <section className="game-panel mx-auto w-full max-w-xl rounded-2xl p-6 sm:p-8">

        <Banner status={status} message={message} />

        {!databaseConfigured ? (
          <div className="mt-5 rounded-md border border-amber-300/60 bg-amber-500/15 px-4 py-3 text-sm text-amber-100">
            Database mist. Zet <code className="font-mono">DATABASE_URL</code>{" "}
            of <code className="font-mono">POSTGRES_URL</code>.
          </div>
        ) : null}

        <form action="/api/claims" method="POST" className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm uppercase tracking-wider text-cyan-100/90">
              Username
            </span>
            <input
              name="username"
              required
              minLength={3}
              maxLength={20}
              pattern="[A-Za-z0-9_]{3,20}"
              placeholder="Username"
              className="h-11 w-full rounded-md border border-cyan-300/35 bg-slate-950/70 px-3 text-base text-slate-100 outline-none transition focus:border-cyan-200 focus:ring-2 focus:ring-cyan-300/40"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm uppercase tracking-wider text-cyan-100/90">
              Email
            </span>
            <input
              type="email"
              name="email"
              required
              placeholder="E-mail"
              className="h-11 w-full rounded-md border border-cyan-300/35 bg-slate-950/70 px-3 text-base text-slate-100 outline-none transition focus:border-cyan-200 focus:ring-2 focus:ring-cyan-300/40"
            />
          </label>

          <button
            type="submit"
            disabled={!databaseConfigured}
            className="mt-2 inline-flex h-12 w-full items-center justify-center rounded-md border border-cyan-200/30 bg-cyan-300 px-4 font-display text-base font-bold uppercase tracking-wider text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:border-slate-500 disabled:bg-slate-700 disabled:text-slate-300"
          >
            Claim Username
          </button>
        </form>
      </section>
    </main>
  );
}
