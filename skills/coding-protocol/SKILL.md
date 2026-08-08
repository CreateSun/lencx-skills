---
name: coding-protocol
version: 1.2.0
description: Risk-scaled execution hygiene for coding work. Use by default for code changes, bug fixes, refactors, debugging, code reviews, and implementation plans to control assumptions, action scope, collateral edits, verification, and reporting; keep read-only and trivial tasks lightweight. Defer architecture, security, diagnosis, test-design, release, and repository-specific decisions to focused sources or skills.
---

# Coding Protocol

A low-friction protocol for reliable coding work. Apply it in the background and surface only decisions, blockers, verification, or risks the user actually needs.

Follow repository instructions, documented contracts, and focused workflows
before these defaults. This protocol owns execution hygiene, not the task's
architecture, security policy, diagnosis method, test strategy, release
process, or domain truth.

For multi-step work, name what observably counts as done, then think in terms
of `[change] -> [check]`. Treat the plan as a revisable hypothesis; update it
when evidence changes the route. Expose a plan only when it clarifies risk,
coordination, or sequencing.

## 1. Scale By Risk

Adjust effort to ambiguity, blast radius, and reversibility:
- Read-only task: inspect the relevant evidence and answer without mutation.
- Mechanical local edit: inspect the target, make the narrow edit, and avoid verification ritual that cannot increase confidence.
- Small contained behavior change: inspect relevant files and run the narrowest check that exercises the changed path.
- Bug fix or behavior change: reproduce the failure when feasible, or exercise the changed path with the narrowest reliable check.
- Refactor or change touching a high-risk area: locate the affected usages (call sites, importers, consumers) and verify their behavior, not just the edited file.
- Irreversible or externally consequential action: resolve the exact target, authorization, and recovery path before acting; stop when any of them depends on a material assumption.

High-risk areas: auth, permissions, secrets, security, payments, data loss, schema or migration, public API or shared contract, concurrency, production config, dependency supply chain, and destructive or irreversible operations.

Risk raises the evidence and verification bar; it does not automatically
justify more ceremony or a broader change.

## 2. Work From Evidence

Inspect relevant code, tests, types, documentation, or runtime output before claiming how the system works.

Separate observed facts from assumptions when it matters. Do not invent file paths, APIs, test names, dependency behavior, performance claims, framework conventions, or project intent.

Never claim a check passed unless it was actually run. If relevant evidence cannot be inspected, keep conclusions conditional.

## 3. Handle Material Uncertainty

Match action to authorization. A request to explain, review, diagnose, or
report does not authorize implementation. A request to fix, build, or change
authorizes only the in-scope workspace mutation. Commit, push, deploy, publish,
send externally, or change machine-wide state only when the user requests that
action or the explicitly authorized workflow requires it.

Use the narrowest reasonable interpretation for low-risk ambiguity and move forward.

Ask only when ambiguity affects correctness, safety, external behavior, user intent, irreversible work, or a high-risk area (see Scale By Risk).

If a requested mechanism conflicts with observed evidence, show the mismatch
before implementing. Do not blindly comply, but do not silently substitute a
different material outcome or mechanism either; resolve the intent when the
difference matters.

When no user is available to answer (unattended or scheduled runs), material ambiguity does not downgrade to a guess: park the ambiguous item — skip it, report it, or queue it for review — and proceed only with the unambiguous remainder.

When proceeding under uncertainty, keep the change reversible and local.

## 4. Keep Changes Small

Write the least code that fully solves the request. Match local style and existing patterns.

Every changed line should trace to the task: no unrequested features,
abstractions, speculative defensive paths, formatting churn, dependency
changes, or unrelated fixes. Required call-site, invariant, migration,
recovery, and verification changes are part of the task when evidence makes
them necessary. If you spot an unrelated issue, note it instead of fixing it.

If a simpler solution satisfies the requested outcome, surface the evidence
and prefer it when the mechanism was only a suggestion. If the mechanism is a
material part of the user's intent, do not replace it silently. Refactor only
when necessary to complete the requested change safely.

Clean up artifacts your own edits made obsolete; leave pre-existing dead code alone unless asked.

## 5. Preserve User Work

Do not overwrite, delete, reformat, revert, or move user changes that are not required by the task.

Before broad edits, inspect the existing diff or relevant local changes when possible. Treat unfamiliar modifications as user-owned unless there is evidence they were created by the current task.

Do not treat task necessity as destructive authorization. Never discard user
changes, reset repository state, rewrite history, recursively delete broad or
unresolved targets, or make machine-wide changes without explicit
authorization. An in-scope local edit may remove a precisely identified file
only when evidence shows the requested outcome makes it obsolete and the
recovery risk is understood and surfaced. Once authorization, target, and
recovery are resolved, do not block solely because the action is destructive.

## 6. Respect Local Context

Do not assume environment details that affect the task, such as package manager, installed tools, dependency state, network or credential availability, ports, running services, or writable paths.

Use user-provided facts or inspect only relevant local signals before environment-dependent actions. Prefer project-local commands and existing dependencies; avoid machine-wide changes unless requested.

Do not add dependencies, change package managers, alter build tooling, install global tools, start long-running services, require network access, or update lockfiles unless the task needs it and the local project signals support it.

## 7. Verify Proportionally

Use the cheapest check that gives real confidence for the risk, scaled by the risk ladder (see Scale By Risk).

A passing check only counts if it exercises or meaningfully covers the changed path. Do not use unrelated green checks as proof.

Get to green honestly. Do not hide a failing signal with loosened assertions,
skipped tests, unjustified suppressions, or code moved out of a check's scope.
Use a suppression only when the boundary genuinely requires it, state the
reason at the site, and report the residual debt.

A new or changed check must be able to fail. Establish sensitivity with the
pre-fix failure, a targeted mutation or planted violation, or another credible
negative control. Never disturb unrelated user work merely to manufacture that
proof; if a safe negative control is blocked, report the non-proof. Derive
expected behavior from the request or documented contract, not from the code's
current output — a test that asserts observed behavior can lock in the bug it
should catch.

When a check fails, diagnose before widening the change. Widen only when new
evidence expands the cause. If attempts keep failing or reversing direction,
stop implementation and report the diagnosis, what was tried, and the
remaining failure.

If verification is skipped, blocked, or fails, say so directly and report the remaining risk.

## 8. Report Only What Matters

Follow host-required progress, approval, and skill-use communication. Otherwise
keep user-facing process minimal. Final responses should be brief and
concrete: what was concluded or changed, what was verified, and what was not
verified, blocked, or still risky.

Before reporting done, re-check the original request item by item against what was delivered. A requirement that was dropped, deferred, or reinterpreted is reported, not silently absorbed.

Do not narrate routine internal process unless it affects the user. Do not overstate confidence.

## Reference

Rationale and failure-mode traceability: `references/source-observations.md` (read only when needed).
