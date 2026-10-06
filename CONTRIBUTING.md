# Developing Concurrent Counter

Everything a contributor needs. The [README](README.md) is for people using the
app; this is for people changing it; [AGENTS.md](AGENTS.md) holds the handful
of rules that bind coding agents specifically.

## Running it

Needs Node 22 or newer and Docker.

```bash
npm install
docker compose up -d db   # Postgres on localhost:5433
npm run dev               # http://localhost:3000
```

`next dev` reads the local database URL from
[.env.development](.env.development), which is committed because it holds only
the throwaway credentials from [docker-compose.yml](docker-compose.yml). To
point at another database, set `DATABASE_URL` in `.env.local`, which git
ignores. The app creates its schema on first use, so a fresh database needs no
setup.

In Claude Code, [.claude/launch.json](.claude/launch.json) defines `web`, which
starts the database and then the dev server. The database is not an entry of
its own because each entry opens a browser tab at its port, and a tab pointed
at Postgres never finishes loading. It keeps running after the preview stops;
`docker compose stop db` stops it.

`npm run validate` is the gate: lint, typecheck, every test and a production
build. Run it before every commit. CI runs the same steps.

**Configuration.** `DATABASE_URL` is the only variable: a Postgres connection
string, read at runtime. The build does not need it.

**Deploying.** Coolify builds with Nixpacks and deploys on push: `dev` goes to
<https://test.counter.eusebius.tech>, `main` to <https://counter.eusebius.tech>.
Each app needs `DATABASE_URL` as a runtime variable pointing at a Postgres
database on the same Docker network, and a health check on `/api/health`.
Open pull requests against `dev`.

## Layout

| Path | Purpose |
| --- | --- |
| [db/schema.sql](db/schema.sql) | The table and the trigger that publishes changes. Applied by the app. |
| [src/lib/db.ts](src/lib/db.ts) | The `postgres.js` client, schema bootstrap, and id validation. |
| [src/lib/counterEvents.ts](src/lib/counterEvents.ts) | The one shared `LISTEN` connection and its subscribers. |
| [src/lib/eventStream.ts](src/lib/eventStream.ts) | The Server-Sent Events response both streams are built on. |
| `src/app/api/counters/` | Route handlers: create, increment, and the two event streams. |
| [src/app/api/health/route.ts](src/app/api/health/route.ts) | Health check that queries the database. |
| [src/app/page.tsx](src/app/page.tsx) | The homepage: creates a counter, shows how many exist, and shows the demo counter. |
| [src/app/c/[id]/page.tsx](src/app/c/%5Bid%5D/page.tsx) | A counter's own page: loads it on the server, or returns 404. |
| [src/components/CounterPage.tsx](src/components/CounterPage.tsx) | The counter page in the browser: the counter and the buttons that share its link. |
| [src/components/LiveCounter.tsx](src/components/LiveCounter.tsx) | A counter kept current by its own event stream. |
| [src/components/Counter.tsx](src/components/Counter.tsx) | One counter and its two buttons. |
| [src/components/Header.tsx](src/components/Header.tsx) | The icon and app name that link home, and the theme switch, on every page. |
| [src/lib/demoCounter.ts](src/lib/demoCounter.ts) | The id of the counter shown on the homepage. |
| `src/__tests__/`, `*.test.ts` beside routes | Component tests (jsdom) and route tests (node). |

## How it works

The browser talks only to the Next.js server, and only the server talks to
Postgres. Earlier versions used Supabase from the browser with a public key,
which let anyone insert or update rows freely; the server now allows exactly
two writes.

- `POST /api/counters` inserts a counter with a server-generated ULID.
- `POST /api/counters/:id/increment` takes `{ "by": 1 }` or `{ "by": -1 }` and
  runs a single `UPDATE … SET value = value + $1`. Doing the arithmetic in one
  statement is what makes concurrent presses safe: reading the value and
  writing it back in two steps would lose updates.
- `GET /api/counters/:id/stream` is a Server-Sent Events stream for one
  counter. It sends a `change` event with the current value, then another per
  update.
- `GET /api/counters/stream` is the homepage's stream. It sends a `count`
  event with the number of counters, and again whenever one is created.

There are no accounts, so a counter's link is what grants access to it: the
id is an unguessable ULID and `/c/:id` is the only way in. Nothing may list
ids for that reason. The homepage stream carries a number and no ids, and
each counter stream filters to its own id.

The one exception is the demo counter. `db/schema.sql` seeds a counter with a
fixed id, and the homepage shows it to every visitor through the same
per-counter stream, so there is something to press before creating one.

Live updates come from Postgres itself. A trigger calls `pg_notify` on every
insert and update, saying whether the row is new, the server holds one
`LISTEN` connection for the whole process, and each notification is fanned
out to all open streams. Because the
trigger fires for any write, changes made outside the app (for example in
`psql`) reach the browsers too.

A counter stream subscribes before it loads the current value and holds back
any changes that arrive in between, replaying them after it. Subscribing
second would leave a gap in which a change could be missed for good. The
homepage stream subscribes first for the same reason, and recounts on every
new counter rather than adding one, so a counter created in that gap is never
counted twice.

The client never patches its own state after a write. It waits for the
`change` event like every other browser, so there is one path for updates and
no way for a tab to disagree with the database.

If the `LISTEN` connection drops and reconnects, notifications may have been
missed, so the server closes every open stream. `EventSource` reconnects by
itself and the new stream starts with the current value or count.

The schema is applied from `db/schema.sql` the first time the database is
used, inside a transaction holding an advisory lock so that several instances
starting together don't race. A failed attempt is not cached; the next request
tries again.

## Things that will bite you

**`LISTEN` does not work through a transaction-mode pooler.** The listener
needs one session that stays open. Connect directly to Postgres, or use a
pooler in session mode; through PgBouncer or Supavisor in transaction mode the
app runs but no live updates arrive.

**Nothing may connect to the database at import time.** `next build` imports
every route module to collect page data, with no `DATABASE_URL` set. The client
in `src/lib/db.ts` is created on first call for that reason; a top-level
`postgres(...)` or a thrown "not set" error breaks the build in CI.

**`db/schema.sql` runs on every cold start, so it must stay idempotent.** Use
`IF NOT EXISTS` and `CREATE OR REPLACE`. A plain `CREATE` or an `ALTER` that
fails the second time makes every request fail after the next restart. The
file is read from disk at runtime, so it also has to ship with the app.

**Route tests need the node environment.** Jest defaults to jsdom here, which
has no `Request` or `Response`. Start each route test with
`/** @jest-environment node */`. For the same reason component tests replace
`EventSource` with a mock, as jsdom doesn't have one.

**The event stream must not be buffered or compressed.** The response sets
`Cache-Control: no-transform` and `X-Accel-Buffering: no`, and sends a comment
line every 25 seconds so proxies keep the idle connection open. Remove those
and events arrive late, in batches, or not at all behind a proxy.

**TypeScript is held at 6.** `typescript-eslint` (through `eslint-config-next`)
and `ts-jest` don't support 7 yet; upgrading fails at install with a peer
dependency conflict.

**MUI 9 has no system props on `Box`.** `display`, `gap` and the like go in
`sx`; as props they are a type error.

## Conventions

- `npm run validate` must pass before every commit.
- Pull requests target `dev`.
- Commit subjects follow Conventional Commits (`feat:`, `fix:`, `ci:` …);
  commitlint checks them on every pull request. The body is prose explaining
  the reasoning and what went wrong, not a changelog line.
- Comments explain why, not what.
- Never commit secrets or real connection strings. `.env.development` holds
  only the local Docker credentials; everything else goes in `.env.local` or
  the host's settings.
- No licence headers in source files.
