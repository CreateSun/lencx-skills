# lencx-skills

> 📚 一组为 AI agent 准备的精选技能集合，将隐性的经验沉淀为可靠的执行。

[English](../README.md) | 中文

## 安装

### 快速安装（推荐）

```bash
npx skills add lencx/skills
```

### 特定安装（全局）

```bash
# Claude Code
npx skills add lencx/skills -a claude-code -g

# Codex
npx skills add lencx/skills -a codex -g
```

## 技能

- [coding-protocol](../skills/coding-protocol)：按风险分级的编码执行约束，覆盖授权范围、证据、用户工作保护、验证与交付说明（参考：[Andrej Karpathy 的公开观察](https://x.com/karpathy/status/2015883857489522876)）。
- [keel](../skills/keel)：审查并治理由仓库定义的承重事实、边界、契约、迁移、守卫与删除路径。

提示：这些技能与声明式提示词配合最佳——给出成功标准（"让这些测试通过"），而不是步骤式指令。

## 许可证

MIT
