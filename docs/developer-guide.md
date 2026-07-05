# Guia essencial para desenvolvedores

Este guia explica como instalar, usar e customizar o `ai-context-init`, além dos benefícios que a
biblioteca oferece para equipes que trabalham com agentes de IA.

## O problema que a biblioteca resolve

Enviar um repositório inteiro para uma IA consome muitos tokens, aumenta latência e mistura
arquivos importantes com ruído. A biblioteca prepara um workspace local `.ai/` com memória humana,
um mapa ranqueado do código e artefatos reutilizáveis.

O fluxo esperado é:

```text
memória curta → resumo gerado → índice ranqueado → somente os arquivos necessários
```

O código fonte nunca é enviado pela biblioteca. Scanner, detectores, ranking, cache e geração
funcionam localmente e sem dependências de runtime.

## Benefícios principais

- Economia mensurável: compara o contexto fonte elegível com o mapa compacto.
- Orçamento controlado: o mapa nunca ultrapassa `tokenBudget`.
- Melhor recuperação: arquivos e símbolos mais relevantes aparecem primeiro.
- Menos repetição: cache SHA-256 reutiliza análises de arquivos inalterados.
- Compatibilidade poliglota: reconhece linguagens, frameworks e versões declaradas.
- Independência de fornecedor: o mesmo contexto serve para Codex, Claude, Copilot, Gemini e
  outras ferramentas.
- Conhecimento persistente: skills, prompts, receitas, ADRs e workflows ficam versionados junto
  ao projeto.
- Segurança: não armazena credenciais de APM nem chama APIs de IA.

## Instalação

Uso pontual, sem instalação global:

```bash
npx ai-context-init init .
```

Uso frequente:

```bash
npm install --global ai-context-init
ai-context --version
```

Como dependência de desenvolvimento:

```bash
npm install --save-dev ai-context-init
npx ai-context sync .
```

Requisito do CLI: Node.js 20 ou superior. O projeto analisado pode usar outra linguagem.

## Primeira configuração

Na raiz do projeto:

```bash
ai-context init .
```

O comando:

1. detecta linguagens, frameworks e runtimes declarados;
2. cria `ai-context.config.json`;
3. cria o workspace `.ai/` sem sobrescrever arquivos existentes;
4. cria pontes pequenas para as ferramentas habilitadas;
5. gera resumo, mapa, métricas de economia e cache.

Valide a instalação:

```bash
ai-context doctor .
ai-context economy .
```

## Fluxo diário

Depois de alterar código:

```bash
ai-context sync .
```

Antes de abrir uma tarefa para um agente:

1. mantenha `.ai/memory/project-memory.md` curto e atual;
2. execute `ai-context sync .`;
3. confira `ai-context economy .`;
4. permita que o agente leia o resumo e o índice antes de abrir fontes.

Em CI:

```bash
ai-context sync .
ai-context doctor .
npm test
```

`doctor` retorna código diferente de zero se a estrutura estiver incompleta ou o resumo e o mapa
estiverem desatualizados.

## Entendendo a economia de tokens

```bash
ai-context economy .
```

Exemplo:

```text
Economy: ~20986 tokens avoided · 97.5% reduction
Context: ~21520 source → ~534 map tokens · 40.3:1
Budget: 534/1800 tokens · 29.7% used
Coverage: 42 indexed · 0 omitted
Cache: 42 reused analyses · 100%
```

Os tokens usam a estimativa determinística `bytes UTF-8 / 4`. “Tokens evitados” é a diferença
entre enviar todos os arquivos textuais elegíveis e usar o mapa compacto numa passagem. Não é uma
garantia de cobrança de um fornecedor. Cache mede desempenho local e é informado separadamente.

Para dashboards e CI:

```bash
ai-context inspect .
```

O JSON contém `tokenEconomy`, stack, estatísticas, cobertura e orçamento. Veja as fórmulas em
[Economia de tokens](token-economy.md).

## O que pode ser editado

Arquivos humanos nunca são sobrescritos por `init` ou `sync`:

- `memory/`: propósito e estilo do projeto;
- `skills/`: conhecimento especializado;
- `prompts/`: prompts reutilizáveis;
- `recipes/`: procedimentos repetíveis;
- `templates/`: modelos internos;
- `context/`: perfis de equipe, domínio ou tarefa;
- `examples/`: exemplos preferidos;
- `architecture/` e `adr/`: arquitetura e decisões;
- `glossary/`: termos de negócio;
- `playbooks/`: operação e incidentes;
- `manifests/`: contratos de integração;
- `retrieval/`: políticas de busca e ranking;
- `workflows/`: fluxos multi-etapas;
- `docs/`: documentação adicional e SDDs;
- scripts `.ts` dentro de `sync/`.

Somente estes arquivos são substituídos por `sync`:

```text
.ai/summaries/summary.md
.ai/summaries/summary.json
.ai/indexes/repository-map.md
.ai/sync/.cache.json
```

## Criando artefatos

Use o CLI para manter nomes e diretórios consistentes:

```bash
ai-context generate skill "revisão de segurança" .
ai-context generate prompt "revisão de PR" .
ai-context generate recipe "rollback" .
ai-context generate adr "persistência principal" .
ai-context generate playbook "incidente crítico" .
ai-context generate workflow "release semanal" .
ai-context generate sdd "novo checkout" .
ai-context generate profile "time de pagamentos" .
```

O comando normaliza o nome, inclui a baseline de compatibilidade e preserva o arquivo se ele já
existir.

## Customizando a configuração

`ai-context.config.json`:

```json
{
  "$schema": "./docs/config.schema.json",
  "contextDir": ".ai",
  "controlsDir": ".",
  "tokenBudget": 1800,
  "maxFileBytes": 262144,
  "include": [],
  "exclude": ["fixtures/**", "generated/**"],
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

| Campo | Uso |
|---|---|
| `contextDir` | muda a raiz do workspace |
| `controlsDir` | muda a base dos artefatos criados por `generate` |
| `tokenBudget` | limita o mapa; mínimo de 256 |
| `maxFileBytes` | ignora arquivos individuais maiores que o limite |
| `include` | restringe a varredura a padrões específicos |
| `exclude` | adiciona padrões ignorados |
| `bridges` | seleciona arquivos-ponte por ferramenta |
| `apm` | adiciona metadados não secretos de observabilidade |

Teste outro orçamento sem alterar o arquivo:

```bash
ai-context economy . --budget 1000
ai-context sync . --budget 1000
```

Um orçamento menor reduz o mapa e pode omitir arquivos menos prioritários. Compare `Coverage` e
`reductionPercent` antes de adotar o valor.

## Customizando memória e recuperação

Use `memory/project-memory.md` para informações que quase toda tarefa precisa: objetivo, usuários,
limites e comandos essenciais. Evite inventários longos; o índice já cuida da descoberta.

Use `retrieval/` para regras como:

- diretórios prioritários por domínio;
- fontes que precisam ser lidas juntas;
- arquivos gerados que devem ser evitados;
- estratégia de chunking para uma integração externa.

Use `context/` para informações carregadas apenas por determinadas equipes ou tarefas. Isso evita
que contexto especializado aumente o prompt de todos os agentes.

## Integrações de agentes

As pontes `AGENTS.md`, `CLAUDE.md`, `.github/copilot-instructions.md` e `GEMINI.md` devem continuar
pequenas. Elas apontam para a mesma memória e não duplicam regras.

Para desabilitar uma ponte:

```json
{
  "bridges": ["agents", "copilot"]
}
```

`init` não remove pontes antigas automaticamente; isso evita apagar conteúdo humano.

## APM

APM é somente contexto operacional:

```json
{
  "apm": {
    "enabled": true,
    "provider": "grafana",
    "serviceName": "checkout-api",
    "environment": "production",
    "dashboardUrl": "https://grafana.example.com/d/checkout"
  }
}
```

Não coloque tokens, API keys, DSNs com credenciais ou cookies nesse arquivo.

## API JavaScript

```js
import {
  generateControl,
  initializeProject,
  inspectProject,
  syncProject,
} from "ai-context-init";

await initializeProject(process.cwd());
await generateControl(process.cwd(), "skill", "release segura");

const inspection = await inspectProject(process.cwd(), {
  tokenBudget: 1200,
});

console.log(inspection.repositoryMap.tokenEconomy);
await syncProject(process.cwd());
```

As funções retornam objetos simples e não dependem da apresentação do CLI.

## Atualizando projetos da versão 0.1

Atualize a biblioteca e execute novamente:

```bash
npm install --global ai-context-init@latest
ai-context init .
ai-context sync .
ai-context doctor .
```

`init` cria somente os novos arquivos ausentes. O conteúdo antigo em `.ai/project.md`,
`.ai/summary.md` e `.ai/controls/` não é removido automaticamente. Depois de revisar e migrar o
conteúdo humano para `memory/`, remova os artefatos legados conforme a política do seu projeto.

## Solução de problemas

### O mapa ficou desatualizado

```bash
ai-context sync .
ai-context doctor .
```

### Muitos arquivos foram omitidos

Aumente `tokenBudget`, reduza caminhos irrelevantes com `exclude` ou registre regras específicas
em `retrieval/`.

### A economia aparece como zero

Projetos muito pequenos podem produzir um mapa maior que a baseline. A biblioteca nunca apresenta
economia negativa.

### Uma edição foi preservada

É o comportamento esperado para arquivos humanos. `generate` e `init` não sobrescrevem conteúdo
existente; escolha outro nome ou edite o arquivo atual.

## Referências

- [Guia da CLI](cli.md)
- [Layout do workspace](layout.md)
- [Economia de tokens](token-economy.md)
- [Linguagens e versões](languages.md)
- [Arquitetura](architecture.md)
