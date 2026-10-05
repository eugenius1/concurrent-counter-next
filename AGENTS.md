# Notes for coding agents

Deliberately short: this file is loaded into context on every session, so it
carries only attribution and the rules whose cost is unrecoverable if missed.
Anything a test already enforces is left to [CONTRIBUTING.md](CONTRIBUTING.md).
Read CONTRIBUTING.md before changing code: conventions, architecture, and the
traps that have cost real debugging time are all there.

Shared counters with live updates. Next.js App Router and Material UI, with
plain Postgres: route handlers write, `LISTEN/NOTIFY` feeds a Server-Sent
Events stream. Deployed with Coolify.

## Before every commit

```bash
npm run validate
```

Lints, typechecks, runs every test and builds.

## Attribution

End every commit message with:

```
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
```

Use the model that actually did the work. The subject line follows
Conventional Commits (commitlint rejects anything else); the body is prose
explaining the reasoning and what went wrong — not a changelog line.

## Never delete deployed data without being asked

Databases and volumes on the Coolify server can't be recovered once removed.

- Read freely. Creating a resource or adding a variable is fine when the task
  calls for it.
- Stop, delete, or overwrite a database, service or volume only when the user
  asks for that specific action. An earlier go-ahead for something else
  doesn't count.

## Never commit credentials

Real connection strings and API tokens stay out of the repository.
`.env.development` holds only the local Docker credentials; anything real goes
in `.env.local` (gitignored) or the host's settings. Check `git status` before
committing anyway.

## No licence headers

Source files carry no SPDX or copyright header. Don't add them.
