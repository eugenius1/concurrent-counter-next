# Concurrent Counter

[![CI](https://github.com/eugenius1/concurrent-counter-next/actions/workflows/nextjs.yml/badge.svg)](https://github.com/eugenius1/concurrent-counter-next/actions/workflows/nextjs.yml)
[![codecov](https://codecov.io/gh/eugenius1/concurrent-counter-next/graph/badge.svg)](https://codecov.io/gh/eugenius1/concurrent-counter-next)

Shared counters that everyone sees change at the same time. Create one, send
its link to someone, press a button, and the number moves for both of you.

It runs at **<https://counter.eusebius.tech/>**. To run it
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
- The app name in the top left corner leads back to the homepage.
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

## Languages and appearance

The app is translated into the 20 most spoken languages in the world: English,
Mandarin Chinese, Hindi, Spanish, Arabic, French, Bengali, Portuguese,
Indonesian, Urdu, Russian, German, Japanese, Nigerian Pidgin, Egyptian Arabic,
Marathi, Vietnamese, Telugu, Swahili and Hausa.

It opens in your browser's language when that is one of them, and in English
otherwise. The translate button in the corner changes it, and the choice is
remembered on that device. Arabic, Egyptian Arabic and Urdu are laid out right
to left. A counter's link is the same in every language, so each person who
opens it sees it in their own.

The button next to it switches between light and dark, and follows your
system setting by default.

## Good to know

- There are no accounts. A counter you create isn't listed anywhere, but
  anyone who has its link can see and change it, so don't use it for anything
  that needs to be private or protected.
- The link is the only way back to a counter. Keep it, for example as a
  bookmark.
- Counters can't be renamed or deleted. Each is labelled with the last six
  characters of its id.
- The translations were not written by native speakers. Corrections are
  welcome.

## Status

Creating, sharing, increasing and decreasing counters with live updates all
work. Renaming, deleting and private counters are not planned yet.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to run it locally, how the live
updates work, and the traps to avoid. Coding agents should start at
[AGENTS.md](AGENTS.md).

## Licence

This program is free software: you can redistribute it and/or modify it under
the terms of the GNU General Public License as published by the Free Software
Foundation, either version 3 of the License, or (at your option) any later
version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY
WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
PARTICULAR PURPOSE. See the GNU General Public License for more details. You
should have received a copy of the licence along with this program — see
[LICENSE](LICENSE), or <https://www.gnu.org/licenses/>.
