import { neon } from "@neondatabase/serverless";

const USERNAME_PATTERN = /^[a-z0-9_]{3,20}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type Claim = {
  id: number;
  username: string;
  email: string;
  created_at: string;
};

type ClaimInput = {
  username: string;
  email: string;
};

type ClaimResult =
  | { ok: true; username: string }
  | { ok: false; error: string };

type ClaimListResult =
  | { ok: true; claims: Claim[] }
  | { ok: false; error: string };

type PostgresError = {
  code?: string;
  message?: string;
};

let schemaReady = false;

function getDatabaseUrl() {
  return process.env.DATABASE_URL ?? process.env.POSTGRES_URL ?? "";
}

function getSqlClient() {
  const databaseUrl = getDatabaseUrl();

  if (!databaseUrl) {
    return null;
  }

  return neon(databaseUrl);
}

function isPostgresError(error: unknown): error is PostgresError {
  return typeof error === "object" && error !== null;
}

function normalizeUsername(value: string) {
  return value.trim().toLowerCase();
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function validateInput(input: ClaimInput): string | null {
  const username = normalizeUsername(input.username);
  const email = normalizeEmail(input.email);

  if (!USERNAME_PATTERN.test(username)) {
    return "Username moet 3-20 tekens zijn met alleen letters, cijfers of underscore.";
  }

  if (!EMAIL_PATTERN.test(email)) {
    return "Vul een geldig e-mailadres in.";
  }

  return null;
}

async function ensureSchema(): Promise<{ ok: true } | { ok: false; error: string }> {
  if (schemaReady) {
    return { ok: true };
  }

  const sql = getSqlClient();
  if (!sql) {
    return {
      ok: false,
      error:
        "Database is niet geconfigureerd. Zet DATABASE_URL of POSTGRES_URL in je environment variables.",
    };
  }

  await sql`
    CREATE TABLE IF NOT EXISTS username_claims (
      id BIGSERIAL PRIMARY KEY,
      username VARCHAR(20) NOT NULL,
      email TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS username_claims_username_key
    ON username_claims (username)
  `;

  schemaReady = true;
  return { ok: true };
}

export function isDatabaseConfigured() {
  return Boolean(getDatabaseUrl());
}

export async function createClaim(input: ClaimInput): Promise<ClaimResult> {
  const validationError = validateInput(input);
  if (validationError) {
    return { ok: false, error: validationError };
  }

  const schema = await ensureSchema();
  if (!schema.ok) {
    return schema;
  }

  const sql = getSqlClient();
  if (!sql) {
    return {
      ok: false,
      error:
        "Database is niet geconfigureerd. Zet DATABASE_URL of POSTGRES_URL in je environment variables.",
    };
  }

  const username = normalizeUsername(input.username);
  const email = normalizeEmail(input.email);

  try {
    await sql`
      INSERT INTO username_claims (username, email)
      VALUES (${username}, ${email})
    `;

    return { ok: true, username };
  } catch (error) {
    if (isPostgresError(error) && error.code === "23505") {
      return { ok: false, error: "Deze username is al geclaimd." };
    }

    return {
      ok: false,
      error: "Opslaan mislukt. Probeer het opnieuw.",
    };
  }
}

export async function getAllClaims(): Promise<ClaimListResult> {
  const schema = await ensureSchema();
  if (!schema.ok) {
    return schema;
  }

  const sql = getSqlClient();
  if (!sql) {
    return {
      ok: false,
      error:
        "Database is niet geconfigureerd. Zet DATABASE_URL of POSTGRES_URL in je environment variables.",
    };
  }

  try {
    const claims = (await sql`
      SELECT id, username, email, created_at
      FROM username_claims
      ORDER BY created_at DESC
    `) as Claim[];

    return { ok: true, claims };
  } catch {
    return {
      ok: false,
      error: "Claims ophalen mislukt.",
    };
  }
}
