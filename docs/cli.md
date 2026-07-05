# Guia da CLI

## Instalação e primeira execução

O CLI requer Node.js 20 ou superior, mas pode preparar repositórios escritos nas linguagens
detectadas pela biblioteca.

```bash
npx ai-context-init init /caminho/do/projeto
cd /caminho/do/projeto
npx ai-context-init doctor .
```

`init` cria a configuração, o workspace `.ai/` estruturado, as pontes habilitadas e os artefatos
gerados. Arquivos humanos já existentes são preservados.

## Comandos

### `init [diretório]`

Inicializa um projeto. Use uma vez; executar novamente completa apenas arquivos ausentes.

```bash
ai-context init .
ai-context init ../api --budget 2400 --context-dir .context
```

### `sync [diretório]`

Atualiza `summaries/summary.md`, `summaries/summary.json`, `indexes/repository-map.md` e
`sync/.cache.json`. Não altera memória, skills, prompts, receitas, templates ou scripts.

```bash
ai-context sync .
```

### `inspect [diretório]`

Emite JSON puro com stack, runtimes, estatísticas, orçamento e `tokenEconomy`. É indicado para CI
e scripts:

```bash
ai-context inspect . > inspection.json
```

### `economy [diretório]`

Mostra a comparação entre o código fonte elegível e o mapa compacto:

```bash
ai-context economy .
```

A saída inclui tokens estimados da fonte, tokens do mapa, tokens evitados, redução percentual,
taxa de compressão e reuso do cache de análise. Consulte
[Economia de tokens](token-economy.md) para fórmulas e limites.

### `doctor [diretório]`

Retorna código de saída diferente de zero quando o contexto obrigatório está ausente ou os
artefatos gerados estão desatualizados. Também valida as 18 pastas, as memórias obrigatórias e
os cinco scripts locais de sincronização:

```bash
ai-context doctor .
```

### `generate <tipo> <nome> [diretório]`

Cria um artefato editável na pasta correspondente. Tipos aceitos:
`skill`, `prompt`, `recipe`, `template`, `context`, `example`, `architecture`, `adr`,
`glossary`, `playbook`, `manifest`, `retrieval`, `workflow`, `doc`, `sdd` e `profile`.

```bash
ai-context generate skill "revisão LGPD" .
ai-context generate prompt "revisão de PR" .
ai-context generate workflow "release semanal" .
ai-context generate sdd "novo checkout" .
ai-context generate profile "manutenção legada" .
```

Nomes são normalizados para diretórios seguros. Por exemplo, `Revisão LGPD` cria
`.ai/skills/revisao-lgpd/SKILL.md`. SDDs ficam em `.ai/docs/sdd/` e perfis em
`.ai/context/profiles/`. Se o arquivo já existe, o comando informa que o preservou.

## Opções

| Opção | Aplicação | Padrão |
|---|---|---|
| `--budget <tokens>` | `init`, `sync`, `inspect`, `economy`, `generate` | `1800` |
| `--context-dir <path>` | comandos com configuração | `.ai` |
| `--controls-dir <path>` | `init`, `generate` | `.` |
| `-h`, `--help` | todos | — |
| `-v`, `--version` | todos | — |

Valores passados na linha de comando valem apenas para aquela execução. Para configuração
persistente, edite `ai-context.config.json`.

## APM

O CLI não instala agentes nem envia telemetria. Quando `apm.enabled` é `true`, ele inclui os
metadados de observabilidade nos resumos e no relatório para que agentes de IA relacionem código,
serviço, ambiente e dashboard. Nunca grave API keys, tokens ou DSNs nesse arquivo.

## Automação recomendada

```bash
ai-context sync .
ai-context doctor .
npm test
```

Em CI, esse fluxo confirma que o mapa corresponde ao código antes dos testes do projeto.
