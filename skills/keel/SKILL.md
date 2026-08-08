---
name: keel
version: 1.1.0
description: Review and govern load-bearing software structure. Use for architecture or module-boundary design and review; changes to public APIs, persisted schemas, or cross-boundary contracts; structural refactors, migrations, or rewrite proposals; and audits of guards, exceptions, deprecation, deletion, or architecture debt. Derive topology, authority, and accountability from the repository's authoritative sources.
---

# Keel

Use *keel* for the repository's smallest load-bearing structure: the facts,
transitions, contracts, and ownership boundaries whose failure propagates.

Resolve repository authority first: project instructions, architecture routes,
focused owner documents, declared contracts, and executable guards. Use the
repository's terminology and topology; treat missing authority as an explicit
unknown.

For greenfield work, treat user goals, external constraints, and accepted
domain facts as authority. Propose the smallest viable ownership and topology
options, label them as design choices, and make the assumptions falsifiable.

Select the lenses below that can change the decision and omit the rest. When an
omission could reasonably look like an oversight, group the inapplicable lenses
under one short reason rather than manufacturing a checklist. Keel supplies
review questions and evidence requirements; it does not mint a parallel spine,
accountability map, contract vocabulary, or shared layer. Scale rigor by blast
radius and surface only the boundary decisions, evidence, unknowns, risks, and
trade-offs the user needs.

## Owns

- It owns the review vocabulary and evidence frame for identifying a
  repository-declared spine, concrete surface grades, authority and
  accountability models,
  dependency direction, negative and time paths, guards, and deletion paths.
- It owns the governance questions for guard health, exception baselines, rot
  indicators, deprecation, deletion, and rewrite containment.
- When a coding execution protocol is available, pair with it for change
  execution, implementation verification, and local work preservation. Keel
  remains useful without that peer and treats those concerns as outside scope.

## Does Not Own

- It does not define repository architecture truth, topology, terminology,
  ownership, or contract scope; authoritative project sources define them.
- It does not choose a named architecture style, framework, or tooling stack.
- It does not own change execution, implementation verification, or local work preservation.
- It does not prove implementation completeness, release readiness, security, compliance, or production fitness.
- It does not replace domain-specific policy, privacy, data, financial, medical, or legal review.
- It does not require a fixed document schema; each repository chooses how to make the invariants checkable.

## 1. Keep The Spine Small

Name the few load-bearing decisions: where inputs are accepted, facts become
authoritative, effects are authorized, and outcomes complete or recover. Work
that changes those decisions must cross a declared boundary.

A shared spine is not a shared execution topology. Multiple controllers,
transports, hosts, queues, plans, and strategies are legitimate when they
preserve the declared authority model and completion or recovery contracts. A
new authority or completion path outside that model is a redesign request:
name the blocker it solves, how it reconciles, and what existing path it
changes or retires.

Treat cross-cutting concerns as constraints on declared boundaries. They may have
dedicated owners and mechanisms, but those mechanisms do not become parallel
authority roots or bypass paths. Whether a concern becomes a module, service,
or user-visible mode comes from product and repository requirements, not Keel.
Add a top-level concept only when its scope and decision rights are explicit,
it fits no existing concept without distortion, and it passes the net-growth
review in Metabolize Or Rot.

## 2. Grade Every Surface

Not all code earns the same stability promise. Rank surfaces explicitly:

1. Public contracts and schemas — most expensive to change; versioned, migrated, never silently broken.
2. Declared cross-boundary interfaces — change with their accountable slice; consumers found by tooling.
3. Module internals — no stability promise; free churn behind behavior tests.
4. Assembly and wiring — reshape freely while the layers above stay stable.

The asymmetry is deliberate: internals must stay cheap to rewrite so contracts can afford to be expensive to change. A system where everything is a promise freezes; a system where nothing is a promise shatters.

Every new export, field, flag, or option is a promise someone will stand on. Default new things to the cheapest level that works, and treat any widening of a surface as a contract decision, not a convenience.

Any observable behavior with enough consumers becomes a de facto contract — error text, ordering, timing, and quirks included. Keep the deliberate contract minimal and written so the accidental contract stays small.

Grade each concrete port, record, schema, or export. Do not assign one scope or
stability level to an entire concept, mechanism, or accountability domain. A
private implementation and a declared cross-boundary contract may coexist at different
grades.

## 3. Declare Authority And Projections

For each fact and jurisdiction, declare the authority model. Use the simplest
model that satisfies the requirements rather than assuming either singularity
or federation. When authority is partitioned, replicated, quorum-based, or
multi-writer, define decision rights, merge or conflict rules, and recovery
instead of pretending the writers are interchangeable.

A cache, generated artifact, dashboard, transcript, or view derived from a fact
is a projection for that relation. If it carries an independent fact, declare
that fact and its authority separately. Change a derived artifact through its
declared source and regeneration path. For replicas, declare provenance,
freshness, and reconciliation; never leave overlapping authority ambiguous.

Layered validation is defense-in-depth only when each layer's responsibility is written down. Two layers checking the same thing without a written split is duplicated truth that will drift apart.

## 4. Make Ownership Explicit

Give every architectural fact, contract, boundary decision, and lifecycle an
explicit accountability model. Choose the simplest model supported by the
requirements; a single owner is common, not universal. When accountability is
joint or federated, name decision rights, partitions, tie-breakers or
escalation, and lifecycle responsibility. Consumers, collaborators, and
maintainers do not become owners merely by participating.

Follow the repository's declared dependency direction. Cross a boundary
through its declared public surface or assembly seam rather than another
domain's internals; the concrete shape may be an API, record, message,
callback, adapter, or another repository-native mechanism. Move a capability
into a shared domain only when its semantics are genuinely neutral and its
accountability belongs there; a need shared by two consumers is not
sufficient. Do not create a generic shared layer merely to satisfy an import
graph.

Design for deletability: keep cross-boundary entry surfaces bounded,
declared, and enumerable by tooling, so retirement is mechanical rather
than archaeological. What cannot be deleted cannot be replaced.

## 5. Design The Negative Path And The Time Axis

A design is not closed while a material negative outcome is undefined. For the
outcomes that can actually occur — denied, failed, partial, stale, cancelled,
or domain-specific alternatives — define behavior and a proportionate recovery
route. Mark impossible or immaterial outcomes inapplicable; do not invent state
machines for a reversible local change.

Decay lives in the seams and in time, not inside modules: components that are each individually correct still leak when composed along the time axis. For anything stateful, answer before closing the design: what happens when this runs twice, restarts halfway, or replays?

Classify effects by reversibility — reversible, compensable, irreversible —
and spend design rigor accordingly. When irreversible effects can be retried,
duplicated, or left uncertain, select appropriate controls such as
idempotency, confirmation, receipts, reconciliation, or explicit recovery.
Reversible local changes should not inherit that weight.

## 6. Guard Boundaries With Falsifiable Checks

A boundary that nothing checks is a suggestion. Lower architectural rules into machine-checked guards — import boundaries, schema validation, structural tests — wherever the rule matters.

A guard that cannot fail is wallpaper: prove it still detects a planted or
known violation. Track negative-control freshness separately from observed
real violations; a quiet but falsifiable guard is not dead merely because the
protected boundary has stayed clean.

Default exception baselines to shrink-only. When a necessary exception makes
the baseline grow, keep it narrow and make the change an explicit boundary
decision: record the decision authority, reason, date, and removal condition,
then update the baseline visibly. Delete stale exceptions, because every silent
"just this once" becomes precedent for the next. Escaping a guard by moving
code out of its scope is itself a boundary change and gets the same scrutiny
the guard enforces.

## 7. Keep The Governed Path Cheapest

If the compliant route costs more than the bypass, every deadline votes for the bypass. Selection beats discipline: the correct path must also be the easiest path, or it will lose to the workaround on every busy week.

A recurring bypass is pricing evidence, not just a discipline failure. Measure
the cost gap between the governed path and the workaround, then reduce friction
before or alongside durable enforcement — walls train climbers. An active or
imminent material safety, correctness, data-integrity, or release-integrity risk
may require narrow immediate containment; time-box it, name its decision
authority and exit condition, and continue making the governed path cheaper.

## 8. Metabolize Or Rot

Rot is entropy: it cannot be prevented, only metabolized faster than it accumulates. Long-lived systems survive by making change, migration, and deletion institutions, not heroics.

Budget concepts: a new noun, layer, or abstraction must remove more ambiguity
than it adds. In an existing system, name what it retires; if nothing retires,
declare the net concept growth, accountability, reason, and review date. In
greenfield work, compare each initial concept with a simpler omitted
alternative instead of inventing a retirement ledger. Nouns that only grow
without review are rot.

Retire deliberately, never abandon: close the active entry surface, let
tooling enumerate dependents, and preserve required behavioral evidence
outside the active implementation. Historical code informs behavior and risk;
it does not define the target topology.

Start a whole-system rewrite proposal by naming the smallest independently
replaceable slice and the contracts it preserves. Expand only when evidence
shows a bounded migration cannot close. Do not preserve compatibility for its
own sake when the repository has declared a clean target state (see Grade Every Surface).

Rules must carry their reasons. A rule whose reason is lost goes to review — not deleted in ignorance, not worshipped in fear. Architecture is enforced constraints multiplied by traceable reasons; either factor at zero zeroes the product.

## Reference

Read only when needed:

- `references/source-observations.md` — failure-mode mechanisms, provenance, and deliberate omissions; consult before retiring or adding a rule.
- `references/diagnostics.md` — task routes, design-review questions, and
  measurable rot indicators; consult for an architecture review, boundary
  change, structural refactor, or rot audit.
