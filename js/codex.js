/* Mundos Sombrios — Códice de referência. Conteúdo baseado nos livros-base e expansões fornecidos no projeto. */
const CODEX = {
  exodo: {
    title: 'Êxodo: Assimilação',
    intro: 'O eixo mecânico de Êxodo é o Gene, a Carga Êxodo (CÊ), a Assimilação e o risco de Estresse/Ruptura. As expansões acrescentam o Projeto Player, a Linhagem Herdada e o Aprimorador.',
    cards: [
      { title:'Nexo Padrão — Motor do Gene', body:'A CÊ é o recurso de construção e ativação do Gene. O personagem administra o equilíbrio entre manifestação, Assimilação e Estresse Genético.', metrics:[['10–12','CÊ — Iniciado'],['15','CÊ — Adaptado'],['20–25','CÊ — Veterano']], list:['Estigmas definem a base biológica.','Potências são compradas/desbloqueadas e recebem capacidades.','CÊ Residual alimenta evolução futura.'] },
      { title:'Aprimorador — Arquiteto de Linhagem', body:'Humano puro e estéril ao Gene. Não manifesta Prodígios nem usa CÊ. Seu recurso central é Dados de Sequenciamento (DS), voltado à engenharia biológica.', metrics:[['DS','recurso central'],['INT','atributo essencial'],['Medicina','núcleo técnico']], list:['Imune a Assimilação, Estresse Genético e Ruptura Genética.','Atua por Bio-Forja e suporte ao grupo.'] },
      { title:'Projeto Player — Interface Viva', body:'Uma camada meta-tecnológica que transforma o hospedeiro em Interface Viva. A expansão usa Sincronia/Partículas da Existência e CÊ Residual como eixo de progressão.', metrics:[['0–100%','Sincronia'],['PS','Sincronia'],['CÊ','carga residual']], list:['Opera como catalisador de evolução forçada.','A progressão depende da integração entre usuário e sistema.','Burst Mode e níveis superiores entram como recursos próprios do Projeto Player.'] },
      { title:'Linhagem Herdada — Projeto Atavismo', body:'Os Classers descendem das linhagens associadas à Era das Classes. A evolução é comprada com LHL e se apoia em mutações biológicas.', metrics:[['75','LHL inicial'],['EB','Estamina Biológica'],['3','especializações']], list:['Velocitus Bellator — velocidade e reflexos.','Aeternus Vitalis — vitalidade e regeneração.','Mentis Aurorae — expansão neural e percepção.'] },
      { title:'Construção de Poder', body:'O livro-base estrutura o custo do Prodígio em CÊ e usa Adicionais/Limites para tornar a manifestação mais versátil ou mais restrita.', list:['Efeito Primário, Forma de Manifestação e Estigma entram na construção.','Capacidade custa CÊ por nível durante a criação.','Adicionais aumentam custo e CD; Limites reduzem custo e CD conforme a regra aplicada.'] },
      { title:'Evolução por CÊ Residual', body:'A CÊ Residual pode substituir sucessos de evolução e servir como investimento para ampliar o domínio do personagem.', metrics:[['10','Grau 1'],['20','Grau 2'],['40','Grau 3'],['60','Grau 4'],['100','Grau 5']], list:['Sobrevivência com Assimilação ativa concede CÊ Residual.','Recuperar-se de Condição Grave também recompensa CÊ Residual.','Eventos narrativos podem gerar ganhos adicionais.'] }
    ]
  },
  ocultatun: {
    title:'Ocultaton',
    intro:'Ocultaton possui o motor paranormal do livro-base e duas expansões que abrem caminhos radicalmente distintos: O Envolto, baseado em Corrupção Ontológica, e a Ordem dos Sete, baseada em Recordação e Transcendência.',
    cards:[
      { title:'Base Mundana — Vaso', body:'No Envolto, antes da corrupção o personagem escolhe uma Categoria Base. São 12 pontos para os seis atributos, com teto inicial de 4 por atributo.', metrics:[['12','pontos de atributos'],['6','atributos'],['4','teto inicial']], list:['Combatente — PV: (VIG × 10) + 15.','Especialista — PV: (VIG × 10) + 5.','Sobrevivente — PV: (VIG × 10) + 20.','Defesa Passiva: 10 + AGI + armadura.'] },
      { title:'O Envolto — Três Classes', body:'A Corrupção Ontológica substitui o TCP para quem manipula o Espaço Final. Cada classe possui atributos primordiais, reserva de Energia do Envolto e habilidades próprias.', metrics:[['Arauto','PRE/INT'],['Tocado','VIG/PRN'],['Condenado','FOR/INT']], list:['Arauto — reserva: (PRE ou INT × 5) + 15.','Tocado — reserva: (VIG × 5) + 10.','Condenado — reserva: (INT × 5) + 15.'] },
      { title:'Corrupção Ontológica', body:'Toda Potência do Envolto ou uso de Energia do Envolto exige Teste de Ancoragem: d20 + modificador do Atributo Primordial contra a CD da Potência. A falha mantém o efeito, mas acumula CO pela diferença.', metrics:[['1–20','Estágio 1'],['21–40','Estágio 2'],['41–70','Estágio 3'],['71–99','Estágio 4'],['100+','Espaço Final']], list:['A Corrupção é cumulativa.','No Estágio 5 ocorre Onipotência Breve seguida de Anulação Ontológica.','10+ CO em um único teste pode provocar Deformação da Realidade.'] },
      { title:'As 13 Potências do Envolto', body:'As Potências funcionam como blocos modulares para construir manifestações do Espaço Final. Cada árvore possui três Tiers e capacidades de 1 a 10.', metrics:[['1–3','Tier 1 · 2 EE/nível'],['4–6','Tier 2 · 3 EE/nível'],['7–10','Tier 3 · 5 EE/nível']], list:['O Colapso, Quimera, Véu/Fenda, Oblívio, Inércia, Ressonância, Anomalia, Paradoxo, Entropia, Gravidade, Sangue Negro, Emanação e Vértice.'] },
      { title:'Ordem dos Sete — Despertos', body:'O personagem parte de uma categoria mundana do livro-base, escolhe um Discipulado (um dos Sete Arcanjos) e uma Casta Sagrada. A Casta fornece um pacote fechado de 33 PP.', metrics:[['7','Discipulados'],['4','Castas'],['33','PP iniciais']], list:['Inquisidor — Lança da Verdade.','Intérprete — Olhos que Leem os Céus.','Sentinela — Parede entre o Mundo e a Queda.','Juízo — Voz entre os Céus e os Homens.'] },
      { title:'Recordação — Motor da Luz', body:'A Recordação vai de 0% a 100%, substituindo a Decadência para os Despertos. Quanto maior a Recordação, maior a Capacidade Máxima, o número de Transmutações simultâneas e a redução de CD.', metrics:[['0–10%','Cap 1–2'],['21–30%','Cap 4 · 2 simult.'],['51–60%','Cap 7 · 3 simult.'],['81–90%','Cap 10 · 4 simult.'],['100%','Transcendência']], list:['A partir de 90%, Capacidades 1–5 não exigem teste de ativação.','100% culmina em Transcendência e perda permanente do personagem como personagem jogável.'] },
      { title:'As Três Ascensões Sobreviventes', body:'A Ordem atual manifesta três das Sete Ascensões Primordiais: Arkhé, Ex-Nihilo e Poesis Pleroma.', list:['Arkhé — Verdade da Matéria; base INT + Recordação.','Ex-Nihilo — Verdade da Criação; base INT + Recordação.','Poesis Pleroma — Verdade da Alma; base PRE + Recordação.'] },
      { title:'Os Sete Arcanjos', body:'O Discipulado define filosofia, estética e frequência da manifestação divina.', list:['Azarael — Criação, dourado/âmbar.','Raphaël — Cura, prateado/branco perolado.','Dhelaykaim — Evolução, verde esmeralda.','Thagefhanir — Sabedoria, azul/anil.','Auriel — Luz, branco/ouro fogo.','Sarethon — Sacrifício, púrpura/cinza/prata.','Orphanael — Ordem, bronze/aço/azul metálico.'] }
    ]
  }
};

function openCodex(){
  showScreen('screen-codex');
  renderCodex('exodo');
}

function renderCodex(mode){
  const data=CODEX[mode] || CODEX.exodo;
  const root=document.getElementById('codex-content');
  if(!root) return;
  document.querySelectorAll('.codex-mode-tabs .souls-btn').forEach(b=>b.classList.remove('active'));
  const tab=document.getElementById(`codex-tab-${mode}`); if(tab) tab.classList.add('active');
  root.innerHTML=`<div class="codex-intro"><h3>${data.title}</h3><p>${data.intro}</p></div><div class="codex-grid">${data.cards.map(card=>`<article class="codex-card"><h4>${card.title}</h4><p>${card.body}</p>${card.metrics?`<div class="codex-metric">${card.metrics.map(m=>`<div><strong>${m[0]}</strong><span>${m[1]}</span></div>`).join('')}</div>`:''}${card.list?`<ul>${card.list.map(x=>`<li>${x}</li>`).join('')}</ul>`:''}</article>`).join('')}</div><div class="codex-note">O Códice é uma referência de interface. A implementação detalhada de árvores, progressão, bestiário, arsenal e automações de mesa será expandida em módulos próprios, preservando a regra do material-fonte.</div>`;
}
