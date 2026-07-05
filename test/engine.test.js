import assert from "node:assert/strict";
import { access, mkdtemp, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {
  doctorProject,
  generateControl,
  initializeProject,
  inspectProject,
  syncProject,
} from "../src/core/engine.js";

test("initializes, preserves human context, and reuses cached analysis", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "ai-context-init-"));
  await writeFile(
    path.join(root, "package.json"),
    JSON.stringify({ name: "fixture", dependencies: { express: "^5.0.0" } }),
  );
  await writeFile(path.join(root, "app.js"), "export function startServer() {}\n");

  const initialized = await initializeProject(root, { tokenBudget: 512 });
  assert.equal(initialized.model.statistics.files > 0, true);
  assert.match(await readFile(path.join(root, ".ai", "summaries", "summary.md"), "utf8"), /Express/u);

  const customProject = "# My carefully written project context\n";
  const memoryFile = path.join(root, ".ai", "memory", "project-memory.md");
  await writeFile(memoryFile, customProject);
  const synchronized = await syncProject(root, { tokenBudget: 512 });

  assert.equal(await readFile(memoryFile, "utf8"), customProject);
  assert.equal(synchronized.model.statistics.cacheHits, synchronized.model.statistics.files);
  assert.equal((await doctorProject(root)).ok, true);
});

test("doctor reports stale generated context", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "ai-context-doctor-"));
  await writeFile(path.join(root, "main.go"), "package main\nfunc main() {}\n");
  await initializeProject(root);
  await writeFile(path.join(root, "main.go"), "package main\nfunc main() {}\nfunc changed() {}\n");

  const diagnosis = await doctorProject(root);
  assert.equal(diagnosis.ok, false);
  assert.ok(diagnosis.issues.some((issue) => issue.includes("stale")));
});

test("rejects an unsafe runtime budget", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "ai-context-config-"));
  await assert.rejects(
    () => inspectProject(root, { tokenBudget: 10 }),
    /tokenBudget must be an integer/u,
  );
});

test("generates editable, version-aware controls without overwriting them", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "ai-context-controls-"));
  await writeFile(
    path.join(root, "package.json"),
    JSON.stringify({ name: "fixture", engines: { node: ">=22" } }),
  );
  await writeFile(path.join(root, "app.js"), "export const app = true;\n");
  await initializeProject(root);

  const generated = await generateControl(root, "skill", "Release segura");
  assert.equal(generated.file, path.join(".ai", "skills", "release-segura", "SKILL.md"));
  assert.match(await readFile(path.join(root, generated.file), "utf8"), /Node\.js >=22/u);

  await writeFile(path.join(root, generated.file), "# Custom skill\n");
  const repeated = await generateControl(root, "skill", "Release segura");
  assert.equal(repeated.created, false);
  assert.equal(await readFile(path.join(root, repeated.file), "utf8"), "# Custom skill\n");
});

test("publishes non-secret APM context in human and machine summaries", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "ai-context-apm-"));
  await writeFile(path.join(root, "app.py"), "def app(): pass\n");
  await initializeProject(root);
  const configPath = path.join(root, "ai-context.config.json");
  const config = JSON.parse(await readFile(configPath, "utf8"));
  config.apm = {
    enabled: true,
    provider: "grafana",
    serviceName: "billing-api",
    environment: "production",
    dashboardUrl: "https://grafana.example.test/d/billing",
  };
  await writeFile(configPath, `${JSON.stringify(config, null, 2)}\n`);

  await syncProject(root);
  assert.match(
    await readFile(path.join(root, ".ai", "summaries", "summary.md"), "utf8"),
    /grafana \(billing-api, production\)/u,
  );
  const machine = JSON.parse(
    await readFile(path.join(root, ".ai", "summaries", "summary.json"), "utf8"),
  );
  assert.deepEqual(machine.apm, config.apm);
  assert.equal(machine.schemaVersion, 3);
  assert.equal(machine.tokenEconomy.estimatedSourceTokens > 0, true);
  assert.equal(machine.tokenEconomy.estimatedTokensSaved >= 0, true);
});

test("creates the complete structured AI workspace and sync scripts", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "ai-context-layout-"));
  await writeFile(path.join(root, "main.go"), "package main\nfunc main() {}\n");
  await initializeProject(root);

  const directories = [
    "memory", "skills", "prompts", "recipes", "templates", "context", "summaries",
    "examples", "architecture", "adr", "glossary", "playbooks", "manifests", "indexes",
    "retrieval", "workflows", "docs", "sync",
  ];
  const syncScripts = [
    "ai-sync.ts", "ai-summary.ts", "ai-index.ts", "ai-vectorize.ts", "ai-export.ts",
  ];

  await Promise.all(directories.map((directory) => access(path.join(root, ".ai", directory))));
  await Promise.all(syncScripts.map((file) => access(path.join(root, ".ai", "sync", file))));
  await access(path.join(root, ".ai", "memory", "project-memory.md"));
  await access(path.join(root, ".ai", "memory", "coding-style.md"));
  await access(path.join(root, ".ai", "indexes", "repository-map.md"));
  await access(path.join(root, ".ai", "summaries", "summary.json"));
  await access(path.join(root, ".ai", "sync", ".cache.json"));

  const prompt = await generateControl(root, "prompt", "Review API");
  const workflow = await generateControl(root, "workflow", "Safe release");
  assert.equal(prompt.file, path.join(".ai", "prompts", "review-api", "prompt.md"));
  assert.equal(workflow.file, path.join(".ai", "workflows", "safe-release", "workflow.md"));
});
