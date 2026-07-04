# Posicionamento no ecossistema

Pesquisa revisada em julho de 2026.

Há boas ferramentas adjacentes:

- [Repomix](https://repomix.com/) empacota repositórios para consumo por modelos e oferece filtros
  para reduzir tokens.
- [Aider](https://aider.chat/docs/repomap.html) cria um repo map dinâmico, priorizado por grafo e
  ajustado ao orçamento da conversa.
- [Claude Code](https://code.claude.com/docs/en/memory) usa `CLAUDE.md` e memória automática.
- [GitHub Copilot](https://docs.github.com/en/copilot/concepts/prompting/response-customization)
  aceita instruções globais, específicas por caminho e arquivos de agentes.
- Projetos recentes como [AICS](https://aics.atomic-lab.org/) também propõem mapas compactos de
  assinaturas.

`ai-context-init` ocupa uma faixa específica:

1. não é um cliente de chat nem chama um LLM;
2. prepara uma fonte de contexto persistente para vários agentes;
3. separa documentação humana de inventário gerado;
4. produz saída determinística, verificável em CI;
5. mantém orçamento explícito e cache incremental;
6. oferece núcleo de biblioteca incorporável, não apenas um comando fechado.

O diferencial deve ser validado por benchmark, não por slogan. O roadmap prevê medir redução de
tokens e recuperação dos arquivos corretos em tarefas reais, comparando a leitura direta do
repositório, mapas estáticos e ranking por grafo.
