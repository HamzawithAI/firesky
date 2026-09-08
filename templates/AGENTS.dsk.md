<!-- dsk:begin — decision state kit, R11 cross-runtime snippet. Paste this into
     AGENTS.md, .cursorrules, GEMINI.md, .github/copilot-instructions.md, or
     whatever file your runtime loads as standing instructions. Keep the
     markers so `dsk` can find and update the block later. -->

## Decision state (`state/`)

This project records its decisions in `state/`, as append-only markdown ledgers.
The files are the state; there is no database behind them.

```
state/decisions.md   D-###   what was decided, and why
state/flags.md       F-###   what is undecided, and who owns it
state/criteria.md    AC-###  what must be true to be done
state/signoffs.md    S-###   who approved what, and when
state/state.yaml             schema version and project metadata
```

**Read `state/` before you start work**, and say in one line what is locked and
what is open. `dsk status` prints it; otherwise read the ledgers.

### Three rules, and they are not negotiable

**1. Append and supersede. Never edit.** No committed line in any `state/` file
may change — not a status word, not a typo, not a date. A git-level check fails
the build on any in-place edit, so this is enforced and not merely requested. To
reverse decision `D-001`, leave it untouched and append a new decision naming it:

```
### D-012: Store dates as ISO week numbers instead
status: locked
date: 2026-09-08
owner: hamza
author: agent
model: <your exact model id>
links: [D-001]
supersedes: D-001

Reverses D-001. At most five lines of rationale.
```

**2. Write only through the schema, and never repair silently.** If a request
cannot be turned into a valid entry, write nothing and say what is missing. Do
not invent an owner, a date, a rationale, or an id. A request you do not
understand produces a question, not a plausible-looking entry.

**3. Status is derived, not written.** A decision is superseded only when a
later decision names it in `supersedes:`. A flag is resolved only when a sign-off
names it in `scope:`. A criterion is met only when a sign-off names it. The
`status:` line on a flag or a criterion is advisory — correct when written and
never updated since, because rule 1 forbids updating it. Never report a flag as
resolved because its own line says `resolved`.

### Entry formats

An entry is a `### ` heading, then `key: value` lines, then a blank line, then
optional prose. Line-oriented, no markdown beyond that. Ids are `D-`, `F-`, `S-`
or `AC-` plus exactly three zero-padded digits, permanent and never reused.

Decision, in `state/decisions.md`:

```
### D-001: Use TypeScript for the package
status: locked
date: 2026-09-07
owner: hamza
author: human
model: none
links: [PROJECT.md#6.1]
supersedes: none

Rationale, five lines maximum. Over five lines is a validation error.
```

`status` is `proposed` or `locked`, nothing else. `author` is `human` or
`agent`, and when it is `agent`, `model` must carry your exact model identifier,
never `none`.

Flag, in `state/flags.md`:

```
### F-001: Staleness window is 30 or 60 days, undecided
status: open
date: 2026-09-08
owner: hamza
raised-by: human
model: none
resolution: none
```

**A flag with no owner is not a flag.** If you have not been told who owns it,
ask and write nothing. Never write `tbd`, `unknown`, `none`, `team`, or an empty
owner: an unowned flag looks like tracked state and is nobody's job, which is
the failure this record exists to prevent.

Criterion, in `state/criteria.md`:

```
### AC-001: The validator catches every seeded error
status: open
scope: [D-001]
```

Sign-off, in `state/signoffs.md`. Appended only, and only on a human's explicit
instruction. An agent never signs off on its own work:

```
### S-001
actor: hamza
role: owner
date: 2026-09-08
scope: [D-001, AC-001]

What this approves.
```

### After any write

Run `dsk validate`. It exits 0 when clean, 1 when it finds errors, and it needs
no network and no API key. Fix findings by **appending**. If the only fix would
be an edit, stop and say so.

If a verifier disagrees with a decision, the only move is to open a flag with a
human owner. Never auto-resolve a disagreement.

<!-- dsk:end -->
