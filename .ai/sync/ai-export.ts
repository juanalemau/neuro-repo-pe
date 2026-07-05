import { readFile } from "node:fs/promises";
import path from "node:path";

const summary = await readFile(
  path.join(process.cwd(), ".ai", "summaries", "summary.json"),
  "utf8",
);
process.stdout.write(summary);
