import assert from "node:assert/strict";
import test from "node:test";
import { detectStack } from "../src/detectors/languages.js";
import { extractSymbols } from "../src/detectors/symbols.js";

test("detects languages and frameworks from project files", () => {
  const files = [
    {
      path: "package.json",
      content: JSON.stringify({ dependencies: { react: "^19.0.0" } }),
    },
    { path: "src/app.tsx", content: "export function App() {}" },
    { path: "scripts/check.py", content: "def check(): pass" },
    { path: "vite.config.ts", content: "export default {}" },
  ];

  assert.deepEqual(detectStack(files), {
    languages: [
      { name: "TypeScript", fileCount: 2 },
      { name: "Python", fileCount: 1 },
    ],
    frameworks: ["Vite", "React"],
  });
});

test("extracts public symbols across language families", () => {
  assert.deepEqual(
    extractSymbols({
      path: "src/user.ts",
      content: "export interface User {}\nexport class UserService {}\nexport const USER_KIND = 'member';",
    }),
    ["User", "UserService", "USER_KIND"],
  );

  assert.deepEqual(
    extractSymbols({
      path: "service.py",
      content: "class Account:\n    pass\n\nasync def load_account():\n    pass",
    }),
    ["Account", "load_account"],
  );
});
