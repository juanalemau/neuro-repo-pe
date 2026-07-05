import { readFile } from "node:fs/promises";
import path from "node:path";

export const DEFAULT_CONFIG = Object.freeze({
  contextDir: ".ai",
  controlsDir: ".",
  tokenBudget: 1800,
  maxFileBytes: 256 * 1024,
  include: [],
  exclude: [],
  bridges: ["agents", "claude", "copilot", "gemini"],
  apm: {
    enabled: false,
    provider: "generic",
    serviceName: "",
    environment: "",
    dashboardUrl: "",
  },
});

const BRIDGES = new Set(DEFAULT_CONFIG.bridges);

export async function loadConfig(root) {
  const configPath = path.join(root, "ai-context.config.json");
  let input = {};

  try {
    input = JSON.parse(await readFile(configPath, "utf8"));
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw new Error(`Invalid configuration at ${configPath}: ${error.message}`);
    }
  }

  const config = {
    ...DEFAULT_CONFIG,
    ...input,
    apm: { ...DEFAULT_CONFIG.apm, ...input.apm },
  };
  validateConfig(config);
  return config;
}

export function validateConfig(config) {
  if (!Number.isInteger(config.tokenBudget) || config.tokenBudget < 256) {
    throw new Error("tokenBudget must be an integer greater than or equal to 256");
  }
  if (!Number.isInteger(config.maxFileBytes) || config.maxFileBytes < 1024) {
    throw new Error("maxFileBytes must be an integer greater than or equal to 1024");
  }
  if (!Array.isArray(config.include) || !Array.isArray(config.exclude)) {
    throw new Error("include and exclude must be arrays");
  }
  if (!Array.isArray(config.bridges) || config.bridges.some((item) => !BRIDGES.has(item))) {
    throw new Error(`bridges must contain only: ${[...BRIDGES].join(", ")}`);
  }
  if (typeof config.contextDir !== "string" || !config.contextDir.trim()) {
    throw new Error("contextDir must be a non-empty string");
  }
  if (typeof config.controlsDir !== "string" || !config.controlsDir.trim()) {
    throw new Error("controlsDir must be a non-empty string");
  }
  if (!config.apm || typeof config.apm !== "object" || Array.isArray(config.apm)) {
    throw new Error("apm must be an object");
  }
  if (typeof config.apm.enabled !== "boolean") {
    throw new Error("apm.enabled must be a boolean");
  }
  for (const field of ["provider", "serviceName", "environment", "dashboardUrl"]) {
    if (typeof config.apm[field] !== "string") {
      throw new Error(`apm.${field} must be a string`);
    }
  }
}
