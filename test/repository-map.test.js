import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateTokenEconomy,
  generateRepositoryMap,
} from "../src/generators/repository-map.js";

test("keeps repository map within its token budget", () => {
  const model = {
    files: Array.from({ length: 100 }, (_, index) => ({
      path: `src/feature-${index}/service.ts`,
      symbols: [`Feature${index}Service`, `Feature${index}Config`],
    })),
  };

  const result = generateRepositoryMap(model, 256);

  assert.ok(result.estimatedTokens <= 256);
  assert.ok(result.includedFiles < 100);
  assert.match(result.content, /Included \d+ of 100 files/u);
});

test("counts heading and footer as part of the budget", () => {
  const model = {
    files: Array.from({ length: 20 }, (_, index) => ({
      path: `src/a-very-long-feature-name-${index}.ts`,
      symbols: [`AQuiteLongPublicSymbolName${index}`],
    })),
  };

  const result = generateRepositoryMap(model, 256);

  assert.equal(result.estimatedTokens, Math.ceil(Buffer.byteLength(result.content, "utf8") / 4));
  assert.ok(result.estimatedTokens <= 256);
});

test("reports deterministic token savings and analysis cache reuse separately", () => {
  const economy = calculateTokenEconomy({
    files: Array.from({ length: 10 }, (_, index) => ({
      path: `src/file-${index}.js`,
      bytes: 400,
    })),
    statistics: {
      bytes: 4000,
      cacheHits: 8,
    },
  }, 200, 500, 7);

  assert.deepEqual(economy, {
    estimation: "UTF-8 bytes / 4",
    sourceBytes: 4000,
    estimatedSourceTokens: 1000,
    compactMapTokens: 200,
    estimatedTokensSaved: 800,
    reductionPercent: 80,
    compressionRatio: 5,
    budgetTokens: 500,
    budgetUtilizationPercent: 40,
    indexedFiles: 7,
    omittedFiles: 3,
    analysisCacheHits: 8,
    analysisCacheHitPercent: 80,
  });
});
