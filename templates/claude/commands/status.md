---
description: Report the project's derived decision state
---

Report this project's decision state.

Run `dsk status` and report exactly what it says: decisions current and
superseded, flags open and resolved, criteria met and open, plus any warnings.

Every status it prints is **derived** from pointers, never read off an entry: a
decision is superseded only when a later decision names it, a flag is resolved
only when a sign-off names it, a criterion is met only when a sign-off names it.
Where a written status word disagrees with the derived one, report the derived
answer and mention the disagreement — it is information, not an error.

Do not infer counts from prose, from memory, or from a status line. If `dsk` is
not installed, count the `### ` headings in each ledger and say that you counted
by hand.

Write nothing to `state/`. This command is read-only.
