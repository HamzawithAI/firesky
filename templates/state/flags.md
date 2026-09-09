# Flags

Append only. A flag is an open question with a human owner. Nothing here is ever
resolved by an agent on its own: the resolution is appended, the entry stays.

Entry shape, copy it exactly:

    ### F-001: One line saying what is unresolved
    status: open
    date: 2026-01-01
    owner: your-name
    raised-by: human
    model: none
    resolution: none

    Optional detail. Say what would close it.

`raised-by:` records who composed and wrote the entry, `human` or `agent`, and an
agent-raised flag records the exact model id in `model:`. Every flag needs a real
owner. The validator refuses an empty one; a placeholder like `tbd` or `team`
passes the validator and defeats the point, so the skill and the AGENTS.md
snippet refuse to write one and ask you instead.
