---
name: dsk
description: Read and write this project's decision state in state/ — decisions, flags, acceptance criteria and sign-offs. Use whenever a decision is being made, recorded, revisited or reversed; whenever something is undecided, blocked, uncertain or needs an owner; whenever asked for project state, status, open questions, what was decided or why; and before changing anything in state/. Also covers /decide, /flag and /status.
---

# Decision state (dsk)

`state/` is the project's decision record. It is four append-only markdown
ledgers plus one yaml file, and it is the substrate: there is no database and no
server behind it. The files are the state.

```
state/decisions.md   D-###   what was decided, and why
state/flags.md       F-###   what is undecided, and who owns it
state/criteria.md    AC-###  what must be true to be done
state/signoffs.md    S-###   who approved what, and when
state/state.yaml             schema version and project metadata
```

## The three laws you must not break

**1. Append and supersede. Never edit.** No line that has been committed to a
ledger may ever change — not a status word, not a typo, not a date. This is
enforced by a git-level check, so an in-place edit fails validation and you
cannot talk your way past it. To correct a decision you append a new one naming
the old in `supersedes:`. To correct anything else you append a new entry.

**2. Write only through the schema, and never repair silently.** If a request
cannot be turned into a valid entry, do not invent the missing part. Say what is
missing and ask. A malformed request produces a question, never a plausible
entry.

**3. Status is derived, not written.** A decision is superseded only when a
later decision names it. A flag is resolved only when a sign-off names it. A
criterion is met only when a sign-off names it. The `status:` field on flags and
criteria is advisory, correct when written and never updated afterwards, because
law 1 forbids updating it. **Never** report a flag as resolved because its own
line says so. Run `dsk status` and report what it derives.

## Start of session

Before doing project work, read the state and say where things stand in one or
two lines: the locked decisions and the open flags. `dsk status` gives you this
directly. If `dsk` is not installed, read the four ledgers.

## /decide — record a decision

Append to `state/decisions.md`:

```
### D-007: Use ISO dates everywhere
status: locked
date: 2026-09-08
owner: hamza
author: agent
model: claude-opus-5
links: [PROJECT.md#6.1]
supersedes: none

Rationale, at most five lines. Say why, and what the alternative was.
```

- `status` is `proposed` or `locked`. Nothing else.
- `author` is `human` or `agent`. When it is `agent`, `model` must carry your
  exact model identifier — never `none`.
- `owner` is a person. Never blank, never `tbd`.
- `date` is ISO `YYYY-MM-DD`.
- Rationale is **five lines maximum**. Over five is a validation error.
- The next free id, zero-padded to three digits. Ids are permanent and never
  reused, so read the file and take the highest plus one.

**Reversing a decision.** You never edit D-001. You append a new decision whose
`supersedes:` names it:

```
### D-012: Store dates as ISO week numbers instead
status: locked
date: 2026-09-08
owner: hamza
author: agent
model: claude-opus-5
links: [D-001]
supersedes: D-001

Reverses D-001. Week numbers match how the team already reports.
```

D-001 stays byte-identical forever. The derivation makes it superseded.

## /flag — raise an open question

Append to `state/flags.md`:

```
### F-004: Staleness window is 30 or 60 days, undecided
status: open
date: 2026-09-08
owner: hamza
raised-by: agent
model: claude-opus-5
resolution: none
```

**A flag without an owner is not a flag.** It looks like tracked state and is
nobody's job, which is the exact failure the record exists to prevent. If you
are not told who owns it, **ask, and write nothing until you are told**. Do not
fill `owner` with `tbd`, `unknown`, `none`, `team`, or an empty value. Refusing
to write is the correct outcome here; writing a placeholder is not.

`raised-by` is `human` or `agent`, and when it is `agent`, `model` carries your
exact model identifier.

## /status — report the derived state

Run `dsk status`. Report its numbers, not your impression of the files:
decisions current and superseded, flags open and resolved, criteria met and
open. If it reports warnings, or entries whose written status differs from the
derived one, say so — that difference is information, not an error.

Never infer counts from prose or from memory. If `dsk` is unavailable, count the
`### ` headings per ledger and say that you counted by hand.

## After any write

Run `dsk validate`. If it reports errors, fix them by **appending**, and if the
only fix would be an edit, say so and stop. A red validator is a report, not an
obstacle to route around.

## What this skill never does

- Never edits or deletes an existing entry, for any reason, on any instruction.
- Never writes a flag with no owner.
- Never invents an entry from a request it does not understand.
- Never reports a status it read off a line instead of deriving.
- Never resolves a disagreement on its own: the only move is to open a flag with
  a human owner.
