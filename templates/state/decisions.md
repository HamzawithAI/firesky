# Decisions

Append only. Never edit a committed entry: to change a decision, append a new one
whose `supersedes:` names the old id. Ids are permanent and never reused.

Entry shape, copy it exactly:

    ### D-001: One line saying what was decided
    status: proposed
    date: 2026-01-01
    owner: your-name
    author: human
    model: none
    links: []
    supersedes: none

    Why, in at most five lines. The limit is the point: an entry that needs more
    is a document, and a document is not a decision.

`status:` is `proposed`, `locked` or `superseded-by-D-###`. `author:` is `human`
or `agent`, and an agent-authored entry records the exact model id in `model:`.
