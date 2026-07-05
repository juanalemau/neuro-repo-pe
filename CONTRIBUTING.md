# Contribuindo

Requer Node.js 20 ou superior. O projeto não usa dependências de runtime.

Leia primeiro o [Guia essencial para desenvolvedores](docs/developer-guide.md) para entender o
fluxo, o layout e os contratos públicos da biblioteca.

```bash
npm test
npm run verify
```

Use commits convencionais (`feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `chore:`).

Mudanças em geração devem preservar saída determinística. Mudanças em arquivos humanos devem
manter a regra de nunca sobrescrever conteúdo existente durante `init` ou `sync`.
