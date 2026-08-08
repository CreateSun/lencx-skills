#!/usr/bin/env node
// Validation for skills/*/SKILL.md in two layers: universal checks that
// apply to every skill (frontmatter, size limits, referenced files, named
// section cross-references), and archetype packs inferred from local files
// or selected by evals/manifest.json overrides. These are the drift classes
// that have actually bitten this repo.

import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const skillsDir = join(root, "skills");
const evalsDir = join(root, "evals");
const errors = [];
const SEMVER_PATTERN = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;

const addError = (message) => errors.push(message);

const assertUnique = (values, label) => {
  const seen = new Set();
  for (const value of values) {
    if (seen.has(value)) addError(`${label}: duplicate value "${value}"`);
    seen.add(value);
  }
};

const diffSets = (actual, expected) => {
  const actualSet = new Set(actual);
  const expectedSet = new Set(expected);
  return {
    missing: [...expectedSet].filter((value) => !actualSet.has(value)),
    unexpected: [...actualSet].filter((value) => !expectedSet.has(value)),
  };
};

const compareSets = (actual, expected, label) => {
  const difference = diffSets(actual, expected);
  for (const value of difference.missing) addError(`${label}: missing "${value}"`);
  for (const value of difference.unexpected) addError(`${label}: unexpected "${value}"`);
};

const readJson = (file) => {
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch (error) {
    addError(`${file}: invalid JSON (${error instanceof Error ? error.message : String(error)})`);
    return undefined;
  }
};

const stripHiddenMarkdown = (text) => {
  const uncommentedText = text.replace(/<!--[\s\S]*?(?:-->|$)/g, "");
  let activeFence = null;
  const visibleLines = [];
  for (const line of uncommentedText.split("\n")) {
    const marker = line.match(/^\s*(`{3,}|~{3,})/)?.[1];
    if (!activeFence && marker) {
      activeFence = { character: marker[0], length: marker.length };
      visibleLines.push("");
      continue;
    }
    if (activeFence) {
      if (marker
        && marker[0] === activeFence.character
        && marker.length >= activeFence.length) {
        activeFence = null;
      }
      visibleLines.push("");
      continue;
    }
    visibleLines.push(line);
  }
  return visibleLines.join("\n");
};

const includesVisibleMarkdown = (text, requiredText) =>
  stripHiddenMarkdown(text).includes(requiredText);

const extractLevel2Section = (text, headingPattern) => {
  const visibleText = stripHiddenMarkdown(text);
  const heading = headingPattern.exec(visibleText);
  if (!heading) return "";
  const start = (heading.index ?? 0) + heading[0].length;
  const remainder = visibleText.slice(start);
  const nextHeading = /^##\s+/m.exec(remainder);
  return remainder.slice(0, nextHeading?.index ?? remainder.length);
};

const extractEvalScenarioBlocks = (text) => {
  const visibleText = stripHiddenMarkdown(text);
  const matches = [...visibleText.matchAll(/^###\s+([A-Z]+\d+)\s+[—-]\s+(.+)$/gm)];
  return matches.map((match, index) => ({
    id: match[1],
    title: match[2].trim(),
    body: visibleText.slice(
      (match.index ?? 0) + match[0].length,
      matches[index + 1]?.index ?? visibleText.length,
    ),
  }));
};

const extractEvalScenarios = (text) => extractEvalScenarioBlocks(text)
  .map(({ id, title }) => ({ id, title }));

const requiredEvalScenarioFields = ["Setup", "Prompt", "Pass", "Fail"];
const countEvalScenarioField = (body, field) => [
  ...body.matchAll(new RegExp(`^- \\*\\*${field}:\\*\\*`, "gm")),
].length;
const missingEvalScenarioFields = (body) => requiredEvalScenarioFields
  .filter((field) => !new RegExp(`^- \\*\\*${field}:\\*\\*[ \\t]*\\S[^\\r\\n]*$`, "m").test(body));
const duplicateEvalScenarioFields = (body) => requiredEvalScenarioFields
  .filter((field) => countEvalScenarioField(body, field) > 1);

const extractTriggerProbes = (text) => {
  const probes = [];
  for (const line of extractLevel2Section(text, /^##\s+Trigger probes\s*$/m).split("\n")) {
    const cells = splitMarkdownTableRow(line);
    if (cells.length < 3 || !/^T\d+$/.test(cells[0])) continue;
    probes.push({
      id: cells[0],
      prompt: cells.slice(1, -1).join(" | ").trim(),
      expected: cells[cells.length - 1].toLowerCase(),
    });
  }
  return probes;
};

const hasValidTriggerProbeDelimiter = (text) => {
  const lines = extractLevel2Section(text, /^##\s+Trigger probes\s*$/m).split("\n");
  const headerIndex = lines.findIndex((line) => {
    const cells = splitMarkdownTableRow(line);
    return cells.length === 3
      && cells[0] === "ID"
      && cells[1] === "Prompt shape"
      && cells[2] === "Expected";
  });
  if (headerIndex < 0) return false;
  const delimiterCells = splitMarkdownTableRow(lines[headerIndex + 1] ?? "");
  return delimiterCells.length === 3
    && delimiterCells.every((cell) => /^:?-{3,}:?$/.test(cell));
};

const hasRequiredTriggerPolarities = (probes) =>
  probes.some((probe) => probe.expected === "trigger")
  && probes.some((probe) => probe.expected === "do not trigger");

const extractEvalResultTable = (text) => {
  const lines = stripHiddenMarkdown(text).split("\n");
  const headerIndex = lines.findIndex(
    (line) => line.startsWith("| Date | Agent / model | Skill version |"),
  );
  if (headerIndex < 0) return { headerCells: [], delimiterCells: [] };
  return {
    headerCells: splitMarkdownTableRow(lines[headerIndex]),
    delimiterCells: splitMarkdownTableRow(lines[headerIndex + 1] ?? ""),
  };
};

const extractEvalResultHeaderCells = (text) => extractEvalResultTable(text).headerCells;

const extractEvalResultHeaderScenarios = (text) => extractEvalResultHeaderCells(text)
  .filter((cell) => /^[A-Z]+\d+$/.test(cell));

const hasValidEvalResultDelimiter = (text) => {
  const { headerCells, delimiterCells } = extractEvalResultTable(text);
  return headerCells.length > 0
    && delimiterCells.length === headerCells.length
    && delimiterCells.every((cell) => /^:?-{3,}:?$/.test(cell));
};

const requiredEvalResultPrefix = [
  "Date",
  "Agent / model",
  "Skill version",
  "Skill hash",
  "Fixture hash",
  "Condition",
  "Trial",
];

const splitMarkdownTableRow = (line) => {
  if (/^(?: {4}|\t)/.test(line)) return [];
  const trimmed = line.trim();
  if (!trimmed.startsWith("|") || !trimmed.endsWith("|")) return [];
  return trimmed.slice(1, -1).split("|").map((cell) => cell.trim());
};

const extractFailureModeSection = (text) => {
  return extractLevel2Section(text, /^##\s+Failure modes\b.*$/m);
};

const extractSourceFailureModeRows = (text) => {
  const rows = [];
  for (const line of extractFailureModeSection(text).split("\n")) {
    const cells = splitMarkdownTableRow(line);
    if (cells.length < 2) continue;
    if (/^failure mode$/i.test(cells[0])) continue;
    if (cells.every((cell) => /^:?-{3,}:?$/.test(cell))) continue;
    const title = cells[0].match(/\*\*(.+?)\*\*/)?.[1]?.trim() || cells[0].trim();
    if (!title) continue;
    const rules = [...cells[cells.length - 1].matchAll(/\b\d+\b/g)].map((match) => match[0]);
    rows.push({ title, rules });
  }
  return rows;
};

const extractSourceFailureModeRules = (text) => new Map(
  extractSourceFailureModeRows(text).map(({ title, rules }) => [title, rules]),
);

const extractSkillRuleRows = (text) => [
  ...stripHiddenMarkdown(text).matchAll(/^##\s+(\d+)\.\s+(.+)$/gm),
].map((match) => ({ id: match[1], title: match[2].trim() }));

const extractSkillRules = (text) => new Map(
  extractSkillRuleRows(text).map(({ id, title }) => [id, title]),
);

const extractDiagnosticsRuleReferences = (text) => {
  const refs = new Set();
  const visibleText = stripHiddenMarkdown(text);
  for (const line of visibleText.split("\n")) {
    const cells = splitMarkdownTableRow(line);
    if (cells.length < 3) continue;
    const ruleCell = cells[cells.length - 1];
    if (!/^\d+(?:\s*[,;/]\s*\d+)*$/.test(ruleCell)) continue;
    for (const match of ruleCell.matchAll(/\b\d+\b/g)) refs.add(match[0]);
  }
  for (const match of visibleText.matchAll(/\b[Ss]ection\s+(\d+)\b/g)) refs.add(match[1]);
  return refs;
};

// Guard freshness: prove the validator helpers still see planted fixtures before
// trusting them for the real scan.
const selfTestFailures = [];
const expectSelf = (condition, label) => { if (!condition) selfTestFailures.push(label); };
expectSelf(
  extractEvalScenarios("### K99 — Planted failure\n").some((item) => item.id === "K99" && item.title === "Planted failure"),
  "eval scenario extraction",
);
expectSelf(
  extractEvalScenarios("```\n### K99 — Fenced fake\n```\n").length === 0,
  "fenced eval scenario rejection",
);
expectSelf(
  missingEvalScenarioFields("- **Setup:** planted\n").join(",") === "Prompt,Pass,Fail",
  "eval scenario required-field rejection",
);
expectSelf(
  missingEvalScenarioFields("- **Setup:** x\n- **Prompt:** x\n- **Pass:** x\n- **Fail:**   \n").includes("Fail"),
  "blank eval scenario field rejection",
);
expectSelf(
  duplicateEvalScenarioFields("- **Fail:** first\n- **Fail:** second\n").includes("Fail"),
  "duplicate eval scenario field rejection",
);
expectSelf(
  extractEvalResultHeaderScenarios("| Date | Agent / model | Skill version | K99 | Notes |").includes("K99"),
  "eval result header extraction",
);
expectSelf(
  extractEvalResultHeaderCells("| Date | Agent / model | Skill version | Skill hash | Fixture hash | Condition | Trial | K99 | Notes |")
    .includes("Fixture hash"),
  "eval result metadata extraction",
);
expectSelf(
  hasValidEvalResultDelimiter(
    "| Date | Agent / model | Skill version | K99 | Notes |\n"
      + "| --- | --- | --- | --- | --- |\n",
  ) && !hasValidEvalResultDelimiter("| Date | Agent / model | Skill version | K99 | Notes |\n"),
  "eval result delimiter rejection",
);
expectSelf(
  extractTriggerProbes("## Trigger probes\n| T99 | Planted trigger | do not trigger |\n")
    .some((item) => item.id === "T99" && item.expected === "do not trigger"),
  "trigger probe extraction",
);
expectSelf(
  extractTriggerProbes("<!--\n## Trigger probes\n| T99 | Hidden trigger | trigger |\n-->\n").length === 0,
  "commented trigger probe rejection",
);
expectSelf(
  includesVisibleMarkdown("active requirement\n", "active requirement")
    && !includesVisibleMarkdown("<!-- hidden requirement -->\n", "hidden requirement")
    && !includesVisibleMarkdown("```\nfenced requirement\n```\n", "fenced requirement"),
  "hidden skill text requirement rejection",
);
expectSelf(
  hasValidTriggerProbeDelimiter(
    "## Trigger probes\n| ID | Prompt shape | Expected |\n| --- | --- | --- |\n",
  ) && !hasValidTriggerProbeDelimiter(
    "## Trigger probes\n| ID | Prompt shape | Expected |\n",
  ),
  "trigger probe delimiter rejection",
);
expectSelf(
  !hasRequiredTriggerPolarities([{ id: "T98", expected: "trigger" }])
    && hasRequiredTriggerPolarities([
      { id: "T98", expected: "trigger" },
      { id: "T99", expected: "do not trigger" },
    ]),
  "trigger probe polarity rejection",
);
expectSelf(
  extractSkillRules("## 9. Planted Rule\n").get("9") === "Planted Rule",
  "skill rule heading extraction",
);
expectSelf(
  extractSkillRuleRows("## 9. First\n## 9. Duplicate\n").length === 2,
  "duplicate skill rule preservation",
);
expectSelf(
  (extractSourceFailureModeRules("## Failure modes\n| **Planted mode** — desc | 2 Rule A; 7 Rule B |\n").get("Planted mode") ?? []).join(",") === "2,7",
  "failure mode rule extraction",
);
expectSelf(
  extractSourceFailureModeRows("## Failure modes\n| **Ruleless mode** | mechanism | |\n")[0]?.rules.length === 0,
  "ruleless failure mode preservation",
);
expectSelf(
  extractSourceFailureModeRows("## Glossary\n| **Projection** | derived view |\n").length === 0,
  "non-failure-mode table rejection",
);
expectSelf(
  extractSourceFailureModeRows("## Failure modes\n| Plain mode | mechanism | 1 |\n")[0]?.title === "Plain mode",
  "plain failure mode preservation",
);
expectSelf(
  extractDiagnosticsRuleReferences("| Slot | Question | 9 |\n").has("9")
    && extractDiagnosticsRuleReferences("covered in Section 8 only\n").has("8"),
  "diagnostics rule reference extraction",
);
expectSelf(
  diffSets(["planted", "unexpected"], ["planted", "missing"]).missing.includes("missing")
    && diffSets(["planted", "unexpected"], ["planted", "missing"]).unexpected.includes("unexpected"),
  "coverage difference detection",
);
if (selfTestFailures.length > 0) {
  for (const failure of selfTestFailures) addError(`validator self-test failed: ${failure}`);
}

const validateCollaborations = (skillName, label, collaborations, skillTexts) => {
  assertUnique(collaborations.map((collaboration) => collaboration?.skill), `${label} collaboration skills`);
  for (const collaboration of collaborations) {
    if (!collaboration || typeof collaboration !== "object" || Array.isArray(collaboration)) {
      addError(`${label}: collaboration must be an object`);
      continue;
    }
    for (const key of Object.keys(collaboration)) {
      if (!["skill", "required", "mode"].includes(key)) {
        addError(`${label}: collaboration "${collaboration.skill ?? "unknown"}" has unsupported field "${key}"`);
      }
    }
    if (typeof collaboration.skill !== "string"
      || !/^[a-z0-9-]+$/.test(collaboration.skill)) {
      addError(`${label}: collaboration must declare skill`);
      continue;
    }
    if (collaboration.skill === skillName) {
      addError(`${label}: collaboration cannot point to itself: ${collaboration.skill}`);
    }
    if (collaboration.required !== false && collaboration.required !== true) {
      addError(`${label}: collaboration "${collaboration.skill}" must declare boolean required`);
    }
    if (!["optional_pairing", "required_pairing"].includes(collaboration.mode)) {
      addError(`${label}: collaboration "${collaboration.skill}" must declare optional_pairing or required_pairing mode`);
    }
    if (collaboration.required === true && collaboration.mode !== "required_pairing") {
      addError(`${label}: required collaboration "${collaboration.skill}" must use required_pairing mode`);
    }
    if (collaboration.required === false && collaboration.mode !== "optional_pairing") {
      addError(`${label}: optional collaboration "${collaboration.skill}" must use optional_pairing mode`);
    }

    const peerText = skillTexts.get(collaboration.skill);
    if (!peerText) {
      if (collaboration.required) addError(`${label}: required collaboration skill missing: ${collaboration.skill}`);
      continue;
    }
    const peerName = peerText.match(/^name:\s*(.+)$/m)?.[1]?.trim();
    if (peerName !== collaboration.skill) {
      addError(`${label}: collaboration skill "${collaboration.skill}" has mismatched frontmatter name "${peerName}"`);
    }
  }
};

const readConfigArray = (config, key, label) => {
  const value = config?.[key];
  if (value === undefined) return [];
  if (!Array.isArray(value)) {
    addError(`${label}: ${key} must be an array`);
    return [];
  }
  return value;
};

const validateSkillTextRequirements = (skillName, skillText, skillConfig) => {
  const requiredValues = readConfigArray(skillConfig, "skillTextMustInclude", skillName);
  assertUnique(requiredValues, `${skillName} skillTextMustInclude`);
  for (const requiredText of requiredValues) {
    if (typeof requiredText !== "string" || requiredText.trim() === "") {
      addError(`${skillName}: skillTextMustInclude values must be non-empty strings`);
      continue;
    }
    if (!includesVisibleMarkdown(skillText, requiredText)) {
      addError(`${skillName}: SKILL.md must include required eval config text: ${requiredText}`);
    }
  }
};

const readProjectEvalConfig = () => {
  const manifestPath = join(evalsDir, "manifest.json");
  const emptyConfig = { skills: {} };
  if (!existsSync(manifestPath)) return emptyConfig;

  const manifest = readJson(manifestPath);
  if (manifest === undefined) return emptyConfig;
  if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) {
    addError("evals/manifest.json: root must be an object");
    return emptyConfig;
  }
  for (const key of Object.keys(manifest)) {
    if (!["schema_version", "kind", "skills"].includes(key)) {
      addError(`evals/manifest.json: unsupported root field "${key}"`);
    }
  }
  if (manifest.schema_version !== 2) addError("evals/manifest.json: schema_version must be 2");
  if (manifest.kind !== "project_eval_config") {
    addError("evals/manifest.json: kind must be project_eval_config");
  }

  const skills = manifest.skills ?? {};
  if (!skills || typeof skills !== "object" || Array.isArray(skills)) {
    addError("evals/manifest.json: skills must be an object when present");
    return emptyConfig;
  }
  for (const [skillName, skillConfig] of Object.entries(skills)) {
    if (!skillConfig || typeof skillConfig !== "object" || Array.isArray(skillConfig)) {
      addError(`evals/manifest.json: skills.${skillName} must be an object`);
      continue;
    }
    for (const key of Object.keys(skillConfig)) {
      if (![
        "archetype",
        "sourcePath",
        "diagnosticsPath",
        "evalPath",
        "collaborations",
        "skillTextMustInclude",
      ].includes(key)) {
        addError(`evals/manifest.json: skills.${skillName} has unsupported field "${key}"`);
      }
    }
    for (const key of ["sourcePath", "diagnosticsPath", "evalPath"]) {
      if (skillConfig[key] !== undefined
        && (typeof skillConfig[key] !== "string" || skillConfig[key].trim() === "")) {
        addError(`evals/manifest.json: skills.${skillName}.${key} must be a non-empty string`);
      }
    }
    if (skillConfig.archetype !== undefined
      && (typeof skillConfig.archetype !== "string" || skillConfig.archetype.trim() === "")) {
      addError(`evals/manifest.json: skills.${skillName}.archetype must be a non-empty string`);
    }
  }
  return { skills };
};

// Archetype pack: protocol-shaped skills — numbered rule headings, a
// failure-mode table in source-observations, a full eval suite, and
// optional diagnostics, cross-checked as one coverage discipline.
const validateProtocolSkill = (skillName, skillTexts, config) => {
  const label = skillName;
  const skillText = skillTexts.get(skillName);
  if (!skillText) {
    addError(`${label}: referenced skill not found`);
    return;
  }

  const skillConfig = config.skills[skillName] ?? {};
  const sourcePath = join(root, skillConfig.sourcePath || `skills/${skillName}/references/source-observations.md`);
  const diagnosticsPath = join(root, skillConfig.diagnosticsPath || `skills/${skillName}/references/diagnostics.md`);
  const evalPath = join(root, skillConfig.evalPath || `evals/${skillName}.md`);
  const collaborations = readConfigArray(skillConfig, "collaborations", label);

  if (!existsSync(sourcePath)) addError(`${label}: source observations not found: ${sourcePath}`);
  if (!existsSync(evalPath)) addError(`${label}: eval file not found: ${evalPath}`);

  const skillRuleRows = extractSkillRuleRows(skillText);
  const ruleIds = skillRuleRows.map(({ id }) => id);
  const ruleIdSet = new Set(ruleIds);
  if (ruleIds.length === 0) addError(`${label}: SKILL.md must contain numbered rule headings`);
  assertUnique(ruleIds, `${label} SKILL rule ids`);

  let sourceModeRules = new Map();
  if (existsSync(sourcePath)) {
    const sourceText = readFileSync(sourcePath, "utf8");
    const sourceModeRows = extractSourceFailureModeRows(sourceText);
    sourceModeRules = new Map(sourceModeRows.map(({ title, rules }) => [title, rules]));
    if (sourceModeRules.size === 0) {
      addError(`${label}: source observations must contain failure modes with rule references`);
    }
    assertUnique(sourceModeRows.map(({ title }) => title), `${label} source failure modes`);
    for (const [title, modeRules] of sourceModeRules) {
      if (modeRules.length === 0) addError(`${label}: failure mode "${title}" must reference at least one rule`);
      assertUnique(modeRules, `${label} failure mode ${title} rule references`);
      for (const rule of modeRules) {
        if (!ruleIdSet.has(rule)) addError(`${label}: failure mode "${title}" references unknown rule ${rule}`);
      }
    }
    compareSets(
      [...new Set([...sourceModeRules.values()].flat())],
      ruleIds,
      `${label} source failure-mode rule coverage`,
    );
  }

  if (existsSync(evalPath)) {
    const evalText = readFileSync(evalPath, "utf8");
    const evalScenarioBlocks = extractEvalScenarioBlocks(evalText);
    const evalScenarios = evalScenarioBlocks.map(({ id, title }) => ({ id, title }));
    const evalIds = evalScenarios.map((scenario) => scenario.id);
    const evalTitles = evalScenarios.map((scenario) => scenario.title);
    if (evalScenarios.length === 0) addError(`${label}: eval file must contain scenario headings`);
    assertUnique(evalIds, `${label} eval scenario ids`);
    assertUnique(evalTitles, `${label} eval scenario titles`);
    for (const scenario of evalScenarioBlocks) {
      for (const field of missingEvalScenarioFields(scenario.body)) {
        addError(`${label}: eval scenario ${scenario.id} is missing ${field}`);
      }
      for (const field of duplicateEvalScenarioFields(scenario.body)) {
        addError(`${label}: eval scenario ${scenario.id} has duplicate ${field}`);
      }
    }
    compareSets(evalTitles, [...sourceModeRules.keys()], `${label} eval scenario title coverage`);
    if (!hasValidEvalResultDelimiter(evalText)) {
      addError(`${label}: eval results table must have a delimiter row matching the header`);
    }
    const resultHeaderCells = extractEvalResultHeaderCells(evalText);
    assertUnique(resultHeaderCells, `${label} eval results header cells`);
    const expectedResultHeaderCells = [...requiredEvalResultPrefix, ...evalIds, "Notes"];
    if (resultHeaderCells.length !== expectedResultHeaderCells.length
      || resultHeaderCells.some((cell, index) => cell !== expectedResultHeaderCells[index])) {
      addError(`${label}: eval results header must match metadata and scenario order exactly`);
    }

    const triggerProbes = extractTriggerProbes(evalText);
    const triggerIds = triggerProbes.map((probe) => probe.id);
    if (!hasValidTriggerProbeDelimiter(evalText)) {
      addError(`${label}: trigger probes must have the expected header and delimiter row`);
    }
    if (triggerProbes.length === 0) addError(`${label}: eval file must contain trigger probes`);
    assertUnique(triggerIds, `${label} trigger probe ids`);
    for (const probe of triggerProbes) {
      if (!probe.prompt) {
        addError(`${label}: trigger probe ${probe.id} must contain a prompt`);
      }
      if (!["trigger", "do not trigger"].includes(probe.expected)) {
        addError(`${label}: trigger probe ${probe.id} has unknown expectation "${probe.expected}"`);
      }
    }
    if (!hasRequiredTriggerPolarities(triggerProbes)) {
      addError(`${label}: trigger probes must include trigger and do-not-trigger cases`);
    }
  }

  if (existsSync(diagnosticsPath)) {
    const diagnosticsText = readFileSync(diagnosticsPath, "utf8");
    const diagnosticRuleIds = [...extractDiagnosticsRuleReferences(diagnosticsText)];
    if (diagnosticRuleIds.length === 0) {
      addError(`${label}: diagnostics.md contains no rule references`);
    }
    for (const rule of diagnosticRuleIds) {
      if (!ruleIdSet.has(rule)) addError(`${label}: diagnostics.md references unknown rule ${rule}`);
    }
    compareSets(diagnosticRuleIds, ruleIds, `${label} diagnostics rule coverage`);
  }

  validateCollaborations(skillName, label, collaborations, skillTexts);
};

// Universal checks (frontmatter, size, refs) apply to every skill; an
// archetype pack adds conventions inferred from local files or declared as
// an override. New shapes add a pack here; if the packs multiply past
// three, split them into scripts/checks/*.mjs — the size budget is split
// pressure, not a gate.
const archetypePacks = {
  protocol: validateProtocolSkill,
};

const inferArchetype = (skillName, skillText) => {
  const sourcePath = join(root, `skills/${skillName}/references/source-observations.md`);
  const sourceText = existsSync(sourcePath) ? readFileSync(sourcePath, "utf8") : "";
  if (extractSkillRules(skillText).size > 0 || extractSourceFailureModeRules(sourceText).size > 0) {
    return "protocol";
  }
  return null;
};

const validateProjectEvals = (skillTexts) => {
  const config = readProjectEvalConfig();

  // Orphan eval files: an evals/*.md with no skill directory is dead weight.
  const evalFiles = existsSync(evalsDir)
    ? readdirSync(evalsDir).filter((entry) => entry.endsWith(".md"))
    : [];
  const evalSkillNames = evalFiles.map((entry) => entry.replace(/\.md$/, ""));
  assertUnique(evalSkillNames, "eval suite skills");
  for (const skillName of evalSkillNames) {
    if (!skillTexts.has(skillName)) {
      addError(`evals/${skillName}.md: no matching skill directory`);
    }
  }

  for (const skillName of Object.keys(config.skills)) {
    if (!skillTexts.has(skillName)) {
      addError(`evals/manifest.json: configured skill not found: ${skillName}`);
    }
  }

  for (const skillName of skillTexts.keys()) {
    const skillConfig = config.skills[skillName];
    const skillText = skillTexts.get(skillName);
    validateSkillTextRequirements(skillName, skillText, skillConfig ?? {});
    const archetype = skillConfig?.archetype ?? inferArchetype(skillName, skillText);
    if (!archetype) {
      if (skillConfig) {
        addError(`${skillName}: configured in evals/manifest.json but no archetype was inferred; set archetype to "none" to opt out`);
      }
      continue;
    }
    if (archetype === "none") {
      validateCollaborations(
        skillName,
        skillName,
        readConfigArray(skillConfig, "collaborations", skillName),
        skillTexts,
      );
      continue;
    }

    const pack = archetypePacks[archetype];
    if (!pack) {
      addError(`${skillName}: unknown archetype "${archetype}" (known: ${Object.keys(archetypePacks).join(", ")})`);
      continue;
    }
    pack(skillName, skillTexts, config);
  }
};

const skillTexts = new Map();
for (const entry of readdirSync(skillsDir)) {
  const dir = join(skillsDir, entry);
  if (!statSync(dir).isDirectory()) continue;

  const skillPath = join(dir, "SKILL.md");
  if (!existsSync(skillPath)) {
    errors.push(`${entry}: missing SKILL.md`);
    continue;
  }

  const text = readFileSync(skillPath, "utf8");
  const fmMatch = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (!fmMatch) {
    errors.push(`${entry}: missing or malformed frontmatter`);
    continue;
  }

  const fm = fmMatch[1];
  const name = fm.match(/^name:\s*(.+)$/m)?.[1]?.trim();
  const version = fm.match(/^version:\s*(.+)$/m)?.[1]?.trim();
  const desc = fm.match(/^description:\s*(.+)$/m)?.[1]?.trim();
  if (!name) errors.push(`${entry}: frontmatter missing "name"`);
  else if (name !== entry) errors.push(`${entry}: name "${name}" does not match directory name`);
  if (!version) errors.push(`${entry}: frontmatter missing "version"`);
  else if (!SEMVER_PATTERN.test(version)) errors.push(`${entry}: version "${version}" is not valid semver`);
  if (!desc) errors.push(`${entry}: frontmatter missing "description"`);
  else if (desc.length > 1024) errors.push(`${entry}: description exceeds 1024 characters (${desc.length})`);

  const body = text.slice(fmMatch[0].length);
  const visibleBody = stripHiddenMarkdown(body);
  const lineCount = body.split("\n").length;
  if (lineCount > 500) errors.push(`${entry}: body exceeds 500 lines (${lineCount})`);

  // Relative file references: backticked paths and markdown links.
  const refs = [...visibleBody.matchAll(/`([\w./-]+\.\w+)`|\]\(((?!https?:)[\w./-]+)\)/g)]
    .map((m) => m[1] ?? m[2])
    .filter((p) => p.includes("/"));
  for (const ref of refs) {
    if (!existsSync(join(dir, ref)) && !existsSync(join(root, ref))) {
      errors.push(`${entry}: referenced path not found: ${ref}`);
    }
  }

  // Named cross-references like "(see Scale By Risk)" must match a heading.
  const headings = [...visibleBody.matchAll(/^#{2,}\s+(?:\d+\.\s+)?(.+)$/gm)].map((m) => m[1].trim());
  for (const [, target] of visibleBody.matchAll(/\(see ([^)]+)\)/g)) {
    if (!headings.includes(target.trim())) {
      errors.push(`${entry}: cross-reference to unknown section: "${target.trim()}"`);
    }
  }

  skillTexts.set(entry, text);
}

validateProjectEvals(skillTexts);

if (errors.length > 0) {
  console.error("Skill validation failed:");
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log("All skill structures valid; behavioral evals were not executed.");
