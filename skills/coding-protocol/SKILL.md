---
name: coding-protocol
description: Risk-scaled execution protocol for code or configuration changes, bug fixes, debugging, refactors, code reviews, implementation plans, and Git mutations. Guards against silent assumptions, scope expansion, collateral edits, unverified claims, and silenced failures.
metadata:
  version: "1.2.2"
---

# Coding Protocol

A low-friction protocol for reliable coding work. Apply it in the background and surface only decisions, blockers, verification, or risks the user actually needs.

Repository evidence supplies current local facts; repository instructions and
contracts supply required checks. A focused workflow supplies its domain
method, artifact, and completion criterion. This protocol adds only execution
constraints: authorization, action scope, work preservation, environment
assumptions, evidence integrity, and truthful reporting. Combine them by
concern; loading one does not supersede the others or grant new authority.

If no focused workflow applies, continue from repository evidence with the
narrowest safe method. For multi-step work, adopt the task's or focused
workflow's completion criterion; if none exists, name an observable one. Think
in terms of `[change] -> [check]`, revise the route when evidence changes, and
expose a plan only when it clarifies risk, coordination, or sequencing.

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

Match action to authority granted by the user and host. A request to explain,
review, diagnose, or report does not authorize implementation. A request to
fix, build, or change authorizes only the in-scope workspace mutation. Loading
or invoking a skill grants no additional authority. A workflow's instruction
to commit, push, deploy, publish, send externally, or change machine-wide state
counts only when that side effect is separately authorized by the user or
host. Its method, artifact, and completion requirements remain applicable
within the authorized task.

Use the narrowest reasonable interpretation for low-risk ambiguity and move forward.

Ask only when ambiguity affects correctness, safety, external behavior, user intent, irreversible work, or a high-risk area (see Scale By Risk).

If a requested mechanism conflicts with observed evidence, show the mismatch
before implementing. Do not blindly comply, but do not silently substitute a
different material outcome or mechanism either; resolve the intent when the
difference matters.

When no user is available to answer (unattended or scheduled runs), material ambiguity does not downgrade to a guess: park the ambiguous item — skip it, report it, or queue it for review — and proceed only with the unambiguous remainder.

When proceeding under uncertainty, keep the change reversible and local.

## 4. Keep Changes Small

Write the smallest complete change consistent with the authorized request,
repository contracts, and focused workflow. Match local style and existing
patterns.

Every changed line should trace to one of those sources: no unrequested features,
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

Run checks required by the user, repository, or focused workflow. Within those
requirements, and for any additional evidence, prefer the cheapest check that
gives real confidence proportional to risk.

A passing check proves the changed behavior only if it exercises or
meaningfully covers the changed path. Run policy-required checks even when
they are not that proof, and label the distinction.

At the seam selected by the task, repository, or focused workflow, prefer a
check of stable observable behavior. A check coupled only to an incidental or
private implementation representation is not behavioral proof. Treat the
representation itself as evidence only when it is a documented contract or
guard target; state that contract and keep the claim scoped to it.

Get to green honestly. Do not hide a failing signal with loosened assertions,
skipped tests, unjustified suppressions, or code moved out of a check's scope.
Use a suppression only when the boundary genuinely requires it, state the
reason at the site, and report the residual debt.

A new or changed check offered as evidence for the task must be able to fail.
Establish sensitivity with the pre-fix failure, a targeted mutation or planted
violation, or another credible negative control. Never disturb unrelated user
work merely to manufacture that proof; if a safe negative control is blocked,
report the non-proof. Derive expected behavior from the request, a repository
contract, or an explicit characterization goal. Do not copy current output
into assertions and present it as intended behavior; that can lock in the bug
the check should catch.

When a check fails, diagnose before widening the change. Widen only when new
evidence expands the cause. If attempts keep failing or reversing direction,
stop implementation and report the diagnosis, what was tried, and the
remaining failure.

If verification is skipped, blocked, or fails, say so directly and report the remaining risk.

## 8. Report Only What Matters

Produce the artifact, detail, and handoff required by the task or focused
workflow, and follow host-required progress and approval communication. Within
that form, report truthfully what was concluded or changed, what was verified,
and what remains unverified, blocked, or risky. When no richer artifact is
required, keep the final response brief and concrete.

Before reporting done, re-check the primary completion criterion and the
original request item by item against what was delivered. A requirement that
was dropped, deferred, or reinterpreted is reported, not silently absorbed.

Do not narrate routine internal process unless the required artifact calls for
it or it affects the user. Do not overstate confidence.

## Reference

Before changing or auditing this protocol's rules, read
`references/source-observations.md` and keep every failure-mode-to-section
mapping accurate. Do not load it for routine coding tasks.
