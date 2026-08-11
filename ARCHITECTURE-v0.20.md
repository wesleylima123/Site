# Mundos Sombrios — v0.20 Consolidada

A v0.20 é uma consolidação estrutural da v0.19. Não adiciona regras novas ao RPG.

## Fonte única de execução
`js/mundos-updates.js` é o único bundle de atualizações carregado pelo `index.html`.

A ordem de execução da v0.19 foi preservada: dados canônicos do Envolto, módulos históricos v0.12–v0.16, refinamentos v0.17 e proteção/layout v0.18.

## Regras para próximas versões
- Não criar novos `v0.xx-update.js`.
- Alterar o módulo dono do sistema ou o bundle consolidado.
- Cada conteúdo canônico deve possuir uma única fonte de dados e ID estável.
- Verificar se a funcionalidade já existe antes de criar outra.
- Não inventar regra ausente nos livros.
- Toda nova versão deve partir da versão consolidada anterior.

## Limpeza
- removidos os 9 patch loaders individuais;
- removido backup `script.js.bak`;
- removidos artefatos de diagnóstico `dom.txt` e `chromium.log`;
- removida uma cópia byte-a-byte duplicada do Livro-base de Ocultatun;
- mantido o núcleo `script.js` intacto nesta etapa para reduzir risco.


## v0.21 — Envolto
- Cânticos integrados à aba Poderes / Potências.
- A antiga aba independente permanece apenas como compatibilidade oculta, sem conteúdo duplicado.
- Nodos secundários da Skill Tree reduzidos e tematizados por galho.


## Correção estrutural v0.21.1
A árvore do Envolto foi corrigida na função de renderização principal, não por um novo arquivo de atualização. O Registro Operacional do Mercador também recebe saneamento de layout no bundle consolidado.


## v0.22 — Envolto Graphic Novel Ink Theme
A Skill Tree do Envolto usa uma camada visual canônica dentro de `js/mundos-updates.js`: cor chapada, hachuras, contornos pretos espessos, sombras marcadas e conectores orgânicos. Nenhum novo bundle de atualização foi criado.
