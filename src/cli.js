#!/usr/bin/env node

import process from "node:process";
import { doctorProject, initializeProject, inspectProject, syncProject } from "./core/engine.js";

const VERSION = "0.1.0";

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
      console.log(`Initialized AI context in ${result.root}`);
      report(result);
      break;
    }
    case "sync": {
      const result = await syncProject(root, options);
      console.log(`Synchronized AI context in ${result.root}`);
      report(result);
      break;
    }
    case "inspect": {
      const result = await inspectProject(root, options);
      console.log(JSON.stringify({
        root: result.root,
        stack: result.model.stack,
        statistics: result.model.statistics,
        repositoryMap: {
          includedFiles: result.repositoryMap.includedFiles,
          estimatedTokens: result.repositoryMap.estimatedTokens,
          budget: result.config.tokenBudget,
        },
      }, null, 2));
      break;
    }
    case "doctor": {
      const result = await doctorProject(root);
      if (!result.ok) {
        for (const issue of result.issues) console.error(`✗ ${issue}`);
        process.exitCode = 1;
      } else {
        console.log("✓ AI context is healthy and up to date");
      }
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
    else if (argument.startsWith("-")) throw new Error(`Unknown option: ${argument}`);
    else positional.push(argument);
  }

  if (positional[0]) command = positional[0];
  if (positional[1]) root = positional[1];
  if (positional.length > 2) throw new Error("Too many positional arguments");
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

function report(result) {
  console.log(
    `${result.model.statistics.files} files scanned, ` +
    `${result.model.statistics.symbols} symbols, ` +
    `~${result.repositoryMap.estimatedTokens}/${result.config.tokenBudget} map tokens, ` +
    `${result.model.statistics.cacheHits} cache hits`,
  );
}

function printHelp() {
  console.log(`ai-context-init ${VERSION}

Usage:
  ai-context init [directory] [options]
  ai-context sync [directory] [options]
  ai-context inspect [directory] [options]
  ai-context doctor [directory]

Options:
  --budget <tokens>       Repository map token budget (minimum 256)
  --context-dir <path>    Context directory (default: .ai)
  -h, --help              Show help
  -v, --version           Show version`);
}

main(process.argv.slice(2)).catch((error) => {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
});
