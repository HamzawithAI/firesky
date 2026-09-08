/**
 * `dsk render`, the static read-only HTML view (PROJECT.md 6.2).
 *
 * Explicitly not the rung 5 bridge: it is a cheap concession to human readers,
 * one self-contained file with no script, no external asset and no build step,
 * so it can be dropped on GitHub Pages as it is. Nothing here writes to
 * `state/`; the ledgers stay the substrate (law 1).
 *
 * Everything derived is derived, never read off the entry: a decision is
 * superseded only if a later one names it (D-021), a flag is resolved only if a
 * sign-off names it (D-025), a criterion is met only if a sign-off names it
 * (D-027). Where a status word disagrees with the derivation the page shows
 * both, because the disagreement is information — it is exactly what F-005 to
 * F-024 look like in this repository's own ledger.
 *
 * The page is also one of the two surfaces M2-REVIEW.md section 2.2 requires
 * for the criteria stale-scope warning, the signal that survived when
 * ERR_STALE_REF stopped being a brick on criteria.
 */
import {
  field,
  metCriteria,
  resolvedFlags,
  staleScopeWarnings,
  supersededBy,
  supersededDecisions,
} from "./rules/helpers.js";
import type { Entry, Tree } from "./types.js";

const ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

/** Ledger text is authored markdown, not trusted HTML. */
function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (c) => ESCAPES[c] ?? c);
}

const STYLE = `
:root { color-scheme: light dark; --fg: #16181d; --bg: #fbfbfa; --muted: #6b7280;
        --line: #e3e3e0; --card: #ffffff; --accent: #1f6feb; --stale: #9a3412; }
@media (prefers-color-scheme: dark) {
  :root { --fg: #e6e6e3; --bg: #16181d; --muted: #9ca3af; --line: #2c2f36;
          --card: #1c1f26; --accent: #6ea8fe; --stale: #fdba74; }
}
* { box-sizing: border-box; }
body { margin: 0; background: var(--bg); color: var(--fg); font: 15px/1.55 ui-sans-serif,
       -apple-system, "Segoe UI", Roboto, sans-serif; }
main { max-width: 62rem; margin: 0 auto; padding: 2rem 1.25rem 5rem; }
h1 { font-size: 1.5rem; margin: 0 0 .25rem; letter-spacing: -.01em; }
h2 { font-size: 1.05rem; margin: 2.5rem 0 .75rem; padding-bottom: .4rem;
     border-bottom: 1px solid var(--line); }
.sub { color: var(--muted); margin: 0 0 1.5rem; font-size: .9rem; }
.entry { background: var(--card); border: 1px solid var(--line); border-radius: 8px;
         padding: .85rem 1rem; margin: .6rem 0; }
.entry h3 { font-size: .95rem; margin: 0 0 .4rem; font-weight: 600; }
.entry h3 .id { color: var(--accent); font-family: ui-monospace, SFMono-Regular, monospace; }
dl { display: grid; grid-template-columns: max-content 1fr; gap: .1rem .75rem;
     margin: 0; font-size: .82rem; color: var(--muted); }
dt { font-family: ui-monospace, SFMono-Regular, monospace; }
dd { margin: 0; overflow-wrap: anywhere; }
.prose { margin: .6rem 0 0; font-size: .88rem; white-space: pre-wrap; }
.tags { margin-top: .5rem; display: flex; flex-wrap: wrap; gap: .35rem; }
.tag { font-size: .72rem; padding: .1rem .45rem; border: 1px solid var(--line);
       border-radius: 999px; color: var(--muted); }
.tag.derived { border-color: var(--accent); color: var(--accent); }
.tag.warn { border-color: var(--stale); color: var(--stale); }
.empty { color: var(--muted); font-style: italic; font-size: .9rem; }
footer { margin-top: 3rem; padding-top: 1rem; border-top: 1px solid var(--line);
         color: var(--muted); font-size: .8rem; }
`;

interface Tag {
  readonly text: string;
  readonly cls: string;
}

function fieldRows(entry: Entry): string {
  const rows = [...entry.fields.entries()]
    .map(([key, f]) => `<dt>${escapeHtml(key)}</dt><dd>${escapeHtml(f.value)}</dd>`)
    .join("");
  return rows === "" ? "" : `<dl>${rows}</dl>`;
}

function renderEntry(entry: Entry, tags: readonly Tag[]): string {
  const heading = entry.title === "" ? entry.id : `${entry.id}: ${entry.title}`;
  const [id, ...rest] = heading.split(":");
  const title = rest.join(":");
  const tagHtml =
    tags.length === 0
      ? ""
      : `<div class="tags">${tags.map((t) => `<span class="tag ${t.cls}">${escapeHtml(t.text)}</span>`).join("")}</div>`;
  const prose =
    entry.prose.length === 0 ? "" : `<p class="prose">${escapeHtml(entry.prose.join("\n"))}</p>`;
  return (
    `<article class="entry"><h3><span class="id">${escapeHtml(id ?? "")}</span>` +
    `${title === "" ? "" : escapeHtml(`:${title}`)}</h3>` +
    fieldRows(entry) +
    tagHtml +
    prose +
    `</article>`
  );
}

function section(title: string, entries: readonly Entry[], tagsFor: (e: Entry) => Tag[]): string {
  const body =
    entries.length === 0
      ? `<p class="empty">No entries.</p>`
      : entries.map((e) => renderEntry(e, tagsFor(e))).join("");
  return `<h2>${escapeHtml(title)} <span class="empty">(${entries.length})</span></h2>${body}`;
}

export function render(tree: Tree, project: string): string {
  const superseded = supersededDecisions(tree);
  const supersededByMap = supersededBy(tree);
  const resolved = resolvedFlags(tree);
  const met = metCriteria(tree);
  /* Grouped by the criterion that carries them, so a criterion with two stale
     scope members shows two tags on its own card rather than a list elsewhere. */
  const warningsFor = new Map<string, string[]>();
  for (const w of staleScopeWarnings(tree)) {
    const rows = warningsFor.get(w.id) ?? [];
    rows.push(`scope names ${w.member}, superseded by ${w.superseded_by}`);
    warningsFor.set(w.id, rows);
  }
  const of = (kind: Entry["kind"]) => tree.entries.filter((e) => e.kind === kind);

  const decisionTags = (e: Entry): Tag[] => {
    const tags: Tag[] = [{ text: superseded.has(e.id) ? "superseded" : "current", cls: "derived" }];
    const by = supersededByMap.get(e.id);
    if (by !== undefined) tags.push({ text: `superseded by ${by}`, cls: "derived" });
    return tags;
  };

  const flagTags = (e: Entry): Tag[] => {
    const isResolved = resolved.has(e.id);
    const tags: Tag[] = [{ text: isResolved ? "resolved" : "open", cls: "derived" }];
    if (isResolved) {
      const by = tree.entries
        .filter((x) => x.kind === "signoff" && (field(x, "scope") ?? "").includes(e.id))
        .map((x) => x.id);
      if (by.length > 0) tags.push({ text: `closed by ${by.join(", ")}`, cls: "derived" });
    }
    const written = field(e, "status");
    if (written !== undefined && written !== (isResolved ? "resolved" : "open")) {
      tags.push({ text: `written status: ${written}`, cls: "warn" });
    }
    return tags;
  };

  /* D-027: met iff a sign-off names it. `dropped` has no derivation in v0.1 and
     is shown as the advisory it is, which is why a dropped criterion reads
     "open" here with its written word beside it (F-050). */
  const criterionTags = (e: Entry): Tag[] => {
    const isMet = met.has(e.id);
    const tags: Tag[] = [{ text: isMet ? "met" : "open", cls: "derived" }];
    if (isMet) {
      const by = tree.entries
        .filter((x) => x.kind === "signoff" && (field(x, "scope") ?? "").includes(e.id))
        .map((x) => x.id);
      if (by.length > 0) tags.push({ text: `met by ${by.join(", ")}`, cls: "derived" });
    }
    const written = field(e, "status");
    if (written !== undefined && written !== (isMet ? "met" : "open"))
      tags.push({ text: `written status: ${written}`, cls: "warn" });
    for (const w of warningsFor.get(e.id) ?? []) tags.push({ text: w, cls: "warn" });
    return tags;
  };

  const counts = tree.counts;
  return (
    `<!doctype html><html lang="en"><head><meta charset="utf-8">` +
    `<meta name="viewport" content="width=device-width, initial-scale=1">` +
    `<title>${escapeHtml(project)} decision state</title><style>${STYLE}</style></head><body><main>` +
    `<h1>${escapeHtml(project)} decision state</h1>` +
    `<p class="sub">${counts.decisions} decisions, ${counts.flags} flags, ${counts.criteria} criteria, ` +
    `${counts.signoffs} sign-offs. Read-only. Every status shown as <em>derived</em> is computed from ` +
    `pointers, never read off the entry: a decision is superseded only when a later one names it (D-021), ` +
    `a flag is resolved only when a sign-off names it (D-025), a criterion is met only when a sign-off ` +
    `names it (D-027).</p>` +
    section("Decisions", of("decision"), decisionTags) +
    section("Flags", of("flag"), flagTags) +
    section("Acceptance criteria", of("criterion"), criterionTags) +
    section("Sign-offs", of("signoff"), () => []) +
    `<footer>Generated by <code>dsk render</code> from <code>state/</code>. ` +
    `The ledgers are the source; this page is a view and is never written back (law 1).</footer>` +
    `</main></body></html>`
  );
}
