# PUBLISH.md, the owner's checklist

Everything here needs repository-admin rights on github.com and none of it can be
done from this machine by an agent. Take the steps in order: step 1 makes the
repository public (D-041), steps 2 to 4 are the F-047 checklist that publication
triggers (M2-REVIEW.md section 4, TRIAGE.md section 4), and step 5 is the share
that K2 measures.

Repository: **https://github.com/HamzawithAI/firesky**

## 1. Make it public

1. Open **https://github.com/HamzawithAI/firesky/settings**.
2. Scroll to the bottom, to the red **Danger Zone** box.
3. On the **Change repository visibility** row, click **Change visibility**.
4. Choose **Make public**, then **I want to make this repository public**.
5. Read the two warnings it shows and tick both boxes. They are true: the code,
   every commit message and the whole `state/` ledger become world-readable, and
   forks cannot be made private again.
6. Type `HamzawithAI/firesky` in the confirmation field.
7. Click **I understand, make this repository public**.

Then check three things on the public page, in this order:

- The **Actions** tab shows the `evals` workflow, and its most recent run on
  `main` is green.
- `state/` renders, and `state/flags.md` shows seventeen open flags with owners.
- `README.md` opens with the ten-minute path and closes with the known limits.

## 2. Protect `main` and make the eval check required

This is the half of the M2 gate that has been deferred since 8 September. Until
it is done, CI reports on `main` but does not gate it.

1. Open **https://github.com/HamzawithAI/firesky/settings/rules** →
   **New ruleset** → **New branch ruleset**. (The older
   **Settings → Branches → Add branch protection rule** screen does the same
   job if you prefer it.)
2. **Ruleset name**: `main`.
3. **Enforcement status**: switch from Disabled to **Active**. A ruleset left
   disabled is the exact failure this step exists to end — it looks like a gate
   and stops nothing.
4. **Target branches** → **Add target** → **Include default branch**.
5. Under **Rules**, tick:
   - **Require a pull request before merging**. Set **Required approvals** to
     **0** — you are the only committer and a self-approval requirement would
     just teach you to click past it. Leave **Dismiss stale approvals** on.
   - **Require status checks to pass**. Click **Add checks**, search `eval`,
     and add **`eval suite`**. Add **`unit tests`**, **`typescript strict`**,
     **`fixture inventory matches the spec`** and
     **`the action validates this repository`** while you are there — all five
     are jobs of the same workflow and all five were green on `9fedce6`.
   - **Require branches to be up to date before merging**.
   - **Block force pushes**.
6. Click **Create**.

The check names must match the job names in `.github/workflows/evals.yml`
exactly. If a name does not appear in the search box, push one commit to a branch
and open a pull request first — GitHub only offers checks it has seen run.

## 3. Stop pushing to `main`

From here the build works on branches:

```bash
git checkout -b <branch>
# work, commit
git push -u origin <branch>
gh pr create --fill
```

Your ten-minute review happens on the pull request diff, which is the third
clause of the F-047 ruling. Merge with **Squash and merge** or **Rebase and
merge**; the append-only check compares `HEAD~1` against `HEAD`, so either is
fine, and a merge commit is fine too.

## 4. Close F-047

Once steps 2 and 3 are real, F-047's state no longer exists. Append a sign-off
naming it — `/signoff` is not built in v0.1, so write the entry by hand in
`state/signoffs.md`, next id `S-018`, `scope: [F-047]`, saying which ruleset
enforces which checks. Then `dsk validate .` and commit. Do not edit F-047 itself.

## 5. The share, and what it measures

PROJECT.md 8.4: publish the repository with one post. K2 reads the result —
at or above your median engagement, plus at least two inbound conversations. K1
is the other kill line and it is decided on **2026-09-23**, on whether you
reached for the kit unprompted in fintry.

Two things to be accurate about in the post, because the repository is:

- The cross-runtime claim is **one manual run on one non-Claude runtime**, and
  its S3 scenario passed on the second of two attempts. F-075 has the detail.
- Two validator rules need `git` present or they report nothing while the exit
  code stays 0. That is F-077, it is the first item in the README's known limits
  and the first item in v0.2.

## Not on this list

Publishing to npm. Nothing in v0.1's plan requires it, `npx` is documented
against the repository rather than the registry, and E7 cannot time the registry
fetch until it happens (F-076). When you do publish, that is when F-076 closes
and when the README's `npm install decision-state-kit` line becomes literally
true rather than true-after-substitution.
