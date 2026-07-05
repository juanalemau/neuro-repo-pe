# Layout do workspace `.ai`

`ai-context init .` cria o workspace completo. A separação por responsabilidade permite que
agentes encontrem contexto sem carregar tudo e deixa claro o que pessoas podem editar.

| Caminho | Responsabilidade | Política |
|---|---|---|
| `memory/project-memory.md` | propósito, usuários, comandos e ordem de leitura | humano |
| `memory/coding-style.md` | convenções específicas do projeto | humano |
| `skills/` | capacidades especializadas | humano |
| `prompts/` | prompts reutilizáveis | humano |
| `recipes/` | procedimentos técnicos repetíveis | humano |
| `templates/` | modelos de arquivos e documentos | humano |
| `context/` | perfis de tarefa, equipe e domínio | humano |
| `summaries/` | resumo Markdown e JSON compactos | gerado |
| `examples/` | exemplos preferidos da codebase | humano |
| `architecture/` | limites e visão arquitetural | humano |
| `adr/` | Architecture Decision Records | humano |
| `glossary/` | termos técnicos e de negócio | humano |
| `playbooks/` | operação, incidentes e manutenção | humano |
| `manifests/` | declarações para integrações | humano |
| `indexes/` | mapa ranqueado do repositório | gerado |
| `retrieval/` | políticas de busca, ranking e chunking | humano |
| `workflows/` | fluxos de agentes e equipes | humano |
| `docs/` | documentação complementar e SDDs | humano |
| `sync/` | scripts locais e cache incremental | misto |

## Scripts de sincronização

- `ai-sync.ts`: chama a API pública `syncProject`.
- `ai-summary.ts`: inspeciona stack e estatísticas.
- `ai-index.ts`: imprime o mapa calculado.
- `ai-vectorize.ts`: ponto de extensão desabilitado por padrão; exige fornecedor explícito.
- `ai-export.ts`: exporta o resumo JSON gerado.

Os scripts são scaffolds TypeScript editáveis. A biblioteca não instala um executor TypeScript
nem envia conteúdo para embeddings automaticamente. O projeto pode executá-los com sua ferramenta
já adotada, como `tsx`, `ts-node` ou suporte nativo compatível.

## Garantias de escrita

`init` usa criação condicional para todos os arquivos humanos e scripts: se existirem, são
preservados. `generate` segue a mesma regra. `sync` escreve somente:

```text
.ai/summaries/summary.md
.ai/summaries/summary.json
.ai/indexes/repository-map.md
.ai/sync/.cache.json
```
