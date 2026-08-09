# Architecture Records

Use this reference only for records that carry or route load-bearing
architecture facts. Leave general documentation, prose quality, rendering,
and domain-specific artifact formats to their owning workflow.

## Resolve Authority Before Structure

Separate four concerns:

- **Record scope** — within the already authorized change, which records are in scope.
- **Fact authority** — who may decide architecture facts.
- **Format authority** — who may change structure, metadata, and naming.
- **Lifecycle authority** — who may supersede, migrate, archive, or delete a
  record.

This list does not grant permission to edit; the user, host, and any execution
workflow govern action scope. A request to reorganize files does not authorize
rewriting facts or historical records. Treat repository-declared authority and
lifecycle roles as current until an authorized migration closes. In greenfield
work, use user goals, external constraints, and provenance-bearing domain
inputs to propose a document structure; preserve the owning workflow's facts
and do not present the proposed structure as inherited truth.

## Select A Route

| Context | Default action | Closed when |
| --- | --- | --- |
| Existing; structure preserved | Clarify the current canonical record in place and repair existing focused links. Record unresolved conflicts as findings. | No new document structure or parallel authority was introduced and every changed fact still resolves to its declared source. |
| Existing; restructuring authorized | Inventory facts, owners, readers, inbound links, generators, guards, immutable history, and rollback or forward-recovery routes. Migrate the smallest coherent slice and retire or redirect its old entry points. | The target owner, every affected reader and route, regeneration, validation, migration recovery, and old-record lifecycle are resolved. |
| Greenfield; record design delegated | Create only the records required by current facts and decisions. Start with one canonical record; add a map only when more than one route needs navigation. | Every material fact has an owner and evidence path, without empty scaffolding or duplicated prose. |
| Sources or requests conflict | Partition jurisdiction. Select one source with projections only when authority or precedence permits; otherwise keep the material choice open. Accept unusual but coherent format preferences. | The conflict rule is explicit, or the decision-changing unknown and its owner are returned without false closure. |

## Keep Record Roles Distinct

| Role | Owns |
| --- | --- |
| Canonical record | Its declared architecture facts and their lifecycle. |
| Index | Navigation, bounded relevance summaries, and redirects; not the facts behind its links. |
| Projection | Its source binding, generation status, freshness, and failures; not copied source facts. |
| Working note | Exploration and unresolved options; it becomes authoritative only through the declared decision path. |

Preserve focused artifacts such as threat models, domain models, API schemas,
and historical decisions in their native form. Index them or add Keel
findings; do not flatten their method or vocabulary into a generic record.

## Add Structure Only When Delegated

Use this decision ladder only when no repository-native system owns the shape
and the user or repository authority delegates format and lifecycle decisions:

- Start with one focused canonical record.
- Add a stable map only when more than one route needs navigation.
- Add routing metadata only when repeated discovery or ambiguity has a named
  machine consumer.
- Add a reverse index only when the repository declares a code-to-owner
  mapping that implementation work repeatedly needs.

This ladder is not a prescribed file tree, schema, or prose template. The
repository or focused documentation workflow chooses those shapes. If routing
metadata earns its cost, derive the minimum fields from the consumer's
questions and repository identifiers; do not create a universal schema. Let
source control supply history unless another consumer genuinely requires
timestamps or per-record schema versions.

A new canonical record must make its purpose, owned and excluded scope,
load-bearing facts or contracts, and applicable evidence, failure, migration,
or open questions discoverable. Express those semantics in the
repository-native form instead of requiring exact headings.

Treat a global map as an index, not a store. When a catalog or reverse index is
generated, declare one editable routing source and regenerate every projection
from it. Report unowned, ambiguous, unavailable, and superseded routes rather
than guessing. Do not copy document bodies, code symbols, or repository-wide
inventories into the index.

## Hand Off Without Taking Over

Return the required fact ownership, record role, routing, migration boundary,
and closure conditions. When present, let a focused writing or documentation
workflow own wording and presentation, and let an execution workflow own
edits, verification, and worktree safety. Otherwise, follow repository and host
defaults. Neither workflow may turn a projection into a second architecture
authority.
