# neuro-repo-pe

> Sistema operacional de contexto para IAs.

`ai-context-init` é o pacote inicial deste repositório: uma biblioteca Node.js e CLI para criar
contexto compacto, incremental e independente de fornecedor para agentes de IA em qualquer
projeto.

O objetivo não é enviar o repositório inteiro a um modelo. A ferramenta detecta a stack, extrai
símbolos importantes, classifica arquivos e gera um mapa dentro de um orçamento explícito de
tokens. Arquivos humanos pequenos guardam propósito, arquitetura e convenções; arquivos gerados
ajudam o agente a descobrir o código certo sob demanda.

## Estado

MVP funcional (`0.1.0`). Suporte inicial:

- TypeScript/JavaScript, Python, Java/Kotlin, Go, Rust, C#, Ruby, PHP e outras stacks por extensão;
- detecção de frameworks por manifestos e dependências;
- mapa de símbolos com orçamento configurável;
- cache incremental por SHA-256;
- pontes para AGENTS.md, Claude Code, GitHub Copilot e Gemini;
- comandos `init`, `sync`, `inspect` e `doctor`;
- zero dependências de runtime.

## Uso rápido

Com Node.js 20 ou superior:

```bash
npx ai-context-init init .
npx ai-context-init sync .
npx ai-context-init doctor .
```

Durante o desenvolvimento deste repositório:

```bash
node src/cli.js init /caminho/do/projeto
```

O `init` cria apenas arquivos ausentes e preserva documentação existente. O `sync` reescreve
somente artefatos declaradamente gerados:

```text
.ai/
├── project.md          # humano, nunca sobrescrito
├── architecture.md     # humano, nunca sobrescrito
├── conventions.md      # humano, nunca sobrescrito
├── summary.md          # gerado
├── repository-map.md   # gerado e limitado por tokens
├── summary.json        # gerado para integrações
└── .cache.json         # cache local incremental
```

## Configuração

`ai-context.config.json`:

```json
{
  "contextDir": ".ai",
  "tokenBudget": 1800,
  "maxFileBytes": 262144,
  "include": [],
  "exclude": ["fixtures/**"],
  "bridges": ["agents", "claude", "copilot", "gemini"]
}
```

Também é possível testar outro orçamento sem alterar o arquivo:

```bash
ai-context inspect . --budget 1000
ai-context sync . --budget 1000
```

## API

```js
import { initializeProject, inspectProject, syncProject } from "ai-context-init";

await initializeProject(process.cwd());
const report = await inspectProject(process.cwd(), { tokenBudget: 1200 });
await syncProject(process.cwd());
```

## Princípios

1. Contexto em camadas: propósito primeiro, mapa depois, fonte somente quando necessária.
2. Orçamento antes de volume: cada mapa tem um limite mensurável.
3. Uma fonte de verdade: arquivos específicos de agentes são pontes pequenas.
4. Incremental por padrão: arquivos inalterados reutilizam análise anterior.
5. Humano e gerado não se misturam: sincronização nunca apaga decisões manuais.
6. Sem API de IA: análise local, determinística e sem enviar código para terceiros.

Veja [Arquitetura](docs/architecture.md), [Roadmap](docs/roadmap.md) e
[Posicionamento no ecossistema](docs/landscape.md).

## Licença

MIT.
