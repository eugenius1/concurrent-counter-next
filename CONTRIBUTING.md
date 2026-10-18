# Developing Concurrent Counter

For people changing the app; the [README](README.md) is for people using it.
The code is meant to explain itself, so this file keeps only what spans
several files or can't be seen from the code.

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
ignores. `DATABASE_URL` is the only variable, read at runtime; the build does
not need it. The app creates its schema on first use.

In Claude Code, the `web` entry in [.claude/launch.json](.claude/launch.json)
starts the database and then the dev server. The database has no entry of its
own because each entry opens a browser tab at its port, and a tab pointed at
Postgres never loads. `docker compose stop db` stops it afterwards.

**Deploying.** Coolify builds with Nixpacks and deploys every push to `main`
to <https://counter.eusebius.tech>, with `DATABASE_URL` pointing at a Postgres
database on the same Docker network and a health check on `/api/health`.

## How it works

The browser talks only to the Next.js server, and only the server talks to
Postgres. The server allows exactly two writes: creating a counter and
incrementing one. An increment is a single `UPDATE … SET value = value + $1`,
because reading the value and writing it back in two steps would lose
concurrent presses. Each counter page, and the homepage, has its own
Server-Sent Events stream.

There are no accounts, so a counter's link is what grants access to it: the
id is an unguessable ULID and `/c/:id` is the only way in. Nothing may list
ids for that reason. The one exception is the demo counter, seeded with a
fixed id so there is something to press before creating one.

Live updates come from Postgres itself. A trigger calls `pg_notify` on every
insert and update, the server holds one `LISTEN` connection for the whole
process, and each notification is fanned out to the open streams. Because the
trigger fires for any write, changes made outside the app (in `psql`, say)
reach the browsers too. Streams subscribe before they load anything, so no
change can fall into the gap between the two.

A value is a 64-bit integer, more than a JavaScript number holds exactly, so
it stays a decimal string from the database to the page. Turning it into a
number anywhere brings back rounding past 2^53.

The client never patches its own state after a write. It waits for the
stream like every other browser, so there is one path for updates and no way
for a tab to disagree with the database.

If the `LISTEN` connection drops and reconnects, notifications may have been
missed, so the server closes every open counter stream; `EventSource`
reconnects and the new stream starts with the current value.

**Limits on use.** A client is its network address, and creating, pressing
and open streams each have a limit per client, in
[src/lib/rateLimit.ts](src/lib/rateLimit.ts). Past one the answer is a `429`.
Writes that a page on another site made a browser send get a `403`, or any
website could press counters from each of its visitors' addresses. These stop
one script or one hostile page, not someone with many addresses; that needs a
limit at the proxy or a challenge in front of it.

## Localisation

The server picks the language per request: the `locale` cookie if the visitor
chose one, otherwise the best match for `Accept-Language`, otherwise English.
Nothing about the language is in the URL, so a shared counter link opens in
each reader's own language. The cost is that no page is prerendered.

`src/i18n/messages/en.ts` defines the messages; every other language must have
the same keys and every plural category its language has, which the type
checker and `messages.test.ts` enforce. To add a language, add it to `LOCALES`
in [src/i18n/locales.ts](src/i18n/locales.ts), add its file under `messages/`
and its line in `messages/index.ts`.

Right-to-left languages set their direction when the page first renders, which
is why changing language reloads the page instead of refreshing it in place.

## Things that will bite you

**`LISTEN` does not work through a transaction-mode pooler.** The listener
needs one session that stays open. Connect directly to Postgres, or use a
pooler in session mode; through PgBouncer or Supavisor in transaction mode the
app runs but no live updates arrive.

**Nothing may connect to the database at import time.** `next build` imports
every route module with no `DATABASE_URL` set, so a top-level `postgres(...)`
or a thrown "not set" error breaks the build in CI.

**`db/schema.sql` runs on every cold start, so it must stay idempotent.** A
plain `CREATE`, or an `ALTER` that fails the second time, makes every request
fail after the next restart. Changes to an existing table go in a `DO` block
that checks whether they are still needed. The file is read at runtime, so it
also has to ship with the app.

**Route tests need the node environment.** Jest defaults to jsdom here, which
has no `Request` or `Response`. Start each route test with
`/** @jest-environment node */`. Component tests mock `EventSource` for the
same reason.

**The event stream must not be buffered or compressed.** Behind a proxy that
does either, events arrive late, in batches, or not at all.

**The client address is the last entry of `X-Forwarded-For`.** That is right
behind exactly one proxy, which is what Coolify gives. Put a second one in
front (a CDN, say) and every visitor shares the CDN's limits; with no proxy at
all, the header is the client's to forge. Without it, as in local development,
all requests count as one client.

**The limits live in the memory of one process.** Run two instances and each
client gets twice the allowance; a restart forgets everything.

**`EventSource` gives up after a `429`.** It reconnects after a dropped
connection but not after an error status, so a client refused a stream shows
no live updates until the page is reloaded.

**TypeScript is held at 6.** `typescript-eslint` (through `eslint-config-next`)
and `ts-jest` don't support 7 yet; upgrading fails at install with a peer
dependency conflict.

## Claude review on PRs

`.github/workflows/claude-review.yml` runs Claude's `/code-review` and
`/security-review`, from the shared actions in
[eugenius1/actions](https://github.com/eugenius1/actions), on every non-draft
PR from this repo and posts findings as
inline comments. It runs on the owner's Claude plan through the
`CLAUDE_CODE_OAUTH_TOKEN` secret (made with `claude setup-token`; renew it when
it expires), so fork and Dependabot PRs, which can't read it, are skipped. It
reports but isn't a required check.

A PR that edits the workflow is never reviewed by it: the action exits green
in seconds, doing nothing, when the file differs from the one on `main`. Keep
such PRs free of other code.
A change to the shared actions reaches every repo's next PR as soon as it is
merged there.

## Conventions

- `npm run validate` (lint, typecheck, every test and a build) must pass
  before every commit. CI runs the same steps.
- Pull requests target `main`.
- Commit subjects follow Conventional Commits, which commitlint checks. The
  body is prose explaining the reasoning, not a changelog line.
- Comments explain why, not what.
- Secrets and real connection strings never go in the repository, and source
  files carry no licence header; [AGENTS.md](AGENTS.md) has both rules.
