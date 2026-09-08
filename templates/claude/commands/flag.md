---
description: Raise an open question in state/flags.md, append-only
---

Raise a flag in `state/flags.md`, following the dsk rules.

$ARGUMENTS

Do this:

1. Read `state/flags.md` and take the next free `F-###`, zero-padded.
2. **Append** the entry. Never edit an existing line.
3. Fields, all required: `status: open`, `date` (ISO), `owner` (a person),
   `raised-by` (`human` or `agent`), `model` (your exact model id when
   `raised-by: agent`, otherwise `none`), `resolution: none`.
4. **The owner is not optional.** If you have not been told who owns this, ask
   and write nothing until you are told. Never write `tbd`, `unknown`, `none`,
   `team`, or an empty owner. An unowned flag looks like tracked state and is
   nobody's job, which is the failure this record exists to prevent.
5. Never mark a flag resolved by editing it. A flag is resolved only when a
   sign-off names it in scope.
6. Run `dsk validate` afterwards and report the result.
