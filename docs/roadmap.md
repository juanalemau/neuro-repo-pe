# Roadmap

## 0.2 — Precisão

- API de plugins para detectores;
- parsers AST opcionais para as linguagens mais usadas;
- leitura completa de `.gitignore`, incluindo negações;
- ranking por grafo de imports e referências;
- tokenizer opcional por família de modelos.

## 0.3 — Monorepos

- contextos hierárquicos por workspace;
- mapas por pacote e mapa executivo global;
- detecção de arquivos alterados via Git;
- perfis de contexto por tarefa (`frontend`, `backend`, `infra`).

## 1.0 — Ecossistema

- contratos de plugin estáveis;
- benchmarks públicos de redução de tokens e recuperação de arquivos relevantes;
- integração com hooks de CI;
- pacotes oficiais para stacks populares;
- documentação em português, inglês e espanhol.

Antes de ampliar o número de integrações, o projeto medirá duas coisas: tokens de contexto
persistente e taxa de acerto dos arquivos recomendados para tarefas reais.
