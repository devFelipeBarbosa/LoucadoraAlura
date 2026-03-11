# git-commit-push-auto

Adicione **todos** os arquivos ao stage, gere uma mensagem de commit automaticamente (com base nos arquivos modificados) **ou** use uma mensagem informada, faça o commit e depois o push.

## Passos

1. Garanta que você está na raiz do projeto (`e:\Dev\cursor\Alura\LoucadoraAlura`) e no branch correto.
2. Verifique rapidamente o que mudou:

```bash
git status -sb
```

3. Adicione tudo ao stage:

```bash
git add -A
```

4. Gere uma mensagem automática **ou** use uma mensagem informada.

### Opção A) Mensagem automática (baseada nos arquivos staged)

#### PowerShell

```powershell
$files = git diff --cached --name-only
if (-not $files) { throw "Nada staged para commit." }
$msg = "chore: update " + (($files | Select-Object -First 8) -join ", ") + ($(if ($files.Count -gt 8) { " (+$($files.Count-8) more)" } else { "" }))
git commit -m $msg
```

#### Bash

```bash
files="$(git diff --cached --name-only)"
[ -z "$files" ] && echo "Nada staged para commit." && exit 1
msg="chore: update $(echo "$files" | head -n 8 | paste -sd ", " -)$( [ "$(echo "$files" | wc -l | tr -d ' ')" -gt 8 ] && echo " (+$(( $(echo "$files" | wc -l) - 8 )) more)" )"
git commit -m "$msg"
```

### Opção B) Mensagem informada (recomendada para mudanças importantes)

```bash
git commit -m "sua mensagem aqui"
```

5. Faça o push:

```bash
git push
```

## Validação rápida

- Confirme que não sobrou nada pendente:

```bash
git status -sb
```

---

Disponível no chat como `/git-commit-push-auto`.
