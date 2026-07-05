import path from "node:path";
import { resolveInside } from "./files.js";

export const STRUCTURE_DIRECTORIES = Object.freeze([
  "memory",
  "skills",
  "prompts",
  "recipes",
  "templates",
  "context",
  "summaries",
  "examples",
  "architecture",
  "adr",
  "glossary",
  "playbooks",
  "manifests",
  "indexes",
  "retrieval",
  "workflows",
  "docs",
  "sync",
]);

export const CONTEXT_FILES = Object.freeze({
  projectMemory: path.join("memory", "project-memory.md"),
  codingStyle: path.join("memory", "coding-style.md"),
  summary: path.join("summaries", "summary.md"),
  machineSummary: path.join("summaries", "summary.json"),
  repositoryMap: path.join("indexes", "repository-map.md"),
  cache: path.join("sync", ".cache.json"),
});

export function contextPath(projectRoot, contextDir, relative) {
  return resolveInside(resolveInside(projectRoot, contextDir), relative);
}
