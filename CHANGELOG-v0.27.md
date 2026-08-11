# Mundos Sombrios — v0.27

## Espaco Final do Envolto — viewport livre com area interna fixa

- A area interna da Skill Tree permanece fixa em **1960 x 1360 px**.
- O viewport externo agora pode ser deslocado livremente por arraste em area vazia.
- O movimento usa `scrollLeft`/`scrollTop`; nao altera a escala, as coordenadas ou a geometria da Skill Tree.
- O arraste das Tabelas de Potencia e Mutacao continua independente do movimento do viewport.
- Zoom foi fixado em 100% para impedir que controles de zoom alterem a area interna.
- O botao de enquadramento agora apenas centraliza o viewport sobre a area fixa.
- Nenhuma mecanica de desbloqueio, progressao ou conexao da Skill Tree foi alterada.


## v0.28 — Skill Tree do Envolto: área interna redimensionada
- Área interna fixa reduzida de 1960×1360 para 800×700 para permitir a visualização integral da árvore em uma janela padrão.
- Geometria dos 13 ramos recalibrada proporcionalmente, sem alterar tiers, progressão ou mecânicas.
- Posições antigas de Tabelas de Potência/Mutação são migradas proporcionalmente uma única vez.
- Pan livre do viewport e arraste individual das Tabelas preservados.
