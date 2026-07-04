import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { doctorProject, initializeProject, inspectProject, syncProject } from "../src/core/engine.js";

test("initializes, preserves human context, and reuses cached analysis", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "ai-context-init-"));
  await writeFile(
    path.join(root, "package.json"),
    JSON.stringify({ name: "fixture", dependencies: { express: "^5.0.0" } }),
  );
  await writeFile(path.join(root, "app.js"), "export function startServer() {}\n");

  const initialized = await initializeProject(root, { tokenBudget: 512 });
  assert.equal(initialized.model.statistics.files > 0, true);
  assert.match(await readFile(path.join(root, ".ai", "summary.md"), "utf8"), /Express/u);

  const customProject = "# My carefully written project context\n";
  await writeFile(path.join(root, ".ai", "project.md"), customProject);
  const synchronized = await syncProject(root, { tokenBudget: 512 });

  assert.equal(await readFile(path.join(root, ".ai", "project.md"), "utf8"), customProject);
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
