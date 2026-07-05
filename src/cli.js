#!/usr/bin/env node

import process from "node:process";
import path from "node:path";
import {
  doctorProject,
  generateControl,
  initializeProject,
  inspectProject,
  syncProject,
} from "./core/engine.js";
import { CONTROL_TYPES } from "./generators/controls.js";

const VERSION = "0.2.0";

async function main(argv) {
  const { command, root, options } = parseArguments(argv);

  if (options.version) {
    console.log(VERSION);
    return;
  }
  if (options.help || command === "help") {
    printHelp();
    return;
  }

  switch (command) {
    case "init": {
      const result = await initializeProject(root, options);
      report(result, "initialized");
      break;
    }
    case "sync": {
      const result = await syncProject(root, options);
      report(result, "synchronized");
      break;
    }
    case "inspect": {
      const result = await inspectProject(root, options);
      console.log(JSON.stringify({
        root: result.root,
        stack: result.model.stack,
        apm: result.config.apm,
        statistics: result.model.statistics,
        repositoryMap: {
          includedFiles: result.repositoryMap.includedFiles,
          estimatedTokens: result.repositoryMap.estimatedTokens,
          budget: result.config.tokenBudget,
        },
        tokenEconomy: result.repositoryMap.tokenEconomy,
      }, null, 2));
      break;
    }
    case "economy": {
      const result = await inspectProject(root, options);
      printBanner(result.root);
      printEconomy(result.repositoryMap.tokenEconomy);
      break;
    }
    case "doctor": {
      const result = await doctorProject(root);
      printBanner(result.root);
      if (!result.ok) {
        for (const issue of result.issues) console.error(`✗ ${issue}`);
        process.exitCode = 1;
      } else {
        console.log("✓ AI context is healthy and up to date");
      }
      break;
    }
    case "generate": {
      const result = await generateControl(root, options.controlType, options.controlName, options);
      printBanner(result.root);
      console.log(`${result.created ? "✓ Created" : "• Preserved existing"} ${result.file}`);
      console.log(`  Type: ${result.type}`);
      console.log(`  Stack: ${formatStack(result.model.stack)}`);
      break;
    }
    default:
      throw new Error(`Unknown command: ${command}`);
  }
}

function parseArguments(argv) {
  let command = "help";
  let root = process.cwd();
  const options = {};
  const positional = [];

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--help" || argument === "-h") options.help = true;
    else if (argument === "--version" || argument === "-v") options.version = true;
    else if (argument === "--budget") options.tokenBudget = parseInteger(argv[++index], "--budget");
    else if (argument === "--context-dir") options.contextDir = requiredValue(argv[++index], "--context-dir");
    else if (argument === "--controls-dir") options.controlsDir = requiredValue(argv[++index], "--controls-dir");
    else if (argument.startsWith("-")) throw new Error(`Unknown option: ${argument}`);
    else positional.push(argument);
  }

  if (positional[0]) command = positional[0];
  if (command === "generate" && !options.help && !options.version) {
    options.controlType = positional[1];
    options.controlName = positional[2];
    if (!options.controlType || !options.controlName) {
      throw new Error("generate requires a type and name");
    }
    if (positional[3]) root = positional[3];
    if (positional.length > 4) throw new Error("Too many positional arguments");
  } else if (command !== "generate") {
    if (positional[1]) root = positional[1];
    if (positional.length > 2) throw new Error("Too many positional arguments");
  }
  return { command, root, options };
}

function requiredValue(value, option) {
  if (!value || value.startsWith("-")) throw new Error(`${option} requires a value`);
  return value;
}

function parseInteger(value, option) {
  const parsed = Number.parseInt(requiredValue(value, option), 10);
  if (!Number.isInteger(parsed)) throw new Error(`${option} requires an integer`);
  return parsed;
}

function report(result, action) {
  printBanner(result.root);
  console.log(`✓ Context ${action}: ${result.config.contextDir}`);
  console.log(`  Stack: ${formatStack(result.model.stack)}`);
  console.log(`  Files: ${result.model.statistics.files} scanned · ${result.model.statistics.symbols} symbols`);
  console.log(`  Map: ~${result.repositoryMap.estimatedTokens}/${result.config.tokenBudget} tokens`);
  printEconomy(result.repositoryMap.tokenEconomy, "  ");
  console.log(`  APM: ${result.config.apm.enabled ? `${result.config.apm.provider} · ${result.config.apm.serviceName || "unnamed service"}` : "disabled"}`);
  if (result.created?.length) console.log(`  Editable files created: ${result.created.join(", ")}`);
  if (result.generated?.length) console.log(`  Generated files: ${result.generated.join(", ")}`);
}

function printEconomy(economy, indent = "") {
  console.log(
    `${indent}Economy: ~${economy.estimatedTokensSaved} tokens avoided · ` +
    `${economy.reductionPercent}% reduction`,
  );
  console.log(
    `${indent}Context: ~${economy.estimatedSourceTokens} source → ` +
    `~${economy.compactMapTokens} map tokens · ${economy.compressionRatio}:1`,
  );
  console.log(
    `${indent}Budget: ${economy.compactMapTokens}/${economy.budgetTokens} tokens · ` +
    `${economy.budgetUtilizationPercent}% used`,
  );
  console.log(
    `${indent}Coverage: ${economy.indexedFiles} indexed · ${economy.omittedFiles} omitted`,
  );
  console.log(
    `${indent}Cache: ${economy.analysisCacheHits} reused analyses · ` +
    `${economy.analysisCacheHitPercent}%`,
  );
}

function printBanner(root) {
  console.log(`\n╭─ AI CONTEXT ─────────────────────────────`);
  console.log(`│ ${path.basename(root)}`);
  console.log(`╰──────────────────────────────────────────`);
}

function formatStack(stack) {
  const languages = stack.languages.map((item) => item.name).join(", ") || "not detected";
  const runtimes = stack.runtimes?.map((item) => `${item.name} ${item.version}`).join(", ");
  return runtimes ? `${languages} · ${runtimes}` : languages;
}

function printHelp() {
  console.log(`ai-context-init ${VERSION}

Usage:
  ai-context init [directory] [options]
  ai-context sync [directory] [options]
  ai-context inspect [directory] [options]
  ai-context economy [directory] [options]
  ai-context doctor [directory]
  ai-context generate <type> <name> [directory]

Options:
  --budget <tokens>       Repository map token budget (minimum 256)
  --context-dir <path>    Context directory (default: .ai)
  --controls-dir <path>   Artifact base inside context (default: .)
  -h, --help              Show help
  -v, --version           Show version

Generate types:
  ${CONTROL_TYPES.join(", ")}`);
}

main(process.argv.slice(2)).catch((error) => {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
});
