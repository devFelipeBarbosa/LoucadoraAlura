# restart-server

Pare o servidor de desenvolvimento atual (se estiver rodando) e reinicie a aplicação com `npm run dev`.

## Passos

1. Verifique se existe um terminal com o servidor rodando (ex.: `npm run dev`, `vite`, `next dev`, etc.).
2. Se existir, pare o processo enviando **Ctrl+C** para esse terminal e aguarde ele encerrar.
3. Garanta que o diretório de trabalho do terminal é a raiz do workspace (`e:\Dev\cursor\Alura\LoucadoraAlura`).
4. Inicie novamente o servidor com:

```bash
npm run dev
```

## Validação rápida

- Confirme no output do terminal que o servidor subiu sem erros.
- Se houver porta ocupada, pare o processo anterior corretamente e rode `npm run dev` novamente.

---

Disponível no chat como `/restart-server`.
