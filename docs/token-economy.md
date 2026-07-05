# Economia de tokens

A economia de tokens é uma saída de primeira classe da biblioteca. Ela responde quanto contexto
bruto seria necessário para representar os arquivos escaneados e quanto o mapa compacto usa para
orientar uma IA até os arquivos relevantes.

## Métricas

Para manter resultados locais, rápidos e reproduzíveis, a estimativa padrão é:

```text
tokens estimados = teto(bytes UTF-8 / 4)
tokens evitados = máximo(0, tokens da fonte - tokens do mapa)
redução (%) = tokens evitados / tokens da fonte × 100
compressão = tokens da fonte / tokens do mapa
uso do orçamento (%) = tokens do mapa / orçamento configurado × 100
reuso da análise (%) = cache hits / arquivos escaneados × 100
```

O objeto `tokenEconomy` aparece em `.ai/summaries/summary.json`:

| Campo | Significado |
|---|---|
| `estimatedSourceTokens` | estimativa dos arquivos textuais elegíveis completos |
| `compactMapTokens` | estimativa real do mapa gerado |
| `estimatedTokensSaved` | diferença evitada por uma passagem de contexto completo |
| `reductionPercent` | redução percentual estimada |
| `compressionRatio` | relação fonte/mapa |
| `budgetTokens` | limite configurado |
| `budgetUtilizationPercent` | parcela usada do orçamento |
| `indexedFiles` / `omittedFiles` | cobertura do mapa |
| `analysisCacheHits` | análises de símbolos reutilizadas localmente |
| `analysisCacheHitPercent` | taxa de reuso da análise |

## Onde visualizar

```bash
ai-context sync .
ai-context economy .
ai-context inspect .
```

`sync` mostra o relatório junto aos arquivos afetados. `economy` oferece uma visualização humana
direta. `inspect` retorna JSON para dashboards, CI e comparações históricas. O resumo Markdown
também guarda as métricas para agentes.

## Interpretação honesta

- A baseline inclui apenas arquivos textuais aceitos pelo scanner após exclusões, `.gitignore` e
  limite de tamanho.
- “Tokens evitados” representa a diferença em relação a enviar toda essa baseline numa passagem;
  não é uma garantia de cobrança de qualquer fornecedor.
- Tokenizers reais variam por modelo e linguagem. A regra de quatro bytes existe para comparação
  determinística entre execuções.
- O mapa é o contexto compacto medido. Memória humana e arquivos fonte abertos posteriormente são
  contexto adicional, escolhido sob demanda.
- Cache hits melhoram o desempenho local do `sync`, mas não são contabilizados como economia de
  tokens da IA.

Essas distinções permitem acompanhar redução real de contexto sem misturar estimativas de tokens,
tempo de análise e custo financeiro.
