# neuro-repo-pe

> Sistema operacional de contexto para IAs.

`ai-context-init` é o pacote inicial deste repositório: uma biblioteca Node.js e CLI para criar
contexto compacto, incremental e independente de fornecedor para agentes de IA em qualquer
projeto.

O objetivo não é enviar o repositório inteiro a um modelo. A ferramenta detecta a stack, extrai
símbolos importantes, classifica arquivos e gera um mapa dentro de um orçamento explícito de
tokens. Arquivos humanos pequenos guardam propósito, arquitetura e convenções; arquivos gerados
ajudam o agente a descobrir o código certo sob demanda. Cada execução mostra uma estimativa
auditável de tokens evitados, percentual de redução, compressão e reuso do cache local.

## Estado

Versão estruturada (`0.2.0`). Suporte:

- TypeScript/JavaScript, Python, Java/Kotlin, Go, Rust, C#, Ruby, PHP e outras stacks por extensão;
- detecção de frameworks por manifestos e dependências;
- mapa de símbolos com orçamento configurável;
- relatório detalhado de economia de tokens no terminal, Markdown e JSON;
- cache incremental por SHA-256;
- detecção declarativa de versões de Node.js, Python, Java, Go, Rust, .NET, PHP, Ruby, Dart,
  Swift e Elixir;
- pontes para AGENTS.md, Claude Code, GitHub Copilot e Gemini;
- controles editáveis para skills, SDDs e perfis, criados por comando;
- contexto vendor-neutral para APM, sem credenciais no repositório;
- comandos `init`, `sync`, `inspect`, `economy`, `doctor` e `generate`;
- zero dependências de runtime.

## Uso rápido

Com Node.js 20 ou superior:

```bash
npx ai-context-init init .
npx ai-context-init sync .
npx ai-context-init economy .
npx ai-context-init doctor .
npx ai-context-init generate skill "revisão de segurança" .
npx ai-context-init generate sdd "autenticação passkey" .
```

Durante o desenvolvimento deste repositório:

```bash
node src/cli.js init /caminho/do/projeto
```

O `init` cria apenas arquivos ausentes e preserva documentação existente. O `sync` reescreve
somente artefatos declaradamente gerados:

```text
.ai/
├── memory/
│   ├── project-memory.md
│   └── coding-style.md
├── skills/
├── prompts/
├── recipes/
├── templates/
├── context/
├── summaries/          # summary.md e summary.json gerados
├── examples/
├── architecture/
├── adr/
├── glossary/
├── playbooks/
├── manifests/
├── indexes/            # repository-map.md gerado
├── retrieval/
├── workflows/
├── docs/
└── sync/               # scripts TypeScript editáveis e cache incremental
```

## Configuração

`ai-context.config.json`:

```json
{
  "contextDir": ".ai",
  "controlsDir": ".",
  "tokenBudget": 1800,
  "maxFileBytes": 262144,
  "include": [],
  "exclude": ["fixtures/**"],
  "bridges": ["agents", "claude", "copilot", "gemini"],
  "apm": {
    "enabled": false,
    "provider": "generic",
    "serviceName": "",
    "environment": "",
    "dashboardUrl": ""
  }
}
```

Também é possível testar outro orçamento sem alterar o arquivo:

```bash
ai-context inspect . --budget 1000
ai-context sync . --budget 1000
```

## Workspace de IA

O layout separa memória, conhecimento reutilizável, arquitetura, recuperação e artefatos gerados.
Arquivos editáveis são criados uma vez e nunca sobrescritos:

```bash
ai-context generate skill "deploy kubernetes" .
ai-context generate prompt "revisão de PR" .
ai-context generate recipe "rollback seguro" .
ai-context generate adr "banco transacional" .
ai-context generate workflow "release" .
ai-context generate sdd "fila de pagamentos" .
ai-context generate profile "time de dados" .
```

Cada template recebe a baseline detectada do projeto, por exemplo `TypeScript; Node.js >=22`.
As versões são lidas de manifestos como `package.json`, `.nvmrc`, `pyproject.toml`, `pom.xml`,
`go.mod`, `rust-toolchain.toml`, `global.json`, `composer.json` e `pubspec.yaml`, além de arquivos
convencionais de versão. A ferramenta não executa o runtime instalado, então a saída é
reproduzível em máquinas e CI diferentes.

## Integração com APM

O bloco `apm` associa o contexto técnico à observabilidade interna sem acoplar a biblioteca a um
fornecedor:

```json
{
  "apm": {
    "enabled": true,
    "provider": "datadog",
    "serviceName": "checkout-api",
    "environment": "production",
    "dashboardUrl": "https://app.datadoghq.com/dashboard/example"
  }
}
```

Esses metadados aparecem em `.ai/summaries/summary.md`, `.ai/summaries/summary.json` e no relatório
do terminal. Chaves, tokens e DSNs não fazem parte da configuração: mantenha credenciais em
variáveis de ambiente ou no cofre usado pela empresa.

## Saída do terminal

Comandos humanos destacam o nome do projeto e mostram stack, runtime, arquivos, orçamento,
cache, APM e artefatos afetados:

```text
╭─ AI CONTEXT ─────────────────────────────
│ checkout-api
╰──────────────────────────────────────────
✓ Context synchronized: .ai
  Stack: TypeScript · Node.js >=22
  Files: 184 scanned · 612 symbols
  Map: ~1760/1800 tokens
  Economy: ~48240 tokens avoided · 96.5% reduction
  Context: ~50000 source → ~1760 map tokens · 28.41:1
  Cache: 181 reused analyses · 98.4%
  APM: datadog · checkout-api
```

`economy` mostra apenas o relatório humano. `inspect` permanece em JSON puro para automações.

## API

```js
import { generateControl, initializeProject, inspectProject, syncProject } from "ai-context-init";

await initializeProject(process.cwd());
const report = await inspectProject(process.cwd(), { tokenBudget: 1200 });
await syncProject(process.cwd());
await generateControl(process.cwd(), "skill", "release segura");
```

## Princípios

1. Contexto em camadas: propósito primeiro, mapa depois, fonte somente quando necessária.
2. Orçamento antes de volume: cada mapa tem limite e economia mensuráveis.
3. Uma fonte de verdade: arquivos específicos de agentes são pontes pequenas.
4. Incremental por padrão: arquivos inalterados reutilizam análise anterior.
5. Humano e gerado não se misturam: sincronização nunca apaga decisões manuais.
6. Sem API de IA: análise local, determinística e sem enviar código para terceiros.

Comece pelo [Guia essencial para desenvolvedores](docs/developer-guide.md).

Veja também [Arquitetura](docs/architecture.md), [Economia de tokens](docs/token-economy.md),
[Layout `.ai`](docs/layout.md),
[Linguagens e versões](docs/languages.md), [Roadmap](docs/roadmap.md) e
[Guia completo da CLI](docs/cli.md), além do
[Posicionamento no ecossistema](docs/landscape.md).

## Licença

MIT.
