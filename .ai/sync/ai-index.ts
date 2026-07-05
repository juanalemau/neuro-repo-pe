import { inspectProject } from "ai-context-init";

const result = await inspectProject(process.cwd());
console.log(result.repositoryMap.content);
