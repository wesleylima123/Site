const classDescDict = {
    "Combatente": "Focado em letalidade e resistência linha de frente. Recebe bônus em testes de Força e Vigor ao conjurar o Gene.",
    "Especialista": "Mente tática e analítica. Usa o ambiente e dispositivos criados com o Gene para superar obstáculos impensáveis.",
    "Sobrevivente": "Especialista em evasão, ocultamento e furtividade. Sobrevive às piores caçadas das Entidades.",
    "Engenheiro Biológico": "O cérebro tático. Modifica o gene de aliados através de Bio-Forja e injetores.",
    "IA Virtudes": "Focada em suporte e manipulação de campo de batalha. Otimiza recursos e protege a vida do receptáculo.",
    "IA Domínios": "Focada em combate tático e subjugação de inimigos. Transforma o hospedeiro em uma arma letal impecável.",
    "IA Principados": "Focada em hacking, controle de sistemas e manipulação da própria realidade virtual Kafra.",
    "Velocitus Bellator": "Mutação focada em reflexos beirando o teletransporte e agilidade predatória.",
    "Aeternus Vitalis": "Regeneração atávica absurda. A carne ignora ferimentos mortais e reconstrói ossos em segundos.",
    "Mentis Aurorae": "Expansão neural. Percebe o mundo em câmera lenta, antecipando movimentos e vulnerabilidades.",
    "Mercador da Morte": "Especialista em armamento pesado, explosivos e eliminação de alvos de alto risco.",
    "Carrasco Cinzento": "Inquisidores temidos até pela própria Ordem. Focados em tortura, intimidação e supressão.",
    "Alquerino": "Estudiosos do oculto armados com a ciência da Sala Branca. Usam a anomalia contra ela mesma.",
    "Taumatúrgico": "Canaliza a EP de forma bruta e explosiva. O dano é colossal, mas a corrupção é iminente.",
    "Hermético": "Usa Geometria Esotérica para prender, banir e selar entidades. Focado em controle de área.",
    "Esotérico": "Molda a energia e a carne. Focado em Cirurgia Aberrante e suporte profano.",
    "O Arauto": "O porta-voz do Vazio. Espalha o terror e converte a mente dos inimigos em loucura.",
    "O Tocado": "A carne já não é humana. Absorve golpes mortais e se adapta aos ataques inimigos.",
    "O Condenado": "Sabe que seu fim é iminente e usa a entropia e o azar para arrastar seus inimigos com ele.",
    "Inquisidor (A Lança)": "Focado em caçar hereges. Golpes divinos, força implacável e destruição da matéria negra.",
    "Intérprete (Os Olhos)": "Lê os Códigos da Criação. Revela o oculto, entende línguas mortas e percebe falhas.",
    "Sentinela (A Parede)": "Escudo absoluto. Absorve dano por aliados e é inabalável contra o medo e a corrupção.",
    "Juízo (A Voz)": "Comanda a realidade através do verbo. Suas palavras forçam a verdade sobre a ilusão."
};

const specDescDict = {
    "Somático": "O gene altera os músculos, ossos e pele.",
    "Sensorial": "Amplia os 5 sentidos a níveis super-humanos."
};

const descDict = {
    skills: { "Atletismo": "Baseado em Força.", "Tecnologia": "Baseado em Intelecto." },
    advantages: { "Riqueza": "Permite adquirir equipamentos." },
    talents: { "Destemido": "Imunidade a medo." },
    powers: { "Física": "Força e tração brutas." }
};

const lists = {
    exodo: {
        skills: ["Atletismo", "Tecnologia", "Tratamento", "Luta", "Pontaria", "Intuição", "Persuasão", "Investigação", "Furtividade"],
        advantages: ["Riqueza", "Contatos", "Imunidade Diplomática", "Inventor", "Equipamento Único", "Bem Relacionado", "Atraente", "Identidade Falsa", "Base de Operações", "Autoridade"],
        talents: ["Destemido", "Tolerância à Dor", "Duro de matar", "Resistência Térmica", "Sumir em Vista", "Prodígio", "Sono Leve", "Ambidestria", "Memória eidética", "Equilíbrio Ágil", "Vontade de Ferro", "Sobrevivente"],
        powers: ["Física", "Energética", "Destrutiva", "Protetiva", "Cinesia", "Domínio", "Alteração", "Projeção", "Restauração", "Saturação", "Sistêmica", "Cinética"]
    },
    ocultatun: {
        skills: ["Pontaria", "Luta", "Investigação", "Furtividade", "Ocultismo", "Medicina", "Geometria Esotérica", "Fortitude", "Reflexos", "Vontade", "Intimidação", "Diplomacia", "Mecânica/Artífice", "Linguística", "Navegação Euclidiana", "Sintonia Ontológica", "Criptografia Blasfema", "Cirurgia Aberrante", "Dissimulação Cósmica", "Fé"],
        advantages: ["Fortuna", "Arquivo Confidencial", "Acesso Secreto", "Contatos na Ocultatun", "Santuário", "Biblioteca Proibida", "Veículo de Operações", "Laboratório Pessoal", "Patente de Comando", "Sangue de Nexo", "Rede de Informantes", "Arsenal Privado", "Identidade Civil", "Imunidade Diplomática", "Backup da Sala Branca"],
        talents: ["Duro de Matar", "Sangue Frio", "Gatilho Rápido", "Anatomia de Campo", "Resiliência Biológica", "Mente Blindada", "Sentido de Aranha", "Soco de Impacto", "Recarga Tática", "Pragmático", "Estômago de Aço", "Corredor do Limiar", "Olhar Analítico", "Sacrifício Heroico", "Sobrevivente Urbano"],
        powers: {
            "Agente Designado (Ocultatun)": ["Destrutiva", "Fluxo", "Fissura", "Decadência", "Manipulação", "Propagação", "Pactual", "Quebra"],
            "O Envolto (Horror Cósmico)": ["O Colapso", "A Quimera", "O Véu/Fenda", "Oblívio", "A Inércia", "A Ressonância", "A Anomalia", "O Paradoxo", "A Entropia", "A Gravidade", "O Sangue Negro", "A Emanação", "O Vértice"],
            "A Ordem dos Sete (Alta Glória)": ["Arkhé", "Ex-Nihilo", "Poesis Pleroma"]
        }
    }
};

const ruleset = {
    exodo: {
        natures: {
            "Nexo Padrão (Livro Base)": {
                snippet: "Usuários primários da mutação gênica controlada.",
                desc: "Usuário padrão do Gene Êxodo. Sofre com Assimilação e Estresse Genético. Equilibra seu lado humano com o monstro adormecido em seu DNA.",
                classes: {
                    "Combatente": { attr: {for: 3, vig: 2, agi: 1, int: 0, prn: -1, pre: 0}, skills: ["Atletismo", "Pontaria", "Luta"] },
                    "Especialista": { attr: {for: 0, vig: 1, agi: 2, int: 3, prn: -1, pre: 0}, skills: ["Tecnologia", "Investigação"] },
                    "Sobrevivente": { attr: {for: 1, vig: 3, agi: 2, int: 0, prn: -1, pre: 0}, skills: ["Furtividade", "Tratamento", "Intuição"] }
                },
                resources: ["PV", "Carga Êxodo (CÊ)", "Assimilação", "Estresse Genético"],
                tabName: "O Motor do Gene",
                tabHtml: `
                    <div class="form-group"><label>Estigma Primário:</label><select id="spec-estigma"><option>Somático</option><option>Sensorial</option><option>Metabólico</option><option>Cognitivo</option><option>Entópico</option><option>Singularidade</option></select></div>
                    <div class="form-group"><label>Arquétipo de Destino:</label><select id="spec-arquetipo"><option>Ícone</option><option>Justiceiro</option><option>Inventor</option><option>Mentor</option></select></div>
                    <div class="form-group"><label>Detalhes do Estigma (Rupturas / Mutação):</label><textarea id="spec-mutacoes" rows="2" placeholder="O que acontece com o corpo quando o estigma é ativado..."></textarea></div>
                `
            },
            "Arquiteto de Linhagem (Aprimorador)": {
                snippet: "Humanos puros, manipuladores de DNA.",
                desc: "Humano puro. Imune à assimilação. Usa Dados de Sequenciamento (DS) para Bio-Forja, buffando aliados e aplicando debuffs.",
                classes: { "Engenheiro Biológico": { attr: {for: 0, vig: 1, agi: 1, int: 4, prn: 1, pre: 0}, skills: ["Medicina", "Tecnologia"] } },
                resources: ["PV", "Dados de Seq. (DS)", "Pesquisa (PP %)", "Nível Maestria"],
                tabName: "Engenharia de Linhagem",
                tabHtml: `
                    <div class="form-group" style="text-align:center;">
                        <label style="display:inline-block;">Porcentagem de Pesquisa (PP):</label>
                        <input type="number" id="spec-pp" value="0" min="0" max="200" style="width:100px; display:inline-block; border-color:var(--theme-color); color:var(--theme-color); text-align:center;">
                    </div>
                `
            },
            "Operador de Sistema (Proj. Player)": {
                snippet: "Hackers biológicos ligados à Matrix Kafra.",
                desc: "Interface viva guiada por IAs. Usa Sincronia (PS) e acessa Repositório Kafra para materializar dados no mundo real.",
                classes: {
                    "IA Virtudes": { attr: {for: 2, vig: 2, agi: 2, int: 1, prn: 0, pre: 0}, skills: [] },
                    "IA Domínios": { attr: {for: 3, vig: 2, agi: 2, int: 0, prn: 0, pre: -1}, skills: [] },
                    "IA Principados": { attr: {for: 1, vig: 1, agi: 2, int: 4, prn: 1, pre: -1}, skills: [] }
                },
                resources: ["PV", "Sincronia (PS %)", "CÊ Residual", "Nível Sincronia"],
                tabName: "Interface & Kafra",
                tabHtml: `
                    <div class="form-group" style="border:none; padding:0; background:none;"><label>Sincronia (PS %):</label><input type="number" id="spec-ps" value="0" min="0" max="100" style="width:100% !important; text-align:left; border-color:var(--theme-color); color:var(--theme-color);"></div>
                    <div class="form-group"><label>Repositório Kafra (Itens com Smart-Link / PCs):</label><textarea id="spec-kafra" rows="3" placeholder="Ex: Faca 'Fractal' (IA Domínios) - +2 Luta"></textarea></div>
                `
            },
            "Classer (Linhagem Herdada)": {
                snippet: "O ápice da evolução dos coletores.",
                desc: "O ápice genético dos Coletores. Recebe 75 LHL para comprar atributos. Não usa Prodígios normais, focando inteiramente em Mutações passivas.",
                classes: {
                    "Velocitus Bellator": { attr: {for: 1, vig: 0, agi: 1, int: 0, prn: 0, pre: 0}, pts: 75 },
                    "Aeternus Vitalis": { attr: {for: 0, vig: 2, agi: 0, int: 0, prn: 0, pre: 0}, pts: 75 },
                    "Mentis Aurorae": { attr: {for: 0, vig: 0, agi: 0, int: 1, prn: 1, pre: 0}, pts: 75 }
                },
                resources: ["PV", "Estamina (EB)", "LHL Gasto", "Teto LHL"],
                tabName: "Árvore LHL",
                tabHtml: `
                    <div class="form-group"><label>Vantagens Inatas (Classer):</label><textarea id="spec-inatas" rows="2" style="color:var(--theme-color);">Adaptação Extrema, Recuperação Rápida, Resiliência Instintiva</textarea></div>
                `
            }
        }
    },
    ocultatun: {
        natures: {
            "Agente de Carreira (Ocultatun)": {
                snippet: "Humanos puros, treinados no limite militar.",
                desc: "Humanos que resistem ao horror usando tecnologia e treinamento extremo na Sala Branca. Imunes à corrupção.",
                classes: {
                    "Mercador da Morte": { attr: {for: 3, vig: 3, agi: 2, int: 0, prn: 1, pre: -1}, skills: ["Luta", "Pontaria"] },
                    "Carrasco Cinzento": { attr: {for: 4, vig: 4, agi: 0, int: -1, prn: 0, pre: 1}, skills: ["Luta", "Intimidação"] },
                    "Alquerino": { attr: {for: 0, vig: 1, agi: 1, int: 4, prn: 2, pre: 2}, skills: ["Ocultismo", "Medicina"] }
                },
                resources: ["PV", "Estamina/Ameaça", "Patamar (I a IV)", "Sucessos Acum."],
                tabName: "Treino & Arsenal",
                tabHtml: `
                    <div class="form-group"><label>Patamar de Ameaça (I a IV):</label><input type="number" id="spec-patamar" value="1" min="1" max="4" style="border-color:var(--theme-color); color:var(--theme-color);"></div>
                    <div class="form-group"><label>Arsenal Anômalo e Ritualístico:</label><textarea id="spec-arsenal" rows="4"></textarea></div>
                `
            },
            "Agente Designado (Ocultatun)": {
                snippet: "Abençoados e amaldiçoados pela Energia Paranormal.",
                desc: "Portadores da anomalia. Canalizam a Energia Paranormal (EP) correndo risco de virar Herege através da Saturação e Cicatrizes da Alma.",
                classes: {
                    "Taumatúrgico": { attr: {for: 1, vig: 2, agi: 1, int: 2, prn: 1, pre: 3}, skills: ["Vontade", "Ocultismo"] },
                    "Hermético": { attr: {for: 0, vig: 1, agi: 1, int: 4, prn: 3, pre: 1}, skills: ["Geometria Esotérica", "Ocultismo"] },
                    "Esotérico": { attr: {for: 1, vig: 3, agi: 0, int: 4, prn: 1, pre: 0}, skills: ["Cirurgia Aberrante", "Ocultismo"] }
                },
                resources: ["PV", "Energia Paranormal (EP)", "Decadência", "Saturação (%)"],
                tabName: "Anomalias",
                tabHtml: `
                    <div class="form-group"><label>Saturação Paranormal (0 a 100%):</label><input type="number" id="spec-saturacao" value="0" min="0" max="100" style="border-color:var(--theme-color); color:var(--theme-color);"></div>
                    <div class="form-group"><label>Escriptas / Rituais Herméticos:</label><textarea id="spec-magias" rows="4"></textarea></div>
                `
            },
            "O Envolto (Horror Cósmico)": {
                snippet: "Cultistas que abraçam o vazio e a anti-existência.",
                desc: "Cultistas e caçadores que abraçam a anti-existência. Usam as 13 Árvores do Espaço Final e trocam sua sanidade por poder proibido.",
                classes: {
                    "O Arauto": { attr: {for: 0, vig: 1, agi: 1, int: 3, prn: 1, pre: 4}, skills: [] },
                    "O Tocado": { attr: {for: 2, vig: 4, agi: 1, int: 0, prn: 3, pre: 0}, skills: [] },
                    "O Condenado": { attr: {for: 4, vig: 2, agi: 2, int: 2, prn: 0, pre: 0}, skills: [] }
                },
                resources: ["PV", "Energia do Envolto (EE)", "Corrupção Ont. (CO)", "Estágio CO"],
                tabName: "Espaço Final",
                tabHtml: `
                    <div class="form-group"><label>Pontos de Corrupção Ontológica (CO - Máx 100):</label><input type="number" id="spec-co" value="0" min="0" max="100" style="border-color:var(--theme-color); color:var(--theme-color);"></div>
                    <div class="form-group"><label>Cânticos e Rituais do Envolto:</label><textarea id="spec-canticos" rows="3"></textarea></div>
                `
            },
            "A Ordem dos Sete (Alta Glória)": {
                snippet: "Anjos amnésicos conjurando milagres sobre a matéria.",
                desc: "Anjos caídos amnésicos. Despertam a Recordação e conjuram milagres divinos. Suas Dádivas reescrevem as leis do universo.",
                classes: {
                    "Inquisidor (A Lança)": { attr: {for: 3, vig: 3, agi: 1, int: 0, prn: 1, pre: 0}, skills: ["Intimidação", "Luta", "Atletismo"] },
                    "Intérprete (Os Olhos)": { attr: {for: 0, vig: 1, agi: 0, int: 3, prn: 3, pre: 1}, skills: ["Ocultismo", "Investigação", "Linguística"] },
                    "Sentinela (A Parede)": { attr: {for: 1, vig: 4, agi: 0, int: 0, prn: 1, pre: 3}, skills: ["Fortitude", "Intuição"] },
                    "Juízo (A Voz)": { attr: {for: 0, vig: 1, agi: 1, int: 2, prn: 2, pre: 4}, skills: ["Diplomacia", "Intuição", "Pragmático"] }
                },
                resources: ["PV", "Recordação (%)", "Capacidade Max", "Transm. Sim."],
                tabName: "Luz & Glória",
                tabHtml: `
                    <div class="form-group"><label>Porcentagem de Recordação (0 a 100%):</label><input type="number" id="spec-recordacao" value="0" min="0" max="100" style="border-color:var(--theme-color); color:var(--theme-color);"></div>
                    <div class="form-group"><label>Dádivas Forjadas (Arsenal Divino):</label><textarea id="spec-dadivas" rows="2"></textarea></div>
                `
            }
        }
    }
};

function getNatureCardClass(nature) {
    if(!nature) return '';
    if(nature.includes('Nexo Padrão')) return 'card-nexo';
    if(nature.includes('Arquiteto')) return 'card-aprimorador';
    if(nature.includes('Operador')) return 'card-player';
    if(nature.includes('Classer')) return 'card-classer';
    if(nature.includes('Carreira')) return 'card-carreira';
    if(nature.includes('Designado')) return 'card-designado';
    if(nature.includes('Envolto')) return 'card-envolto';
    if(nature.includes('Ordem')) return 'card-ordem';
    return '';
}

function applyNatureTheme(nature) {
    const layout = document.getElementById('pdf-content');
    layout.className = 'builder-layout';
    if(!nature) return;
    if(nature.includes('Nexo Padrão')) layout.classList.add('theme-nexo');
    else if(nature.includes('Arquiteto')) layout.classList.add('theme-arquiteto');
    else if(nature.includes('Operador')) layout.classList.add('theme-operador');
    else if(nature.includes('Classer')) layout.classList.add('theme-classer');
    else if(nature.includes('Carreira')) layout.classList.add('theme-carreira');
    else if(nature.includes('Designado')) layout.classList.add('theme-designado');
    else if(nature.includes('Envolto')) layout.classList.add('theme-envolto');
    else if(nature.includes('Ordem')) layout.classList.add('theme-ordem');
}

async function downloadPDF() {
    const wasEdit = isEditMode;
    isEditMode = false;
    toggleEditUI();
    const builder = document.getElementById('screen-builder');
    builder.classList.add('pdf-print-mode');
    const name = document.getElementById('char-name').value || 'Alma_Desconhecida';
    const opt = { margin: 10, filename: `${name}_Ficha.pdf`, image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2, useCORS: true, backgroundColor: '#111' }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } };
    await html2pdf().set(opt).from(builder).save();
    builder.classList.remove('pdf-print-mode');
    isEditMode = wasEdit;
    toggleEditUI();
}

function exportCharacterJSON() {
    if (editingIndex === null) return;
    const sourceArray = document.getElementById('screen-vtt').classList.contains('active') ? tablePlayers : characters;
    const char = sourceArray[editingIndex];
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(char, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', dataStr);
    let safeName = (char.name || 'Alma_Desconhecida').replace(/\s+/g, '_');
    downloadAnchorNode.setAttribute('download', safeName + '_Ficha.json');
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

function importCharacterJSON(event) {
    const file = event.target.files[0];
    if (!file) return;

    const LIMIT = currentUser.role === 'jogador' ? 5 : 10;
    if (characters.length >= LIMIT) {
        alert(`O limite de ${LIMIT} almas forjadas foi atingido.`);
        event.target.value = '';
        return;
    }
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedChar = JSON.parse(e.target.result);
            importedChar.id = Date.now();
            importedChar.ownerId = currentUser.id;
            characters.push(importedChar);
            saveGlobalCharacters();
            if(document.getElementById('screen-char-select').classList.contains('active')) {
                renderCharList();
            }
            alert('Alma invocada do Vazio com sucesso!');
        } catch (err) {
            alert('Erro fatal ao ler o Códice JSON.');
        }
        event.target.value = '';
    };
    reader.readAsText(file);
}

function initBuilderForSelectedMode() {
    const LIMIT = currentUser.role === 'jogador' ? 5 : 10;
    if(characters.length >= LIMIT) {
        alert(`O limite de ${LIMIT} almas forjadas foi atingido para sua classe de conta.`);
        return;
    }

    editingIndex = null;
    currentAvatarBase64 = '';
    currentGallery = [];
    currentPowerDraft = [];
    isEditMode = true;

    document.getElementById('char-name').value = '';

    populateSelects(selectedGameMode);
    startBuilder(selectedGameMode);

    toggleEditUI();
}

function populateSelects(mode) {
    const skSelect = document.getElementById('select-skill-name');
    skSelect.innerHTML = '';
    const typeSelect = document.getElementById('select-skill-type');

    typeSelect.onchange = () => {
        skSelect.innerHTML = '';
        const listToUse = typeSelect.value === 'Perícia' ? lists[mode].skills : 
                          typeSelect.value === 'Vantagem' ? lists[mode].advantages : lists[mode].talents;
        listToUse.forEach(item => skSelect.innerHTML += `<option value="${item}">${item}</option>`);
        updateSkillDesc();
    };
    typeSelect.onchange();

    const pwSelect = document.getElementById('pb-potency-name');
    pwSelect.innerHTML = '';
}

function startBuilder(mode) {
    currentMode = mode;
    document.getElementById('char-mode').value = mode;

    const natureGrid = document.getElementById('nature-grid');
    natureGrid.innerHTML = '';
    document.getElementById('char-nature').value = '';
    document.getElementById('nature-description').style.display = 'none';
    document.getElementById('class-container').style.display = 'none';
    document.getElementById('char-class').value = '';

    Object.keys(ruleset[mode].natures).forEach(n => {
        const natureData = ruleset[mode].natures[n];
        const card = document.createElement('div');
        card.className = 'choice-card';
        card.innerHTML = `<h4>${n}</h4><p>${natureData.snippet}</p>`;
        card.onclick = () => selectNature(n);
        natureGrid.appendChild(card);
    });

    showScreen('screen-builder');
    openTab('tab-identity');
}

function selectNature(natureName) {
    if(!isEditMode && !document.getElementById('screen-builder').classList.contains('overlay')) return;

    currentNature = natureName;
    document.getElementById('char-nature').value = natureName;

    document.querySelectorAll('#nature-grid .choice-card').forEach(c => {
        c.classList.toggle('active', c.querySelector('h4').innerText === natureName);
    });

    const natureData = ruleset[currentMode].natures[natureName];

    const descBox = document.getElementById('nature-description');
    descBox.innerText = natureData.desc;
    descBox.style.display = 'block';

    applyNatureTheme(currentNature);

    const classGrid = document.getElementById('class-grid');
    classGrid.innerHTML = '';
    document.getElementById('char-class').value = '';
    document.getElementById('subclass-description').style.display = 'none';

    Object.keys(natureData.classes).forEach(c => {
        const card = document.createElement('div');
        card.className = 'choice-card';
        card.innerHTML = `<h4>${c}</h4><p>${classDescDict[c] || ''}</p>`;
        card.onclick = () => selectClass(c);
        classGrid.appendChild(card);
    });

    document.getElementById('class-container').style.display = 'block';
    setupResources(natureData.resources);

    const tabsContainer = document.getElementById('dynamic-tabs');
    const existing = document.getElementById('btn-tab-specific');
    if(existing) existing.remove();

    if(natureData.tabName) {
        tabsContainer.innerHTML += `<button id="btn-tab-specific" class="tab-btn special-tab" onclick="openTab('tab-specific')">${natureData.tabName}</button>`;
        document.getElementById('specific-content-container').innerHTML = natureData.tabHtml;
    }

    updatePowerSelects(currentNature);
}

function selectClass(className, skipAutofill = false) {
    if(!isEditMode && !document.getElementById('screen-builder').classList.contains('overlay')) return;

    currentClass = className;
    document.getElementById('char-class').value = className;

    document.querySelectorAll('#class-grid .choice-card').forEach(c => {
        c.classList.toggle('active', c.querySelector('h4').innerText === className);
    });

    const classData = ruleset[currentMode].natures[currentNature].classes[className];
    const classDescBox = document.getElementById('subclass-description');
    if(classDescDict[className]) {
        classDescBox.innerText = classDescDict[className];
        classDescBox.style.display = 'block';
    } else {
        classDescBox.style.display = 'none';
    }

    if (!skipAutofill) {
        document.getElementById('attr-for').value = classData.attr.for || 0;
        document.getElementById('attr-vig').value = classData.attr.vig || 0;
        document.getElementById('attr-agi').value = classData.attr.agi || 0;
        document.getElementById('attr-int').value = classData.attr.int || 0;
        document.getElementById('attr-prn').value = classData.attr.prn || 0;
        document.getElementById('attr-pre').value = classData.attr.pre || 0;
    }

    if(isEditMode) {
        document.querySelectorAll('.attr-input').forEach(i => i.removeAttribute('readonly'));
    }

    if(classData.pts) {
        document.getElementById('points-tracker').style.display = 'block';
        if (!skipAutofill) document.getElementById('pts-count').value = classData.pts;
    } else {
        document.getElementById('points-tracker').style.display = 'block';
        if (!skipAutofill) document.getElementById('pts-count').value = 0;
    }

    if (!skipAutofill) {
        const skillsList = document.getElementById('skills-list');
        skillsList.innerHTML = '';
        if(classData.skills && classData.skills.length > 0) {
            classData.skills.forEach(sk => {
                skillsList.innerHTML += `
                    <div class="list-item locked">
                        <div class="list-item-header">
                            <input type="text" value="${sk} (Nativo da Casca)" readonly>
                        </div>
                    </div>`;
            });
        }
    }
    recalculateStats();
}

function updateSkillDesc() {
    const type = document.getElementById('select-skill-type').value;
    const name = document.getElementById('select-skill-name').value;
    const box = document.getElementById('skill-desc-box');

    let dict = null;
    if(type === 'Perícia') dict = descDict.skills;
    else if(type === 'Vantagem') dict = descDict.advantages;
    else if(type === 'Talento') dict = descDict.talents;

    if(dict && dict[name]) box.innerText = dict[name];
    else box.innerText = 'Descrição indisponível nos registros primários.';
}

function updatePowerSelects(nature) {
    const pwSelect = document.getElementById('pb-potency-name');
    if(!pwSelect) return;
    pwSelect.innerHTML = '';
    let powersToUse = [];

    if(currentMode === 'exodo') {
        powersToUse = lists.exodo.powers;
    } else {
        if(lists.ocultatun.powers[nature]) {
            powersToUse = lists.ocultatun.powers[nature];
        } else {
            powersToUse = ['Habilidades Manuais'];
        }
    }
    powersToUse.forEach(p => pwSelect.innerHTML += `<option value="${p}">${p}</option>`);
    updatePowerDesc();
}

function updatePowerDesc() {
    const name = document.getElementById('pb-potency-name').value;
    const box = document.getElementById('power-desc-box');
    if(descDict.powers[name]) box.innerText = descDict.powers[name];
    else box.innerText = '';
}

function setupResources(resList) {
    const panel = document.getElementById('resource-panel');
    panel.innerHTML = '';
    resList.forEach(res => {
        panel.innerHTML += `
            <div class="res-box">
                <h4>${res}</h4>
                <input type="text" class="res-val-input" data-type="${res}" id="res-val-${res.replace(/[^a-zA-Z]/g, '')}">
            </div>`;
    });
}

function recalculateStats() {
    if(!currentNature) return;

    const vig = parseInt(document.getElementById('attr-vig').value) || 0;
    const int = parseInt(document.getElementById('attr-int').value) || 0;
    const pre = parseInt(document.getElementById('attr-pre').value) || 0;
    const prn = parseInt(document.getElementById('attr-prn').value) || 0;

    const panel = document.getElementById('resource-panel');

    panel.querySelectorAll('.res-val-input').forEach(inp => {
        const type = inp.getAttribute('data-type');
        let val = 0;

        if(type === 'PV') {
            if(currentNature.includes('Carrasco')) val = (vig * 10) + 15;
            else if(currentNature.includes('Ordem')) val = (vig * 10) + 10;
            else if(currentNature.includes('Esotérico')) val = (vig * 10) + 12;
            else val = (vig * 10) + 10;
        }
        else if(type.includes('EP') || type.includes('Energia') || type.includes('EE')) {
            val = (Math.max(int, pre) * 5) + 15;
        }
        else if(type.includes('EB') || type.includes('Estamina')) {
            val = (vig * 3) + 5;
        }
        else if(type.includes('DS')) {
            let baseDS = (int + prn) * 3;
            val = baseDS;
        }
        else if(type.includes('CO') || type.includes('Decadência') || type.includes('Assimilação')) val = 0;
        else if(type.includes('LHL')) val = 75;
        else val = '-';

        inp.placeholder = 'Base: ' + val;
        if(!inp.value && isEditMode) {
            if (val !== 0 && val !== '-') {
                inp.value = val;
            }
        }
    });
}

function openTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
}

function toggleEditMode() {
    isEditMode = !isEditMode;
    toggleEditUI();
}

function toggleEditUI() {
    const form = document.getElementById('char-form');
    form.classList.toggle('view-mode', !isEditMode);
    document.getElementById('btn-toggle-edit').innerText = isEditMode ? 'SALVAR EDIÇÃO' : 'INICIAR EDIÇÃO';

    document.querySelectorAll('#char-form input[type="text"], #char-form input[type="number"], #char-form textarea').forEach(el => {
        if(!isEditMode) el.setAttribute('readonly', true);
        else el.removeAttribute('readonly');
    });

    document.querySelectorAll('.choice-card').forEach(el => {
        el.style.pointerEvents = isEditMode ? 'auto' : 'none';
    });

    document.querySelectorAll('.hide-on-view').forEach(el => el.style.display = isEditMode ? '' : 'none');

    if(!isEditMode) {
        document.getElementById('upload-avatar-group').style.display = 'none';
        document.getElementById('upload-gallery-group').style.display = 'none';
    } else {
        document.getElementById('upload-avatar-group').style.display = '';
        document.getElementById('upload-gallery-group').style.display = '';
    }
}

function closeBuilder() {
    const builder = document.getElementById('screen-builder');
    if(builder.classList.contains('overlay')) {
        builder.classList.remove('active', 'overlay');
    } else {
        showScreen('screen-char-select');
    }
}

function previewAvatar(e) {
    const reader = new FileReader();
    reader.onload = (evt) => { currentAvatarBase64 = evt.target.result; document.getElementById('avatar-preview-container').innerHTML = `<img src="${currentAvatarBase64}">`; };
    reader.readAsDataURL(e.target.files[0]);
}

function addSkillFromSelect() {
    const type = document.getElementById('select-skill-type').value;
    const name = document.getElementById('select-skill-name').value;
    const grau = document.getElementById('select-skill-grau').value;
    if(!name) return;

    const container = document.getElementById('skills-list');
    const div = document.createElement('div');
    div.className = 'list-item';
    let descText = descDict.skills[name] || descDict.advantages[name] || descDict.talents[name] || '';
    div.innerHTML = `
        <div class="list-item-header">
            <input type="text" value="${type}: ${name} (G${grau})" readonly>
            <button type="button" class="hide-on-view" onclick="this.closest('.list-item').remove()">&#10006;</button>
        </div>
        <div class="desc-box" style="margin-top:5px; border-left:none;">${descText}</div>
    `;
    container.appendChild(div);
}

function addPotencyToDraft() {
    const pName = document.getElementById('pb-potency-name').value;
    const pCap = document.getElementById('pb-potency-cap').value;
    if(!pName) return;
    currentPowerDraft.push({ potency: pName, cap: pCap });

    const ul = document.getElementById('pb-draft-list');
    ul.innerHTML = '';
    currentPowerDraft.forEach((p, idx) => {
        ul.innerHTML += `<li>${p.potency} [Cap: ${p.cap}] <button type="button" onclick="currentPowerDraft.splice(${idx},1); this.parentElement.remove();" style="background:none; border:none; color:red; cursor:pointer;">(x)</button></li>`;
    });
}

function commitPower() {
    const name = document.getElementById('pb-name').value;
    const mod = document.getElementById('pb-mod').value;
    const desc = document.getElementById('pb-desc').value;

    if(!name) { alert('Dê um nome ao poder/ritual.'); return; }
    if(currentPowerDraft.length === 0) { alert('Anexe pelo menos uma potência à formula.'); return; }

    const container = document.getElementById('powers-list');
    const div = document.createElement('div');
    div.className = 'list-item';

    let partsHtml = currentPowerDraft.map(p => `<span class="nature-text">${p.potency} (Cap:${p.cap})</span>`).join(' + ');

    div.innerHTML = `
        <div class="list-item-header">
            <input type="text" value="${name}" class="power-name-input" readonly style="flex:1; font-weight:bold; color:var(--theme-color);">
            <input type="text" value="${mod}" class="power-mod-input" placeholder="S/Modificadores" readonly style="flex:1; color:#aaa;">
            <button type="button" class="hide-on-view" onclick="this.closest('.list-item').remove()">&#10006;</button>
        </div>
        <div style="font-size:0.85rem; margin-top:5px; color:#00ffcc;">Fórmula: ${partsHtml}</div>
        <textarea readonly class="power-desc-input">${desc}</textarea>
    `;
    container.appendChild(div);

    document.getElementById('pb-name').value = '';
    document.getElementById('pb-mod').value = '';
    document.getElementById('pb-desc').value = '';
    currentPowerDraft = [];
    document.getElementById('pb-draft-list').innerHTML = '';
}

function saveCharacter(e) {
    e.preventDefault();
    if(!isEditMode) return;

    const builder = document.getElementById('screen-builder');
    if(builder.classList.contains('overlay') && isVttGM) {
        if(editingIndex !== null && tablePlayers[editingIndex]) {
            tablePlayers[editingIndex].name = document.getElementById('char-name').value;
            alert('Ficha do jogador atualizada na Mesa.');
            closeBuilder();
            if(typeof renderVttCards === 'function') renderVttCards();
            return;
        }
    }

    const skills = [];
    document.querySelectorAll('#skills-list .list-item').forEach(item => skills.push(item.innerHTML));
    const powers = [];
    document.querySelectorAll('#powers-list .list-item').forEach(item => powers.push(item.innerHTML));
    const specificData = {};
    const specInputs = document.querySelectorAll('#specific-content-container input, #specific-content-container select, #specific-content-container textarea');
    specInputs.forEach(el => { if(el.id) specificData[el.id] = el.value; });
    const resources = {};
    document.querySelectorAll('#resource-panel .res-val-input').forEach(inp => { resources[inp.getAttribute('data-type')] = inp.value; });

    const char = {
        id: editingIndex !== null ? characters[editingIndex].id : Date.now(),
        ownerId: currentUser.id,
        name: document.getElementById('char-name').value,
        mode: currentMode,
        nature: currentNature,
        className: currentClass,
        avatar: currentAvatarBase64,
        gallery: currentGallery,
        points: document.getElementById('pts-count').value,
        stats: {
            for: document.getElementById('attr-for').value,
            vig: document.getElementById('attr-vig').value,
            agi: document.getElementById('attr-agi').value,
            int: document.getElementById('attr-int').value,
            prn: document.getElementById('attr-prn').value,
            pre: document.getElementById('attr-pre').value
        },
        resources: resources,
        skillsHtml: skills,
        powersHtml: powers,
        specificData: specificData
    };

    if(editingIndex !== null) characters[editingIndex] = char;
    else characters.push(char);

    saveGlobalCharacters();
    closeBuilder();
}

function loadCharacterToBuilder(index, sourceArray = characters, restrictToIdentity = false) {
    editingIndex = index;
    const char = sourceArray[index];
    currentMode = char.mode || 'exodo';
    populateSelects(currentMode);

    startBuilder(char.mode);

    if(char.nature) {
        selectNature(char.nature);
    }
    if(char.className) {
        selectClass(char.className, true);
    }

    document.getElementById('char-name').value = char.name;

    if(char.avatar) {
        currentAvatarBase64 = char.avatar;
        document.getElementById('avatar-preview-container').innerHTML = `<img src="${char.avatar}">`;
    } else {
        document.getElementById('avatar-preview-container').innerHTML = `<span style="color:#666; font-size:0.8rem;">Nenhum retrato</span>`;
    }

    if(char.stats) {
        document.getElementById('attr-for').value = char.stats.for;
        document.getElementById('attr-vig').value = char.stats.vig;
        document.getElementById('attr-agi').value = char.stats.agi;
        document.getElementById('attr-int').value = char.stats.int;
        document.getElementById('attr-prn').value = char.stats.prn;
        document.getElementById('attr-pre').value = char.stats.pre;
    }

    if(char.resources) {
        Object.keys(char.resources).forEach(key => {
            const inp = document.querySelector(`#resource-panel .res-val-input[data-type="${key}"]`);
            if(inp) inp.value = char.resources[key];
        });
    }

    const skillsList = document.getElementById('skills-list');
    skillsList.innerHTML = '';
    if(char.skillsHtml) {
        char.skillsHtml.forEach(skHtml => {
            const div = document.createElement('div');
            div.className = 'list-item';
            if(skHtml.includes('Nativo da')) div.classList.add('locked');
            div.innerHTML = skHtml;
            skillsList.appendChild(div);
        });
    }

    const powersList = document.getElementById('powers-list');
    powersList.innerHTML = '';
    if(char.powersHtml) {
        char.powersHtml.forEach(pwHtml => {
            const div = document.createElement('div');
            div.className = 'list-item';
            div.innerHTML = pwHtml;
            powersList.appendChild(div);
        });
    }

    if(restrictToIdentity) {
        document.getElementById('btn-tab-stats').style.display = 'none';
        document.getElementById('btn-tab-skills').style.display = 'none';
        document.getElementById('btn-tab-powers').style.display = 'none';
        isEditMode = false;
        document.getElementById('btn-toggle-edit').style.display = 'none';
        document.getElementById('upload-avatar-group').style.display = 'none';
        document.getElementById('upload-gallery-group').style.display = 'none';
        document.getElementById('btn-final-save').style.display = 'none';
    } else {
        document.getElementById('btn-tab-stats').style.display = '';
        document.getElementById('btn-tab-skills').style.display = '';
        document.getElementById('btn-tab-powers').style.display = '';

        const inVTT = document.getElementById('screen-vtt').classList.contains('active');
        if(inVTT && isVttGM) {
            isEditMode = true;
            document.getElementById('btn-toggle-edit').style.display = '';
            document.getElementById('btn-final-save').style.display = '';
        } else if (inVTT && !isVttGM) {
            isEditMode = false;
            document.getElementById('btn-toggle-edit').style.display = 'none';
            document.getElementById('btn-final-save').style.display = 'none';
        } else {
            isEditMode = false;
            document.getElementById('btn-toggle-edit').style.display = '';
            document.getElementById('btn-final-save').style.display = '';
        }
    }

    toggleEditUI();
    const builder = document.getElementById('screen-builder');
    builder.style.zIndex = 1500;
    builder.classList.add('active');
    openTab('tab-identity');
}

function renderCharList() {
    const container = document.getElementById('character-list');
    container.innerHTML = '';

    const btnNew = document.getElementById('btn-new-char');
    const LIMIT = currentUser.role === 'jogador' ? 5 : 10;

    if (characters.length >= LIMIT) {
        btnNew.disabled = true;
        btnNew.innerText = `SANTUÁRIO LOTADO (${LIMIT}/${LIMIT})`;
    } else {
        btnNew.disabled = false;
        btnNew.innerText = 'DESPERTAR NOVA ALMA';
    }

    if (characters.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#555; width:100%;">O Santuário está vazio. O abismo aguarda.</p>';
        document.getElementById('carousel-prev').style.display = 'none';
        document.getElementById('carousel-next').style.display = 'none';
        return;
    }

    characters.forEach((char, index) => {
        const animClass = getNatureCardClass(char.nature);
        const wrapper = document.createElement('div');
        wrapper.className = 'card-wrapper';
        wrapper.innerHTML = `
            <div class="soul-card ${animClass}">
                <div class="ornament"></div>
                ${char.avatar ? `<img src="${char.avatar}" class="card-bg-img">` : ''}
                <div class="soul-card-icon" style="${char.avatar ? 'background-image:url('+char.avatar+')' : ''}"></div>
                <h3>${char.name}</h3>
                <p>${char.className || 'Desconhecido'}</p>
                <div class="selection-glow">EDITAR</div>
            </div>`;
        wrapper.onclick = () => handleCardClick(index, wrapper);
        container.appendChild(wrapper);
    });

    if(activeCarouselIndex >= characters.length) activeCarouselIndex = characters.length - 1;
    updateCarousel();
}

function handleCardClick(index, wrapperEl) {
    if (index === activeCarouselIndex) {
        const cardEl = wrapperEl.querySelector('.soul-card');
        cardEl.classList.add('spin-out');
        setTimeout(() => {
            cardEl.classList.remove('spin-out');
            loadCharacterToBuilder(index, characters, false);
        }, 800);
    } else {
        activeCarouselIndex = index;
        updateCarousel();
    }
}

function nextCard() {
    if (activeCarouselIndex < characters.length - 1) {
        activeCarouselIndex++;
        updateCarousel();
    }
}

function prevCard() {
    if (activeCarouselIndex > 0) {
        activeCarouselIndex--;
        updateCarousel();
    }
}

function updateCarousel() {
    const wrappers = document.querySelectorAll('#character-list .card-wrapper');
    const prevBtn = document.getElementById('carousel-prev');
    const nextBtn = document.getElementById('carousel-next');

    if(wrappers.length === 0) return;

    if(prevBtn) prevBtn.style.display = activeCarouselIndex > 0 ? 'block' : 'none';
    if(nextBtn) nextBtn.style.display = activeCarouselIndex < wrappers.length - 1 ? 'block' : 'none';

    wrappers.forEach((wrapper, index) => {
        wrapper.classList.remove('active', 'prev', 'next');
        let offset = 0;
        let scale = 1;
        let rotateY = 0;
        let zIndex = 1;
        let opacity = 1;

        let distance = Math.abs(index - activeCarouselIndex);
        let sign = Math.sign(index - activeCarouselIndex);

        if (distance === 0) {
            wrapper.classList.add('active');
            offset = 0; scale = 1.1; opacity = 1; zIndex = 10; rotateY = 0;
            wrapper.style.display = 'block';
        } else {
            offset = sign * (250 + (distance - 1) * 200);
            scale = 0.8; opacity = 0.4; zIndex = 5 - distance; rotateY = sign * -25;
            if(distance > 2) { wrapper.style.display = 'none'; }
            else { wrapper.style.display = 'block'; }
        }

        wrapper.style.transform = `translateX(${offset}px) scale(${scale}) rotateY(${rotateY}deg)`;
        wrapper.style.zIndex = zIndex;
        wrapper.style.opacity = opacity;
    });
}
