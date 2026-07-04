import { readFile } from "node:fs/promises";
import path from "node:path";
import { bridgeDefinitions } from "../adapters/bridges.js";
import { generateRepositoryMap } from "../generators/repository-map.js";
import { generateMachineSummary, generateSummary } from "../generators/summary.js";
import { architectureTemplate, conventionsTemplate, projectTemplate } from "../generators/templates.js";
import { loadCache, saveCache } from "./cache.js";
import { DEFAULT_CONFIG, loadConfig, validateConfig } from "./config.js";
import { resolveInside, writeIfMissing, writeText } from "./files.js";
import { buildProjectModel } from "./project-model.js";
import { scanProject } from "./scanner.js";

export async function initializeProject(root, options = {}) {
  const projectRoot = path.resolve(root);
  const configFile = path.join(projectRoot, "ai-context.config.json");
  const initialConfig = { ...DEFAULT_CONFIG, ...pickOptions(options) };
  const configCreated = await writeIfMissing(
    configFile,
    `${JSON.stringify(initialConfig, null, 2)}\n`,
  );
  const config = { ...await loadConfig(projectRoot), ...pickOptions(options) };
  validateConfig(config);
  const contextRoot = resolveInside(projectRoot, config.contextDir);
  const projectName = path.basename(projectRoot);
  const created = [];

  for (const [name, content] of [
    ["project.md", projectTemplate(projectName)],
    ["architecture.md", architectureTemplate()],
    ["conventions.md", conventionsTemplate()],
  ]) {
    if (await writeIfMissing(path.join(contextRoot, name), content)) created.push(path.join(config.contextDir, name));
  }

  for (const bridge of bridgeDefinitions(config.bridges, config.contextDir)) {
    if (await writeIfMissing(resolveInside(projectRoot, bridge.file), bridge.content)) {
      created.push(bridge.file);
    }
  }

  const sync = await syncProject(projectRoot, config);
  return { configCreated, created, ...sync };
}

export async function syncProject(root, options = {}) {
  const projectRoot = path.resolve(root);
  const loaded = await loadConfig(projectRoot);
  const config = { ...loaded, ...pickOptions(options) };
  validateConfig(config);
  const contextRoot = resolveInside(projectRoot, config.contextDir);
  const files = await scanProject(projectRoot, config);
  const previousCache = await loadCache(projectRoot, config.contextDir);
  const model = buildProjectModel(files, previousCache);
  const repositoryMap = generateRepositoryMap(model, config.tokenBudget);
  const generated = {
    "summary.md": generateSummary(model, repositoryMap),
    "repository-map.md": repositoryMap.content,
    "summary.json": generateMachineSummary(model, repositoryMap),
  };

  await Promise.all(
    Object.entries(generated).map(([name, content]) => writeText(path.join(contextRoot, name), content)),
  );
  await saveCache(projectRoot, config.contextDir, model.cache);

  return {
    root: projectRoot,
    config,
    model,
    repositoryMap,
    generated: Object.keys(generated).map((name) => path.join(config.contextDir, name)),
  };
}

export async function inspectProject(root, options = {}) {
  const projectRoot = path.resolve(root);
  const config = { ...await loadConfig(projectRoot), ...pickOptions(options) };
  validateConfig(config);
  const files = await scanProject(projectRoot, config);
  const model = buildProjectModel(files);
  const repositoryMap = generateRepositoryMap(model, config.tokenBudget);
  return { root: projectRoot, config, model, repositoryMap };
}

export async function doctorProject(root) {
  const projectRoot = path.resolve(root);
  const issues = [];
  const config = await loadConfig(projectRoot);
  const inspected = await inspectProject(projectRoot);
  const expectedMap = generateRepositoryMap(inspected.model, config.tokenBudget).content;
  const expectedSummary = generateSummary(inspected.model, inspected.repositoryMap);

  await checkFile(path.join(projectRoot, config.contextDir, "project.md"), "missing human project context", issues);
  await checkContent(
    path.join(projectRoot, config.contextDir, "repository-map.md"),
    expectedMap,
    "repository map is stale; run ai-context sync",
    issues,
  );
  await checkContent(
    path.join(projectRoot, config.contextDir, "summary.md"),
    expectedSummary,
    "summary is stale; run ai-context sync",
    issues,
  );

  return { ok: issues.length === 0, issues, ...inspected };
}

function pickOptions(options) {
  const picked = {};
  if (options.tokenBudget !== undefined) picked.tokenBudget = options.tokenBudget;
  if (options.contextDir !== undefined) picked.contextDir = options.contextDir;
  return picked;
}

async function checkFile(file, message, issues) {
  try {
    await readFile(file, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") issues.push(message);
    else throw error;
  }
}

async function checkContent(file, expected, message, issues) {
  try {
    if (await readFile(file, "utf8") !== expected) issues.push(message);
  } catch (error) {
    if (error.code === "ENOENT") issues.push(message);
    else throw error;
  }
}
