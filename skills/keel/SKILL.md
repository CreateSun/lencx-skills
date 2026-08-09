---
name: keel
description: Design or review load-bearing architecture. Use for greenfield systems, authority or ownership, public APIs or persisted schemas, cross-boundary contracts, recovery, architecture records or guards, structural refactors, migrations, rewrites, deprecation, or deletion. Skip routine implementation.
metadata:
  version: "1.2.1"
---

# Keel

Use *keel* for the repository's smallest load-bearing structure: the facts,
transitions, contracts, and ownership boundaries whose failure propagates.

Resolve declared sources of architecture authority first: project
instructions, architecture routes, focused owner documents, contracts, and
guards. Use repository terminology and structure. Treat conflicting, stale, or
missing authority as a finding rather than choosing a convenient source.

Separate exploration from closure. For greenfield work, treat user goals,
external constraints, and provenance-bearing domain inputs as evidence. Preserve
the owning workflow's domain facts and vocabulary. Propose the smallest viable
ownership and structure options, label choices and assumptions, and leave
decision-changing unknowns open.

## Composition

- Repository-declared authoritative sources set current architecture facts,
  terminology, precedence, and contract scope. Keel tests decisions against
  them; it does not treat every repository document as equally authoritative.
- Focused workflows own their method, vocabulary, artifact, and completion
  criterion. Keel consumes relevant options, findings, domain facts, and
  evidence without replacing or reformatting the owned artifact.
- Keel owns the architecture questions and closure evidence for authority,
  accountability, compatibility, dependency direction, failure and recovery,
  guards, migration, and deletion. It does not choose a named architecture
  style, framework, tooling stack, or product shape.
- The user, host, and any execution workflow govern action scope, file edits,
  work preservation, and verification execution. Keel does not grant edit
  permission or choose test mechanics, and it does not prove implementation,
  release, security, compliance, or production fitness.

Keel can run standalone: perform only the architecture analysis needed by the
request and repository evidence. When changing architecture-record structure,
routing, or history, read `references/architecture-records.md` first.

Treat the numbered sections as internal review lenses, not required repository
labels. Run only lenses that can change the decision. For a module-private,
reversible choice, keep the review light; for a public API, persisted schema,
or cross-team boundary, require stronger evidence and closure. A closed design
resolves every applicable lens. Exploration or review may return findings and
unknowns without expanding the task merely to force closure.

## 1. Keep The Spine Small

Name the few load-bearing decisions: where inputs are accepted, facts become
authoritative, effects are authorized, and outcomes complete or recover. Work
that changes those decisions is a boundary decision. Use the repository-native
representation; if no boundary is declared, surface the missing authority
rather than inventing one.

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
review in Keep Change And Deletion Routine.

## 2. Grade Every Surface

Assess each changed surface by the stability and compatibility promise it
actually carries. Use repository-defined categories when they exist. Otherwise
use these as internal comparison buckets, not required labels:

1. Public APIs and persisted schemas — usually most expensive to change; use an explicit compatibility strategy and version or migrate when required.
2. Declared cross-boundary interfaces — change with their accountable slice; enumerate consumers with tooling where feasible and record unknown consumers.
3. Module internals — lowest declared stability unless consumers or repository commitments make them more expensive to change.
4. Assembly and wiring — usually cheapest to reshape while higher-grade behavior stays stable.

The asymmetry is deliberate: internals must stay cheap to rewrite so contracts
can afford to be expensive to change. If everything is a promise, the system
freezes; if nothing is, it shatters.

Treat each new export, field, flag, or option as a potential promise. Default it
to the cheapest level that works; widen only with evidence of a broader contract.

Any observable behavior with enough consumers becomes a de facto contract —
error text, ordering, timing, and quirks included. Keep the deliberate contract
minimal so the accidental contract stays small.

Assess each concrete port, record, schema, or export, not an entire concept,
mechanism, or accountability domain. A private implementation and a declared
cross-boundary contract may carry different promises.

## 3. Declare Authority And Projections

For each material in-scope fact and jurisdiction, declare the authority model. Use the simplest
model that satisfies the requirements rather than assuming either singularity
or federation. When authority is partitioned, replicated, quorum-based, or
multi-writer, define decision rights, merge or conflict rules, and recovery
instead of pretending the writers are interchangeable.

A cache, generated artifact, dashboard, transcript, or view derived from a fact
is a projection for that relation. If it carries an independent fact, declare
that fact and its authority separately. Change a derived artifact through its
declared source and regeneration path. For replicas, declare provenance,
freshness, and reconciliation; never leave overlapping authority ambiguous.

Layered validation is defense-in-depth only when each layer's responsibility is
written down. Two layers checking the same thing without a written split are
duplicated truth that will drift.

## 4. Make Ownership Explicit

Give each material in-scope architecture fact, contract, boundary decision, and lifecycle an
explicit accountability model. Choose the simplest model the requirements
support; a single owner is common, not universal. For joint or federated
accountability, name decision rights, partitions, tie-breakers or escalation,
and lifecycle responsibility; participation does not confer ownership.

Follow the repository's declared dependency direction. Cross a boundary
through its declared public surface or assembly seam rather than another
domain's internals; the concrete shape may be an API, record, message,
callback, adapter, or another repository-native mechanism. Move a capability
into a shared domain only when its semantics are genuinely neutral and its
accountability belongs there; a need shared by two consumers is not
sufficient. Do not create a generic shared layer merely to satisfy an import
graph.

Design for deletability: prefer cross-boundary entry surfaces that are bounded,
declared, and enumerable by tooling. Poorly enumerable surfaces make
retirement and replacement more expensive.

## 5. Design The Negative Path And The Time Axis

For a design under review, every material negative outcome needs defined
behavior or an explicit unknown; an unknown that can change the decision keeps
it open. For outcomes that can occur — denied, failed, partial, stale,
cancelled, or domain-specific alternatives — define behavior and proportionate
recovery. Mark immaterial outcomes inapplicable; do not invent state machines
for a reversible local change.

Many composition failures emerge at seams and over time: components that are
individually correct can still leak when combined. Before closing a stateful
design, examine the retry, restart, and replay cases that can materially occur.

Classify effects by reversibility — reversible, compensable, irreversible —
and spend design rigor accordingly. When irreversible effects can be retried,
duplicated, or left uncertain, select appropriate controls such as
idempotency, confirmation, receipts, reconciliation, or explicit recovery.
Reversible local changes should not inherit that weight.

## 6. Guard Boundaries With Falsifiable Checks

A material architecture rule needs proportionate, falsifiable enforcement.
Prefer machine-checked guards — import boundaries, schema validation,
structural tests — where feasible. Otherwise use an explicit, auditable review
mechanism and record why automation is not proportionate.

A guard that cannot fail is wallpaper. Require evidence that it can detect a
known or safely planted violation. Keel records the required sensitivity and
freshness evidence; an authorized execution workflow decides whether and how
to run a negative control. Track that evidence separately from observed real
violations: a quiet but falsifiable guard is not dead merely because the
protected boundary has stayed clean.

Default exception baselines to shrink-only. When a necessary exception makes
the baseline grow, keep it narrow and make the change an explicit boundary
decision: record the decision authority, reason, date, and removal condition,
then update the baseline visibly. Delete stale exceptions, because every silent
"just this once" becomes precedent for the next. Escaping a guard by moving
code out of its scope is itself a boundary change and gets the same scrutiny
the guard enforces.

## 7. Keep The Governed Path Cheapest

Reduce avoidable friction on the governed path without weakening product,
safety, security, privacy, or compliance policy. A recurring bypass may show
that the governed route carries avoidable cost; measure the gap and reduce it
before or alongside durable enforcement.

An active or imminent material risk may require narrow immediate containment
from the owning safety, security, or execution workflow. Keel requires the
scope, decision authority, operational cost, and exit condition to remain
traceable while the durable path is repaired.

## 8. Keep Change And Deletion Routine

Long-lived systems accumulate drift. Make change, migration, and deletion
routine rather than heroic.

Budget concepts: a new noun, layer, or abstraction must remove more ambiguity
than it adds. In an existing system, name what it retires; if nothing retires,
declare the net concept growth, accountability, reason, and review date. In
greenfield work, compare each initial concept with a simpler omitted
alternative instead of inventing a retirement ledger. Nouns that only grow
without review are rot.

A complete retirement closes the active entry surface, lets tooling enumerate
dependents, and preserves required behavioral evidence outside the active
implementation. Historical code informs behavior and risk; it does not define
the target topology.

Start a whole-system rewrite proposal by naming the smallest independently
replaceable slice and the contracts it preserves. Expand only when evidence
shows a bounded migration cannot close. Do not preserve compatibility for its
own sake when the repository has declared a clean target state (see Grade Every Surface).

Pair each architecture rule with a traceable reason and a proportionate guard
or review mechanism. If either is missing, return the rule for review.

## References

Read only when needed:

- `references/source-observations.md` — mechanisms, provenance, and deliberate
  omissions; consult only when auditing or changing Keel's own rules.
- `references/diagnostics.md` — task routes, review questions, and rot indicators; consult for greenfield design, architecture review, boundary change, structural refactor, or rot audit.
- `references/architecture-records.md` — record-authority routes and delegated
  structure tests; consult before changing architecture-record structure,
  routing, history, or conflicting sources.
