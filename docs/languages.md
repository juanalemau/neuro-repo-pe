# Linguagens e versões

A biblioteca roda em Node.js 20+, mas analisa projetos poliglotas. O detector usa extensões,
manifestos e arquivos declarativos; ele não importa nem executa código do projeto.

## Linguagens reconhecidas

| Família | Extensões principais | Declaração de versão reconhecida |
|---|---|---|
| JavaScript / TypeScript | `.js`, `.jsx`, `.mjs`, `.cjs`, `.ts`, `.tsx` | `.nvmrc`, `.node-version`, `package.json#engines.node` |
| Python | `.py` | `.python-version`, `pyproject.toml#requires-python`, `runtime.txt` |
| Java / Kotlin | `.java`, `.kt`, `.kts` | `.java-version`, `.sdkmanrc`, `pom.xml`, Gradle toolchains |
| Go | `.go` | `go.mod` |
| Rust | `.rs` | `rust-toolchain`, `rust-toolchain.toml` |
| C# / .NET | `.cs` | `global.json#sdk.version` |
| Ruby | `.rb` | `.ruby-version` |
| PHP | `.php` | `composer.json#config.platform.php` |
| Dart / Flutter | `.dart` | `pubspec.yaml#environment.sdk` |
| Swift | `.swift` | `.swift-version` |
| Elixir | `.ex`, `.exs` | `.tool-versions` |
| C / C++ | `.c`, `.h`, `.cc`, `.cpp`, `.hpp` | ainda sem detector de toolchain |
| Scala | `.scala` | ainda sem detector de versão |
| Shell | `.sh` | não aplicável |
| Vue / Svelte | `.vue`, `.svelte` | usa a versão de Node.js declarada pelo projeto |

Frameworks e ferramentas também são inferidos por marcadores e dependências, incluindo React,
Angular, Vue, Express, Fastify, NestJS, Next.js, Nuxt, Vite, SvelteKit, Django, Maven, Gradle,
Cargo, Flutter, Mix e outros manifestos conhecidos.

## Como a versão afeta os arquivos

`init` detecta a baseline antes de criar os arquivos humanos. `generate` repete a detecção antes
de criar um skill, SDD ou perfil. O template registra a linguagem e o runtime declarados para que
exemplos e decisões posteriores respeitem a compatibilidade do repositório.

Se nenhuma versão estiver declarada, o template diz `runtime version not declared`; a ferramenta
não adivinha a versão instalada na máquina. Para obter templates estáveis, declare a versão no
manifesto convencional da stack.

Projetos com várias linguagens mantêm todas as linguagens e runtimes detectados no mesmo contexto.
Isso é intencional para monólitos, ferramentas de build, infraestrutura e repositórios poliglotas.
