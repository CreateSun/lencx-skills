# lencx-skills

> 📚 A curated collection of skills for AI agents — turning tacit knowledge into reliable execution.

English | [中文](./locales/README.zh-CN.md)

<a href="https://www.buymeacoffee.com/lencx" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-blue.png" alt="Buy Me A Coffee" style="height: 40px !important;width: 145px !important;" ></a>

## Installation

### Quick Install (Recommended)

```bash
npx skills add lencx/skills
```

### Specific Install (Global)

```bash
# Claude Code
npx skills add lencx/skills -a claude-code -g

# Codex
npx skills add lencx/skills -a codex -g
```

## Skills

- [keel](./skills/keel): Architecture review and governance for repository-defined load-bearing facts, boundaries, contracts, migrations, guards, and deletion.
- [coding-protocol](./skills/coding-protocol): Risk-scaled coding execution hygiene for authority, scope, evidence, user-work preservation, verification, and reporting (ref: [Andrej Karpathy's public observations](https://x.com/karpathy/status/2015883857489522876)).

## Compatibility

Skills conform to the open Agent Skills format (`SKILL.md` with
`name`/`description` frontmatter) and avoid agent-specific tools, so they are
intended to be portable across compliant hosts. Format portability is not a
claim of identical behavior: Codex and Claude Code are the primary behavioral
validation targets, and recorded results belong in [`evals/`](./evals).
`npx skills add` handles per-agent installation.

Tip: these skills pair best with declarative prompts — state the success criteria ("make these tests pass") rather than step-by-step instructions.

## Development

- Keep descriptions host-neutral and follow the open Agent Skills
  [`what + when` contract](https://agentskills.io/specification). Set trigger
  acceptance thresholds before trials, evaluate identical wording across
  hosts, and keep the catalog metadata budget in view. Prefer the shorter
  candidate when its results remain within those thresholds. Validate
  primarily in Claude Code and Codex, plus every other host for which behavior
  is specifically claimed.
- `node scripts/validate-skills.mjs` — two-layer validation: universal checks for every skill (frontmatter, size limits, referenced files, section cross-references), plus inferred archetype packs (`protocol`: rules ↔ failure modes ↔ complete scenario fields/results headers, with positive and negative trigger probes). Runs in CI on every push and PR.
- [`evals/`](./evals) — project-level behavioral A/B scenarios. `evals/<skill>.md` is matched to `skills/<skill>`; `evals/manifest.json` stores only overrides and project-level exceptions such as cross-skill pairing edges. Skill responsibility boundaries stay in the skills themselves. Use `archetype: "none"` only for skills intentionally outside an inferred pack.
- Bump the skill's `SKILL.md` `metadata.version` whenever installed skill content changes (`SKILL.md` or files under that skill directory).
- Local development with Claude Code: symlink the skill so the installed copy always tracks the repo (re-run `npx skills add` instead if you prefer copies):

  ```bash
  ln -sfn "$(pwd)/skills/keel" ~/.claude/skills/keel
  ln -sfn "$(pwd)/skills/coding-protocol" ~/.claude/skills/coding-protocol
  ```

## License

MIT
