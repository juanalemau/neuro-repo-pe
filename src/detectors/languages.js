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

  return { languages, frameworks: [...new Set(frameworks)] };
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
