# Mundos Sombrios v0.32

## Envolto — Espaco Final / Skill Tree

- Restabelecida a escala normal 1:1 da Skill Tree.
- Canvas interno normalizado para 1600x1180 px, sem compressao ou escala forçada.
- O viewport externo continua sendo a unica camada com movimento livre (pan horizontal e vertical).
- As posições, dimensoes e geometria dos nodos nao sao alteradas pelo pan.
- O arraste individual das Tabelas de Potencia/Mutacao permanece separado do pan do viewport.
- Controles de zoom permanecem desativados para impedir qualquer escala acidental.
- Posicoes salvas da area 1024x768 (v0.30/v0.31) sao migradas uma unica vez para 1600x1180.
- Nenhum novo arquivo de patch foi criado; a arquitetura consolidada continua usando `js/mundos-updates.js` como bundle unico de atualizacoes.
