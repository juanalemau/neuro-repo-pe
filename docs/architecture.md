# Arquitetura

## Fluxo

```text
configuração -> scanner -> detectores -> modelo ranqueado -> orçamento -> geradores -> adaptadores
                         ↕
                    cache por hash
```

- `src/core`: configuração, varredura, cache, modelo e orquestração.
- `src/detectors`: reconhecimento de linguagens/frameworks e extração de símbolos.
- `src/generators`: Markdown/JSON determinísticos e controle do orçamento.
- `src/adapters`: arquivos-ponte mínimos para ferramentas específicas.

O núcleo retorna dados simples e não conhece a CLI. Isso permite incorporar a biblioteca em
templates, IDEs, hooks de CI ou outros CLIs.

## Estratégia de tokens

O mapa usa uma estimativa conservadora e reproduzível de quatro bytes UTF-8 por token. A
estimativa não substitui o tokenizer de um modelo específico; ela existe para impor um limite
estável sem acoplar o núcleo a fornecedores.

Arquivos são priorizados por:

1. manifestos, README e pontos de entrada;
2. arquivos com símbolos públicos;
3. código em diretórios convencionais (`src`, `app`, `lib`, `packages`);
4. menor profundidade;
5. testes, mocks e gerados recebem prioridade menor.

## Segurança e privacidade

A ferramenta é totalmente local, ignora binários, respeita `.gitignore`, limita tamanho de
arquivo e impede que `contextDir` escape da raiz do projeto. Nenhum código é enviado à rede.

## Extensão

Novos detectores devem produzir apenas dados do modelo comum. Parsers AST ou Tree-sitter poderão
ser adicionados como plugins opcionais sem tornar o runtime básico pesado.
