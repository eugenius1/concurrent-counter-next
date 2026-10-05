# Concurrent Counter

Shared counters that stay in sync across every open browser, built with
[Next.js](https://nextjs.org/) (App Router), [Material UI](https://mui.com/) and
plain PostgreSQL.

## How it works

- Counters live in one Postgres table ([db/schema.sql](db/schema.sql)). No extensions are needed.
- The browser talks only to the Next.js server:
  - `POST /api/counters` creates a counter.
  - `POST /api/counters/:id/increment` with `{ "by": 1 }` or `{ "by": -1 }` applies an atomic update.
  - `GET /api/counters/stream` is a Server-Sent Events stream: a `snapshot` of every counter, then a `change` per insert or update.
- A trigger calls `pg_notify` on every change. The server holds one `LISTEN` connection and fans notifications out to all open streams.
- `GET /api/health` returns 200 when the database is reachable and 503 otherwise.

## Run locally

Requires Node 22+ and Docker.

```bash
npm install
docker compose up -d db
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). `next dev` reads the local
database URL from [.env.development](.env.development), and the app creates its
schema on first use.

In Claude Code, [.claude/launch.json](.claude/launch.json) defines the same two
servers as `db` and `web`.

## Configuration

| Variable       | Description                                                             |
| -------------- | ----------------------------------------------------------------------- |
| `DATABASE_URL` | Postgres connection string, read at runtime. Not needed to build.       |

Connect directly to Postgres, or through a pooler in session mode: `LISTEN`
does not work through transaction-mode pooling.

## Checks

```bash
npm run validate
```

Runs lint, typecheck, tests and a production build. Run it before opening a PR.
