# Mundos Sombrios — v0.13

## Correções e refinamentos

- Corrigido o carregamento duplicado de `codex.js` e `codex-library.js`.
- Mantido o acesso cruzado entre fichas de Êxodo/ Ocultaton; o modo da ficha aberta passa a acompanhar a ficha selecionada.
- Mantida a renderização de todas as fichas da conta no Santuário, sem ocultação por modo.
- Removido o controle individual de “Valor” de ingredientes introduzido no v0.12.
- Criado um único controle global de estoque do Alquerino com operações Definir / Somar / Subtrair para todos os ingredientes, mantendo intactos os campos individuais de quantidade.
- Mantida a edição livre da galeria e os cortes por proporção.
- Símbolos dos cards aumentados e com animações temáticas específicas por classe/expansão.

## Mercador da Morte

- As quatro manobras explicitamente listadas no Livro-base de Ocultaton foram integradas ao catálogo:
  Deslocamento Tático, Golpe Brutal, Contra-Ataque Reflexo e Fôlego de Sobrevivência.
- Registro persistente das manobras selecionadas.
- Catálogo de Forças-Tarefa do site com descrição, perfil operacional e insígnia militar SVG exclusiva.
- As unidades de Força-Tarefa existentes no catálogo de equipamentos do site foram preservadas como conteúdo operacional do site; o Livro-base apenas estabelece que os Mercadores operam em Forças-Tarefa e não nomeia um catálogo de unidades.

## Auditoria estática

- Todos os JavaScripts passaram em `node --check`.
- HTML sem IDs duplicados detectados.
- HTML sem `src` de script duplicado detectado.

# Mundos Sombrios — v0.16

## Mercador da Morte
- Arsenal de Assinatura integrado à mesma arquitetura de construção da Forja de Dispositivos/Equipamentos.
- Maleta operacional suporta múltiplos dispositivos, armas, equipamentos e itens, cada um com miniatura própria.
- Seleção individual das manobras concedidas por cada Força-Tarefa.
- Múltiplas Forças-Tarefa podem coexistir na ficha; seus emblemas são mostrados no card.

## Esotérico
- Sala de Cirurgia Paranormal ampliada com as fórmulas técnicas da classe: PV inicial, EP inicial, Slots, custo de ativação e natureza orgânica dos Enxertos.
- Criação de Enxerto em fluxo modular semelhante à criação de poderes.
- Autocirurgia: 1 vez por sessão, 1 hora; alteração de Enxertos ativos ou cura de 2d8 PV.
- Teste operacional de Aceitação/Rejeição: Vigor + Medicina contra CD 15; falha registra +1 Estresse até o fim da missão.
- Covis Rápido, Prático e Perpétuo com GC, CD, integridade e defesas.
- Especializações e Decadência do Esotérico registradas na própria sala.
- A regra de PT para reduzir risco de rejeição fica registrada sem inventar uma conversão que o livro-base não fornece.

## Envolto
- Grimório próprio com os 30 Rituais do Cântico dos Esquecidos.
- Cada ritual possui sigilo SVG único.
- Campos de origem, Potências, conjuração, custo EE/CO, sacrifício, cântico, testes, efeito e complicação.
- Transcrição integral da fonte disponível em cada entrada.
- Mecânica global do Cântico implementada: conjuração lenta/indefesa, custo misto, Teste de Blasfêmia, falha e 20 natural.

## Hermético
- Criador de novos rituais integrado ao Códice.
- Custo padrão automático Capacidade × 2 EP.
- Registro de aprendizado por Sucessos Acumulados / decifração de Códice, com referência aos 15 sucessos usuais.
- Campo separado para âncora/material, gesto, verbo, salvaguarda e efeito.
- Rituais personalizados ganham sigilo próprio e persistem na ficha.

## Auditoria
- Scripts v0.16 passaram em `node --check`.
- HTML sem IDs duplicados.
- Scripts v0.16 carregados após os módulos v0.15.


# v0.21.1 — Correções consolidadas

- Corrigida a causa do design anterior da Skill Tree do Envolto não ser aplicado: `renderTree()` usa a ligação lexical da função `renderEnvoltoTree()` em `script.js`, portanto os wrappers de `window.renderEnvoltoTree` adicionados pelo bundle não interceptavam essa chamada.
- `renderEnvoltoTree()` foi corrigida diretamente na implementação principal, sem criar outro arquivo de patch.
- Skill Tree do Envolto agora usa nós principais temáticos, três nodos secundários progressivamente menores, formas próprias por galho, primeiro/segundo/terceiro nodo em orientações opostas/centrais e símbolo de conclusão antes da ligação ao núcleo.
- Anel ornamental não é mais usado como conexão.
- Corrigida sobreposição da aba Treino & Arsenal do Mercador da Morte: os campos legados de Patamar/Arsenal são ocultados quando o Registro Operacional está ativo, e os módulos do mercado ficam em grid estável.


# v0.22 — Refinamento visual do Envolto
- Skill Tree redesenhada em linguagem 2D de graphic novel de terror: nanquim, hachura, cores chapadas, preto absoluto, ácido/amarelo, roxo/magenta e vermelho-sangue.
- Conectores substituídos por riscos orgânicos irregulares com eco de tinta.
- Nodos por galho recebem formas e cores distintas; nodos secundários foram reduzidos.

## v0.23 — Reestruturação visual da Skill Tree do Envolto
- Fundo de códice/Necronomicon com textura 2D e camada de infecção orgânica contínua.
- Caminhos Lovecraftianos com paletas exclusivas por ramificação.
- Nodos maiores, ícones reforçados, pulsação e tentáculos sutis nos nodos ativos.
- Conectores desenhados como tecido/tendões orgânicos, com linha de tinta preta + veia colorida.
- Painel 2D lateral para título, efeito, custo e progresso.
- Tipografia editorial serifada para manter o aspecto de página de graphic novel/códice.
