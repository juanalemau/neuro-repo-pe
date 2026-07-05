import { compatibilityText } from "./templates.js";

const CONTROL_DIRECTORIES = new Map([
  ["skill", ["skills", "SKILL.md"]],
  ["prompt", ["prompts", "prompt.md"]],
  ["recipe", ["recipes", "recipe.md"]],
  ["template", ["templates", "template.md"]],
  ["context", ["context", "context.md"]],
  ["example", ["examples", "example.md"]],
  ["architecture", ["architecture", "architecture.md"]],
  ["adr", ["adr", "decision.md"]],
  ["glossary", ["glossary", "terms.md"]],
  ["playbook", ["playbooks", "playbook.md"]],
  ["manifest", ["manifests", "manifest.md"]],
  ["retrieval", ["retrieval", "retrieval.md"]],
  ["workflow", ["workflows", "workflow.md"]],
  ["doc", ["docs", "document.md"]],
  ["sdd", ["docs/sdd", "spec.md"]],
  ["profile", ["context/profiles", "profile.md"]],
]);

export const CONTROL_TYPES = Object.freeze([...CONTROL_DIRECTORIES.keys()]);

export function controlDefinition(type, name, stack) {
  if (!CONTROL_DIRECTORIES.has(type)) {
    throw new Error(`control type must be one of: ${CONTROL_TYPES.join(", ")}`);
  }
  const slug = slugify(name);
  const compatibility = compatibilityText(stack);

  if (type === "skill") {
    return {
      directory: `skills/${slug}`,
      file: "SKILL.md",
      content: `# ${name}

## Goal

Describe when an agent should use this skill and the outcome it must produce.

## Compatibility

${compatibility}

## Instructions

1. Add the workflow steps.
2. Name required inputs and expected outputs.
3. Add verification and safety checks.
`,
    };
  }

  if (type === "sdd") {
    return {
      directory: `sdd/${slug}`,
      file: "spec.md",
      content: `# ${name}

Status: draft

## Context

Describe the problem, users and constraints.

## Compatibility

${compatibility}

## Requirements

- Add measurable functional and non-functional requirements.

## Design

Document boundaries, data flow and important decisions.

## Acceptance criteria

- Add verifiable completion criteria.
`,
    };
  }

  if (type === "profile") {
    return {
      directory: `context/profiles/${slug}`,
      file: "profile.md",
      content: `# ${name}

## Scope

Describe the tasks, team or business area covered by this profile.

## Compatibility

${compatibility}

## Instructions

- Add project-specific operating rules.
- Reference shared context instead of duplicating it.
`,
    };
  }

  const [directory, file] = CONTROL_DIRECTORIES.get(type);
  return {
    directory: `${directory}/${slug}`,
    file,
    content: `# ${name}

Type: ${type}

## Purpose

Describe when this ${type} should be used and its expected outcome.

## Compatibility

${compatibility}

## Content

- Add project-specific content.
- Reference shared memory instead of duplicating it.
- Include verification criteria where applicable.
`,
  };
}

function slugify(value) {
  const slug = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, "-")
    .replace(/^-|-$/gu, "");
  if (!slug) throw new Error("control name must contain letters or numbers");
  return slug;
}
