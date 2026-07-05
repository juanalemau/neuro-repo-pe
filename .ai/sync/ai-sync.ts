import { syncProject } from "ai-context-init";

const result = await syncProject(process.cwd());
console.log(`Synchronized ${result.generated.length} AI context files.`);
