# Diagnostics

Operational companion to SKILL.md, read on demand. It turns Keel's rules into
task routes, review questions, and drift indicators. Apply them to repository
evidence and focused-workflow artifacts without replacing those artifacts or
their vocabulary. Return load-bearing findings and closure conditions through
the owning decision path.

## Task routes

Use the narrowest route that fits the request. Each route terminates in one of
two complete states: **closed**, when evidence supports a decision and its
closure conditions; or **open**, when viable alternatives or findings and
their unresolved unknowns are explicit.

| Route | Use when | Required evidence | Stop when | Must output |
| --- | --- | --- | --- | --- |
| `greenfield_design` | testing load-bearing choices where repository authority does not yet exist | user goals, external constraints, provenance-bearing domain inputs, peer-generated options when available, risk and operating context | either evidence distinguishes a preferred option and its closure conditions are explicit, or viable options and unknowns are returned without forced selection | explored options and provenance, proposed invariants, authority and accountability, compatibility commitments, applicable failure and recovery behavior, unresolved unknowns |
| `architecture_review` | reviewing a design, RFC, or structural PR | repository authority, in-scope facts and transitions, changed surfaces, owners, negative path, checks | every material claim maps to a file, contract, test, owner, or explicit unknown | findings, boundary decisions, missing evidence, remaining risk |
| `boundary_change` | adding, widening, moving, or deleting a contract, schema, export, flag, or declared entry surface | repository compatibility category or Keel fallback, consumers, accountability model, and any applicable migration or guard | the new promise, compatibility cost, authority, and proportionate verification path are known | compatibility commitment, consumer impact, applicable migration or deprecation plan, verification requirement |
| `structural_refactor` | splitting, merging, relocating, or rewriting a module or slice | current owner, dependency direction, entry surface, behavior evidence, retirement candidate | the smallest safe slice is named and dependents are enumerable by tooling | slice boundary, preserved contracts, deletion path, checks |
| `rot_audit` | auditing a living codebase for drift or recurring bypass | declared scope, selected indicators, evidence window, exception baseline, negative-control evidence | every in-scope indicator has grounded evidence, an explicitly unavailable source, or a reasoned exclusion | findings, no-action or subtraction candidates, owners, review trigger, next snapshot |

## Design review matrix

These are Keel-internal lenses. Apply them to whatever representation the
repository or focused work supplies; peer artifacts need not adopt these slot
names. Run only rows that can plausibly change the proposed design, RFC, or
structural PR. A selected row should be answerable with concrete references;
an unanswerable selected row is itself a finding. Group irrelevant rows under
one reason only when their absence could look accidental.

| Slot | Question | Rule |
| --- | --- | --- |
| Spine | Where are inputs accepted, facts made authoritative, effects authorized, and outcomes completed or recovered? Do multiple mechanisms preserve that model or create an unreconciled peer? | 1 |
| Surface | Which stability level does each new or changed surface sit on? Which potential promises (exports, fields, flags, options) widen an observable or declared contract, and is each at the cheapest level that works? | 2 |
| Truth | For each material in-scope fact and jurisdiction, what is the authority model and conflict rule? What is a projection for that relation, and which independent operational facts does it hold? | 3 |
| Ownership | Is accountability single, partitioned, or joint, and are decision rights and lifecycle responsibility explicit? Does collaboration use declared public surfaces rather than internals or a generic shared dumping ground? | 4 |
| Negative path | Which negative outcomes can materially occur, what happens for each, and which labels are inapplicable? What is the proportionate recovery route? | 5 |
| Time | If the design is stateful or repeatable, what happens when it runs twice, restarts halfway, or replays? Which control answers each applicable case? | 5 |
| Guards | Which relied-on rules justify falsifiable enforcement at this blast radius? What evidence shows each check can detect a violation, and can its scope be escaped? If enforcement is manual, what makes review explicit and auditable? | 6 |
| Budget | In an existing system, what is the net concept growth, retirement, accountability, and review date? In greenfield work, which simpler alternative was rejected and why? | 8 |

Section 7 (governed-path cost) is a property of the running system, not of one
design; review it through the bypass-frequency indicator below.

## Rot indicators

Lagging symptoms such as incidents and rewrites arrive late, so use leading
indicators where they earn their cost. Interpret level and direction against
repository context: expected product growth can raise a healthy count. Reuse a
repository-defined review trigger when present; otherwise a concerning trend
creates a finding for its owner, not an automatic work item.

| Indicator | How to read it |
| --- | --- |
| Suppression count — lint-disables, unchecked casts, skipped tests, baseline entries | Default the trend and baseline to shrink-only. Any justified increase is a visible baseline decision with decision authority, reason, narrow scope, date, and removal condition; unreviewed growth is exception accretion. |
| Negative-control freshness | Track the last time a planted or known violation was detected. Staleness questions the guard mechanism even when the repository is clean. |
| Observed violation history | Track real violations separately as pressure on the boundary. A long quiet period is not by itself evidence that a falsifiable guard should retire. |
| Public surface growth | Exports, fields, and options added per period versus features shipped. Surface outgrowing features means promises are being minted as a side effect. |
| Concept count | New nouns (services, managers, layers, config keys) added versus retired or explicitly accepted as net growth. A ledger that records neither retirement nor reviewed growth is rot. |
| Ambiguous authority | The same fact is independently editable in more than one place without declared partition, merge, conflict, freshness, and recovery rules. Deliberate federation and replicas are not defects when those rules are explicit. |
| Boundary / accountability divergence | Code widens or crosses a declared boundary without corresponding contract and decision-right evidence. Internal churn behind an unchanged contract is not drift. |
| Bypass frequency | How often the documented path is skipped (direct pushes, manual deploys, ad-hoc scripts). After accounting for controlling policy, a rising rate may expose avoidable cost in the governed path; it is not evidence of individual misconduct. |
| Undeclared cross-boundary imports | Imports that violate declared dependency direction or bypass a public surface. Count the boundary violation, not directory kinship by itself. |
| Hand-edited derived files | Diffs touching files with generated headers. Signals the generator is slower than a text editor; fix the generator's cost first, then the file. |

### Evidence retention

Prefer existing version-control history, CI artifacts, and metrics over a new
Keel-owned store. If a new snapshot is justified, declare its scope, cadence,
retention, owner, and deletion condition. Do not append unbounded history to
the repository or build a second source of truth merely to measure drift.

Indicators are projections of health, not health itself. Declare each
indicator's scope, evidence window, and known blind spots. A green dashboard
over a rotting seam is the wallpaper-guard failure mode at the meta level; a
quiet signal should be validated, not automatically celebrated or retired.
