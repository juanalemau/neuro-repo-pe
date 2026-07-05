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
    runtimes: [],
  });
});

test("detects declared runtime versions without executing project tools", () => {
  const files = [
    {
      path: "package.json",
      content: JSON.stringify({ engines: { node: ">=22" } }),
    },
    { path: "pyproject.toml", content: '[project]\nrequires-python = ">=3.12"\n' },
    { path: "go.mod", content: "module example.test/app\n\ngo 1.24\n" },
  ];

  assert.deepEqual(detectStack(files).runtimes, [
    { name: "Node.js", version: ">=22", source: ".nvmrc/.node-version/package.json" },
    { name: "Python", version: ">=3.12", source: ".python-version/pyproject.toml" },
    { name: "Go", version: "1.24", source: "go.mod" },
  ]);
});

test("detects JVM and additional popular runtime declarations", () => {
  const files = [
    { path: "pom.xml", content: "<properties><java.version>21</java.version></properties>" },
    { path: ".ruby-version", content: "3.4.1\n" },
    { path: ".swift-version", content: "6.1\n" },
    { path: ".tool-versions", content: "erlang 27.0\nelixir 1.18.2\n" },
  ];

  assert.deepEqual(detectStack(files).runtimes, [
    { name: "Java", version: "21", source: ".java-version/.sdkmanrc/pom.xml/build.gradle" },
    { name: "Ruby", version: "3.4.1", source: ".ruby-version" },
    { name: "Swift", version: "6.1", source: ".swift-version" },
    { name: "Elixir", version: "1.18.2", source: ".tool-versions" },
  ]);
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
