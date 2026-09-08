---
description: Record a decision in state/decisions.md, append-only
---

Record a decision in `state/decisions.md`, following the dsk rules.

$ARGUMENTS

Do this:

1. Read `state/decisions.md` and take the next free `D-###`, zero-padded, one
   above the highest that exists. Ids are permanent and never reused.
2. **Append** the entry. Never edit an existing line, including a status line.
   If this decision reverses an earlier one, do not touch that entry: name it in
   `supersedes:` on the new one.
3. Fields, all required: `status` (`proposed` or `locked`), `date` (ISO),
   `owner` (a person), `author` (`human` or `agent`), `model` (your exact model
   id when `author: agent`, otherwise `none`), `links`, `supersedes`.
4. Rationale prose after a blank line, **five lines maximum**.
5. If the owner is not stated and cannot be inferred, ask. Do not guess one.
6. If the request cannot be turned into a valid entry, write nothing and say
   what is missing.
7. Run `dsk validate` afterwards and report the result.
