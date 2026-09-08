# Decisions

### D-001: First position on storage
status: locked
date: 2026-09-01
owner: hamza
author: human
model: none
links: [PROJECT.md#3]
supersedes: none

Baseline decision for this fixture tree.

### D-002: Second position on storage
status: locked
date: 2026-09-01
owner: hamza
author: human
model: none
links: [PROJECT.md#3]
supersedes: D-001

Baseline decision for this fixture tree.

### D-003: Final position on storage
status: locked
date: 2026-09-01
owner: hamza
author: human
model: none
links: [PROJECT.md#3]
supersedes: D-002

Baseline decision for this fixture tree.

### D-004: Build on the final storage position
status: locked
date: 2026-09-01
owner: hamza
author: human
model: none
links: [D-003]
supersedes: none

Baseline decision for this fixture tree.

### D-005: Interim position on the ledger grammar
status: locked
date: 2026-09-01
owner: hamza
author: human
model: none
links: [PROJECT.md#3]
supersedes: none

Baseline decision for this fixture tree.

### D-006: Corrected position on the ledger grammar
status: locked
date: 2026-09-01
owner: hamza
author: human
model: none
links: [D-005]
supersedes: D-005

Supersedes D-005 and links it from the same entry, which D-035 exempts from
ERR_STALE_REF. This is the pattern the shipped supersede recipe produced and
the validator rejected until D-035 (F-066).
