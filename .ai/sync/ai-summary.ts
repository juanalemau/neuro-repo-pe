import { inspectProject } from "ai-context-init";

const result = await inspectProject(process.cwd());
console.log(JSON.stringify({
  stack: result.model.stack,
  statistics: result.model.statistics,
}, null, 2));
