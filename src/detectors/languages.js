import path from "node:path";

const LANGUAGE_BY_EXTENSION = new Map([
  [".ts", "TypeScript"],
  [".tsx", "TypeScript"],
  [".js", "JavaScript"],
  [".jsx", "JavaScript"],
  [".mjs", "JavaScript"],
  [".cjs", "JavaScript"],
  [".py", "Python"],
  [".java", "Java"],
  [".kt", "Kotlin"],
  [".kts", "Kotlin"],
  [".go", "Go"],
  [".rs", "Rust"],
  [".cs", "C#"],
  [".rb", "Ruby"],
  [".php", "PHP"],
  [".swift", "Swift"],
  [".c", "C"],
  [".h", "C/C++"],
  [".cc", "C++"],
  [".cpp", "C++"],
  [".hpp", "C++"],
  [".vue", "Vue"],
  [".svelte", "Svelte"],
  [".dart", "Dart"],
  [".ex", "Elixir"],
  [".exs", "Elixir"],
  [".scala", "Scala"],
  [".sh", "Shell"],
]);

const FRAMEWORK_MARKERS = [
  ["angular.json", "Angular"],
  ["next.config.js", "Next.js"],
  ["next.config.mjs", "Next.js"],
  ["next.config.ts", "Next.js"],
  ["nuxt.config.ts", "Nuxt"],
  ["vite.config.ts", "Vite"],
  ["vite.config.js", "Vite"],
  ["svelte.config.js", "SvelteKit"],
  ["manage.py", "Django"],
  ["pyproject.toml", "Python project"],
  ["pom.xml", "Maven"],
  ["build.gradle", "Gradle"],
  ["build.gradle.kts", "Gradle"],
  ["go.mod", "Go modules"],
  ["Cargo.toml", "Cargo"],
  ["Gemfile", "Ruby/Bundler"],
  ["composer.json", "Composer"],
  ["pubspec.yaml", "Flutter/Dart"],
  ["mix.exs", "Elixir/Mix"],
];

export function detectStack(files) {
  const counts = new Map();
  const paths = new Set(files.map((file) => file.path));

  for (const file of files) {
    const language = LANGUAGE_BY_EXTENSION.get(path.extname(file.path).toLowerCase());
    if (language) counts.set(language, (counts.get(language) ?? 0) + 1);
  }

  const languages = [...counts.entries()]
    .sort((left, right) => right[1] - left[1])
    .map(([name, fileCount]) => ({ name, fileCount }));
  const frameworks = FRAMEWORK_MARKERS
    .filter(([marker]) => paths.has(marker))
    .map(([, framework]) => framework);

  detectPackageFrameworks(files, frameworks);

  return {
    languages,
    frameworks: [...new Set(frameworks)],
    runtimes: detectRuntimeVersions(files),
  };
}

function detectRuntimeVersions(files) {
  const runtimes = [];
  const byPath = new Map(files.map((file) => [file.path, file.content.trim()]));
  const add = (name, version, source) => {
    if (version && !runtimes.some((item) => item.name === name)) {
      runtimes.push({ name, version: version.trim(), source });
    }
  };

  const packageJson = parseJson(byPath.get("package.json"));
  add("Node.js", byPath.get(".nvmrc") || byPath.get(".node-version") || packageJson?.engines?.node, ".nvmrc/.node-version/package.json");

  const pyproject = byPath.get("pyproject.toml");
  add("Python", byPath.get(".python-version") || match(pyproject, /requires-python\s*=\s*["']([^"']+)/u), ".python-version/pyproject.toml");
  add("Python", match(byPath.get("runtime.txt"), /^python-?(.+)$/imu), "runtime.txt");

  add("Go", match(byPath.get("go.mod"), /^go\s+([^\s]+)$/mu), "go.mod");
  add("Rust", rustVersion(byPath), "rust-toolchain.toml/rust-toolchain");

  const globalJson = parseJson(byPath.get("global.json"));
  add(".NET", globalJson?.sdk?.version, "global.json");

  const pom = byPath.get("pom.xml");
  const gradle = byPath.get("build.gradle") || byPath.get("build.gradle.kts");
  add(
    "Java",
    byPath.get(".java-version")
      || match(byPath.get(".sdkmanrc"), /^java=([^\s]+)$/mu)
      || match(pom, /<(?:java\.version|maven\.compiler\.release|maven\.compiler\.source)>([^<]+)/u)
      || match(gradle, /JavaLanguageVersion\.of\((\d+)\)/u),
    ".java-version/.sdkmanrc/pom.xml/build.gradle",
  );

  const composer = parseJson(byPath.get("composer.json"));
  add("PHP", composer?.config?.platform?.php, "composer.json");

  add("Ruby", byPath.get(".ruby-version"), ".ruby-version");
  add("Dart", match(byPath.get("pubspec.yaml"), /^\s*sdk:\s*["']?([^"'\n]+)/mu), "pubspec.yaml");
  add("Swift", byPath.get(".swift-version"), ".swift-version");
  add("Elixir", match(byPath.get(".tool-versions"), /^elixir\s+([^\s]+)$/mu), ".tool-versions");
  return runtimes;
}

function parseJson(content) {
  try {
    return content ? JSON.parse(content) : undefined;
  } catch {
    return undefined;
  }
}

function match(content, pattern) {
  return content?.match(pattern)?.[1];
}

function rustVersion(byPath) {
  const plain = byPath.get("rust-toolchain");
  if (plain) return plain.split(/\s/u)[0];
  return match(byPath.get("rust-toolchain.toml"), /^\s*channel\s*=\s*["']([^"']+)/mu);
}

function detectPackageFrameworks(files, frameworks) {
  const packageJson = files.find((file) => file.path === "package.json");
  if (!packageJson) return;

  try {
    const manifest = JSON.parse(packageJson.content);
    const dependencies = { ...manifest.dependencies, ...manifest.devDependencies };
    const candidates = [
      ["react", "React"],
      ["@angular/core", "Angular"],
      ["vue", "Vue"],
      ["express", "Express"],
      ["fastify", "Fastify"],
      ["nestjs", "NestJS"],
      ["@nestjs/core", "NestJS"],
    ];
    for (const [dependency, framework] of candidates) {
      if (dependencies[dependency]) frameworks.push(framework);
    }
  } catch {
    // Invalid manifests are reported by doctor; detection remains best-effort.
  }
}
