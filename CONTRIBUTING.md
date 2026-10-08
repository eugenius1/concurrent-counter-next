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

**Deploying.** Coolify builds with Nixpacks and deploys every push to `main`
to <https://counter.eusebius.tech>. The app needs `DATABASE_URL` as a runtime
variable pointing at a Postgres database on the same Docker network, and a
health check on `/api/health`. Open pull requests against `main`.

## Layout

| Path | Purpose |
| --- | --- |
| [db/schema.sql](db/schema.sql) | The table and the trigger that publishes changes. Applied by the app. |
| [src/lib/db.ts](src/lib/db.ts) | The `postgres.js` client, schema bootstrap, and id validation. |
| [src/lib/counterEvents.ts](src/lib/counterEvents.ts) | The one shared `LISTEN` connection and its subscribers. |
| [src/lib/eventStream.ts](src/lib/eventStream.ts) | The Server-Sent Events response both streams are built on. |
| [src/lib/counterCount.ts](src/lib/counterCount.ts) | The number of counters, read once and shared by every homepage stream. |
| [src/lib/rateLimit.ts](src/lib/rateLimit.ts) | Per-client limits on writes and on open streams, and the limits themselves. |
| [src/lib/sameOrigin.ts](src/lib/sameOrigin.ts) | Rejects writes that another website made a browser send. |
| `src/app/api/counters/` | Route handlers: create, increment, and the two event streams. |
| [src/app/api/health/route.ts](src/app/api/health/route.ts) | Health check that queries the database. |
| [src/app/page.tsx](src/app/page.tsx) | The homepage: creates a counter, shows how many exist, and shows the demo counter. |
| [src/app/c/[id]/page.tsx](src/app/c/%5Bid%5D/page.tsx) | A counter's own page: loads it on the server, or returns 404. |
| [src/components/CounterPage.tsx](src/components/CounterPage.tsx) | The counter page in the browser: the counter and the buttons that share its link. |
| [src/components/LiveCounter.tsx](src/components/LiveCounter.tsx) | A counter kept current by its own event stream. |
| [src/components/Counter.tsx](src/components/Counter.tsx) | One counter and its two buttons. |
| [src/components/ErrorToast.tsx](src/components/ErrorToast.tsx) | The message shown when a press or a create fails. |
| [src/components/Header.tsx](src/components/Header.tsx) | The icon and app name that link home, and the language and theme switches, on every page. |
| [src/components/Providers.tsx](src/components/Providers.tsx) | Styles, theme and language around every page, mirrored for right-to-left languages. |
| [src/i18n/locales.ts](src/i18n/locales.ts) | The list of languages, and the choice of one from `Accept-Language`. |
| `src/i18n/messages/` | One file of messages per language. `en.ts` defines the set. |
| [src/i18n/format.ts](src/i18n/format.ts) | Placeholders and plural forms. |
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
homepage count subscribes first for the same reason, and recounts when a
counter is created rather than adding one, so a counter created in that gap is
never counted twice.

Every homepage stream shares that one count. `src/lib/counterCount.ts` reads
it at most once a second, however many counters are created, and always once
more after the last of them, so the number shown ends up right. Counting per
stream meant each insert ran one `count(*)` for every open homepage.

A value is a 64-bit integer (`bigint`), which is more than a JavaScript number
holds exactly, so it is a decimal string all the way from the database to the
page: `postgres.js` returns `bigint` as a string, the trigger sends it as text,
and nothing parses it. Turning it into a number anywhere brings back rounding
past 2^53.

The client never patches its own state after a write. It waits for the
`change` event like every other browser, so there is one path for updates and
no way for a tab to disagree with the database.

If the `LISTEN` connection drops and reconnects, notifications may have been
missed, so the server closes every open counter stream. `EventSource`
reconnects by itself and the new stream starts with the current value. The
homepage count is simply read again.

### Limits on use

There are no accounts, so a client is its network address: an IPv4 address,
or the /64 of an IPv6 one. `src/lib/rateLimit.ts` holds the numbers.

| What | Limit per client | Past it |
| --- | --- | --- |
| Creating a counter | 5 at once, then 5 a minute | `429` with `Retry-After` |
| Pressing a counter | 20 at once, then 10 a second | `429` with `Retry-After` |
| Open event streams | 40 | `429` |

A refused write shows a toast asking the user to try again later, as any
failed write does.

Both writes also answer `403` to a request that a page on another origin made
a browser send, judged by `Sec-Fetch-Site`, or by `Origin` against `Host` in
browsers that don't send it. Otherwise any website could press or create
counters from each of its visitors' addresses, and no per-address limit would
notice. A request with neither header is not from a browser and is allowed.

These stop one script or one hostile page. They do not stop someone with many
addresses; that needs a limit at the proxy or a challenge in front of it.

The schema is applied from `db/schema.sql` the first time the database is
used, inside a transaction holding an advisory lock so that several instances
starting together don't race. A failed attempt is not cached; the next request
tries again.

## Localisation

The languages are the most spoken in the world by total speakers (Ethnologue
2026), in that order, down to Swahili. [src/i18n/locales.ts](src/i18n/locales.ts)
lists them. The language menu has its own order: English first, as the way
out for someone in a language they can't read, then the languages the
visitor's browser asks for, then the rest by their own names under one fixed
collation, so the list is the same for everyone.

**Choosing a language.** The server picks it per request: the `locale` cookie
if the visitor chose one in the menu, otherwise the best match for
`Accept-Language`, otherwise English. Nothing about the language is in the
URL, so a shared counter link opens in each reader's own language. The cost is
that every page reads the request and none is prerendered.

**Messages.** `src/i18n/messages/en.ts` defines the set and its type; every
other file must have exactly the same keys, which the type checker and
`messages.test.ts` both enforce. Components read them with `useI18n()`.
Placeholders are `{name}` and filled with `fill()`. A message that depends on
a number is an object with one string per plural category of the language
(`one`, `few`, `many`, `other` and so on), chosen by `plural()`; the test
fails if a language is missing a category `Intl.PluralRules` says it has.
Only the language being shown is sent to the browser.

**Adding a language.** Add it to `LOCALES`, add its file under `messages/`
and its line in `messages/index.ts`. If browsers don't know the code, give it
an `intl` tag they do know, as `arz` and `pcm` have; an unknown tag makes
`Intl` fall back to the system language without saying so.

**Right to left.** Arabic, Urdu and Egyptian Arabic set `dir="rtl"` on the
page and load the theme and the style plugin that mirror MUI's components.
The direction is fixed when the page first renders, which is why changing
language reloads the page instead of refreshing it in place. The copyright
line stays left to right in every language: it is Latin text, and its year
range reads backwards otherwise.

The translations were written without native speakers reviewing them.

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
fails the second time makes every request fail after the next restart. Changing
an existing table goes in a `DO` block that checks whether the change is still
needed, as the widening of `value` to `bigint` does. The
file is read from disk at runtime, so it also has to ship with the app.

**Route tests need the node environment.** Jest defaults to jsdom here, which
has no `Request` or `Response`. Start each route test with
`/** @jest-environment node */`. For the same reason component tests replace
`EventSource` with a mock, as jsdom doesn't have one.

**The event stream must not be buffered or compressed.** The response sets
`Cache-Control: no-transform` and `X-Accel-Buffering: no`, and sends a comment
line every 25 seconds so proxies keep the idle connection open. Remove those
and events arrive late, in batches, or not at all behind a proxy.

**The client address comes from the last entry of `X-Forwarded-For`.** That
is the one the proxy in front of the app wrote; everything before it is
whatever the client sent. It is right for one proxy, which is what Coolify
gives. Put a second one in front (a CDN, say) and every visitor has the CDN's
address and shares one set of limits; reached with no proxy at all, the header
is the client's to forge. Without the header, as in local development, all
requests count as one client.

**The limits live in the memory of one process.** Run two instances and each
client gets twice the allowance; a restart forgets everything. Moving them
into Postgres or the proxy fixes that, when it matters.

**`EventSource` gives up after a `429`.** It reconnects after a dropped
connection but not after an error status, so a client refused a stream shows
no live updates until the page is reloaded. The stream limit is set high
enough that only abuse should meet it.

**TypeScript is held at 6.** `typescript-eslint` (through `eslint-config-next`)
and `ts-jest` don't support 7 yet; upgrading fails at install with a peer
dependency conflict.

**MUI 9 has no system props on `Box`.** `display`, `gap` and the like go in
`sx`; as props they are a type error.

## Conventions

- `npm run validate` must pass before every commit.
- Pull requests target `main`.
- Commit subjects follow Conventional Commits (`feat:`, `fix:`, `ci:` …);
  commitlint checks them on every pull request. The body is prose explaining
  the reasoning and what went wrong, not a changelog line.
- Comments explain why, not what.
- Never commit secrets or real connection strings. `.env.development` holds
  only the local Docker credentials; everything else goes in `.env.local` or
  the host's settings.
- No licence headers in source files.
