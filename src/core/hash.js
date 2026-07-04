import { createHash } from "node:crypto";

export function hash(value) {
  return createHash("sha256").update(value).digest("hex");
}
