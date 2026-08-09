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

Tip: these skills pair best with declarative prompts — state the success criteria ("make these tests pass") rather than step-by-step instructions.

## License

MIT
