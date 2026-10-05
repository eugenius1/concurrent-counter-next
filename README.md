# Concurrent Counter

[![CI](https://github.com/eugenius1/concurrent-counter-next/actions/workflows/nextjs.yml/badge.svg)](https://github.com/eugenius1/concurrent-counter-next/actions/workflows/nextjs.yml)

Shared counters that everyone sees change at the same moment. Open the page on
two devices, press a button on one, and the number moves on both.

A test deployment runs at **<https://test.counter.eusebius.tech>**. To run it
yourself, see [CONTRIBUTING.md](CONTRIBUTING.md).

## What it does

- **Create New Counter** adds a counter to the page, for everyone who has it
  open.
- **Increase** and **Decrease** change a counter by one.
- Every open page updates as it happens. There is nothing to refresh.

For example, two people counting arrivals at different doors can share one
counter and both always see the running total.

## How it behaves

- No click is lost. If many people press a button at the same instant, every
  press is counted: 200 simultaneous increases add exactly 200.
- A counter can go below zero.
- If your connection drops, the page reconnects on its own and catches up with
  the current values.

## Good to know

- There are no accounts. Anyone with the address can see and change every
  counter, so don't use it for anything that needs to be private or protected.
- Counters can't be renamed or deleted. Each is labelled with the last six
  characters of its id.
- The light/dark switch in the corner follows your system setting by default.

## Status

Creating, increasing and decreasing counters with live updates all work.
Renaming, deleting and private counters are not planned yet.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to run it locally, how the live
updates work, and the traps to avoid. Coding agents should start at
[AGENTS.md](AGENTS.md).
