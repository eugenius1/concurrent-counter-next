# Concurrent Counter

[![CI](https://github.com/eugenius1/concurrent-counter-next/actions/workflows/nextjs.yml/badge.svg)](https://github.com/eugenius1/concurrent-counter-next/actions/workflows/nextjs.yml)

Shared counters that everyone sees change at the same moment. Create one, send
its link to someone, press a button, and the number moves for both of you.

A test deployment runs at **<https://test.counter.eusebius.tech>**. To run it
yourself, see [CONTRIBUTING.md](CONTRIBUTING.md).

## What it does

- **Create New Counter** on the homepage makes a counter and takes you to its
  own page.
- **Share** on that page opens your device's share sheet, and **Copy link**
  copies the address, ready to paste to whoever should share the counter.
  Where there is no share sheet, **Share** copies the link too.
- **Increase** and **Decrease** change the counter by one.
- Every open copy of the page updates as it happens. There is nothing to
  refresh.
- The icon in the top left corner leads back to the homepage.
- The homepage shows how many counters have been created, and one counter that
  every visitor shares, to try it out.

For example, two people counting arrivals at different doors can open the same
link and both always see the running total.

## How it behaves

- No click is lost. If many people press a button at the same instant, every
  press is counted: 200 simultaneous increases add exactly 200.
- A counter can go below zero.
- If your connection drops, the page reconnects on its own and catches up with
  the current values.

## Good to know

- There are no accounts. A counter you create isn't listed anywhere, but
  anyone who has its link can see and change it, so don't use it for anything
  that needs to be private or protected.
- The link is the only way back to a counter. Keep it, for example as a
  bookmark.
- Counters can't be renamed or deleted. Each is labelled with the last six
  characters of its id.
- The light/dark switch in the corner follows your system setting by default.

## Status

Creating, sharing, increasing and decreasing counters with live updates all
work. Renaming, deleting and private counters are not planned yet.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to run it locally, how the live
updates work, and the traps to avoid. Coding agents should start at
[AGENTS.md](AGENTS.md).
