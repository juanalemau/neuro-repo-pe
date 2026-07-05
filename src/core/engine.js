import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { bridgeDefinitions } from "../adapters/bridges.js";
import { controlDefinition } from "../generators/controls.js";
import { generateRepositoryMap } from "../generators/repository-map.js";
import { generateMachineSummary, generateSummary } from "../generators/summary.js";
import {
  architectureTemplate,
  controlsTemplate,
  conventionsTemplate,
  directoryTemplate,
  projectTemplate,
  syncScriptTemplates,
} from "../generators/templates.js";
import { loadCache, saveCache } from "./cache.js";
import { DEFAULT_CONFIG, loadConfig, validateConfig } from "./config.js";
import { resolveInside, writeIfMissing, writeText } from "./files.js";
import { CONTEXT_FILES, STRUCTURE_DIRECTORIES, contextPath } from "./layout.js";
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
  const inspection = await inspectProject(projectRoot, config);
  const stack = inspection.model.stack;

  const editableFiles = [
    ["README.md", controlsTemplate(stack)],
    [CONTEXT_FILES.projectMemory, projectTemplate(projectName, stack)],
    [CONTEXT_FILES.codingStyle, conventionsTemplate(stack)],
    [path.join("architecture", "README.md"), architectureTemplate(stack)],
    ...STRUCTURE_DIRECTORIES
      .filter((directory) => !["memory", "architecture"].includes(directory))
      .map((directory) => [path.join(directory, "README.md"), directoryTemplate(directory, stack)]),
    ...Object.entries(syncScriptTemplates()).map(([name, content]) => [
      path.join("sync", name),
      content,
    ]),
  ];

  for (const [name, content] of editableFiles) {
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
    [CONTEXT_FILES.summary]: generateSummary(model, repositoryMap, config),
    [CONTEXT_FILES.repositoryMap]: repositoryMap.content,
    [CONTEXT_FILES.machineSummary]: generateMachineSummary(model, repositoryMap, config),
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
  const previousCache = await loadCache(projectRoot, config.contextDir);
  const model = buildProjectModel(files, previousCache);
  const repositoryMap = generateRepositoryMap(model, config.tokenBudget);
  return { root: projectRoot, config, model, repositoryMap };
}

export async function doctorProject(root) {
  const projectRoot = path.resolve(root);
  const issues = [];
  const config = await loadConfig(projectRoot);
  const inspected = await inspectProject(projectRoot);
  const expectedMap = generateRepositoryMap(inspected.model, config.tokenBudget).content;
  const expectedSummary = generateSummary(inspected.model, inspected.repositoryMap, config);

  for (const directory of STRUCTURE_DIRECTORIES) {
    await checkDirectory(
      contextPath(projectRoot, config.contextDir, directory),
      `missing AI workspace directory: ${path.join(config.contextDir, directory)}`,
      issues,
    );
  }
  await checkFile(
    contextPath(projectRoot, config.contextDir, CONTEXT_FILES.projectMemory),
    "missing project memory",
    issues,
  );
  await checkFile(
    contextPath(projectRoot, config.contextDir, CONTEXT_FILES.codingStyle),
    "missing coding style memory",
    issues,
  );
  for (const script of Object.keys(syncScriptTemplates())) {
    await checkFile(
      contextPath(projectRoot, config.contextDir, path.join("sync", script)),
      `missing sync script: ${script}`,
      issues,
    );
  }
  await checkContent(
    contextPath(projectRoot, config.contextDir, CONTEXT_FILES.repositoryMap),
    expectedMap,
    "repository map is stale; run ai-context sync",
    issues,
  );
  await checkContent(
    contextPath(projectRoot, config.contextDir, CONTEXT_FILES.summary),
    expectedSummary,
    "summary is stale; run ai-context sync",
    issues,
  );

  return { ok: issues.length === 0, issues, ...inspected };
}

export async function generateControl(root, type, name, options = {}) {
  const projectRoot = path.resolve(root);
  const config = { ...await loadConfig(projectRoot), ...pickOptions(options) };
  validateConfig(config);
  const inspected = await inspectProject(projectRoot, options);
  const definition = controlDefinition(type, name, inspected.model.stack);
  const controlsRoot = resolveInside(
    resolveInside(projectRoot, config.contextDir),
    config.controlsDir,
  );
  const directory = resolveInside(controlsRoot, definition.directory);
  const file = path.join(directory, definition.file);
  const created = await writeIfMissing(file, definition.content);

  return {
    root: projectRoot,
    config,
    model: inspected.model,
    type,
    name,
    file: path.relative(projectRoot, file),
    created,
  };
}

function pickOptions(options) {
  const picked = {};
  if (options.tokenBudget !== undefined) picked.tokenBudget = options.tokenBudget;
  if (options.contextDir !== undefined) picked.contextDir = options.contextDir;
  if (options.controlsDir !== undefined) picked.controlsDir = options.controlsDir;
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

async function checkDirectory(directory, message, issues) {
  try {
    if (!(await stat(directory)).isDirectory()) issues.push(message);
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
