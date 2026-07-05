# Arquitetura

## Fluxo

```text
configuração -> scanner -> detectores -> modelo ranqueado -> orçamento -> geradores -> adaptadores
                    |             |
                    |             +-> versões declaradas -> templates de controles
                    +-> metadados APM -> resumos humano e JSON
                         ↕
                    cache por hash
```

- `src/core`: configuração, varredura, cache, modelo e orquestração.
- `src/detectors`: reconhecimento de linguagens/frameworks e extração de símbolos.
- `src/generators`: Markdown/JSON determinísticos e controle do orçamento.
- `src/adapters`: arquivos-ponte mínimos para ferramentas específicas.

`contextDir` é a fronteira do workspace estruturado. O comando `generate` direciona cada tipo de
artefato à pasta correspondente, usando a stack detectada como baseline, mas nunca o reescreve.
Somente `summaries/summary.*`, `indexes/repository-map.md` e `sync/.cache.json` são substituíveis
por `sync`.

O núcleo retorna dados simples e não conhece a CLI. Isso permite incorporar a biblioteca em
templates, IDEs, hooks de CI ou outros CLIs.

## Estratégia de tokens

O mapa usa uma estimativa conservadora e reproduzível de quatro bytes UTF-8 por token. A
estimativa não substitui o tokenizer de um modelo específico; ela existe para impor um limite
estável sem acoplar o núcleo a fornecedores.

O relatório compara os tokens estimados de todos os arquivos textuais elegíveis com os tokens do
mapa compacto. A diferença é apresentada como economia por passagem de contexto completo. Cache
de análise é informado separadamente porque reduz processamento local, não tokens cobrados pela
IA.

Arquivos são priorizados por:

1. manifestos, README e pontos de entrada;
2. arquivos com símbolos públicos;
3. código em diretórios convencionais (`src`, `app`, `lib`, `packages`);
4. menor profundidade;
5. testes, mocks e gerados recebem prioridade menor.

## Segurança e privacidade

A ferramenta é totalmente local, ignora binários, respeita `.gitignore`, limita tamanho de
arquivo e impede que `contextDir` escape da raiz do projeto. Nenhum código é enviado à rede.

APM é tratado apenas como metadado de contexto. A configuração aceita fornecedor, serviço,
ambiente e URL do dashboard; segredos e envio de telemetria ficam a cargo da aplicação e de seu
gerenciador de credenciais.

## Extensão

Novos detectores devem produzir apenas dados do modelo comum. Parsers AST ou Tree-sitter poderão
ser adicionados como plugins opcionais sem tornar o runtime básico pesado.
