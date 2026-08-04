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
    if(nature.includes("Nexo Padrão")) layout.classList.add('theme-exodo-padrao');
    else if(nature.includes("Arquiteto")) layout.classList.add('theme-arquiteto');
    else if(nature.includes("Operador")) layout.classList.add('theme-operador');
    else if(nature.includes("Classer") || nature.includes("Herdada")) layout.classList.add('theme-exodo-classer');
    else if(nature.includes("Carreira")) layout.classList.add('theme-ocultatun-carreira');
    else if(nature.includes("Designado")) layout.classList.add('theme-ocultatun-designado');
    else if(nature.includes("Envolto")) layout.classList.add('theme-ocultatun-envolto');
    else if(nature.includes("Ordem")) layout.classList.add('theme-ocultatun-ordem');
}

// Sobrescrever toggleEditUI para não travar os cards se estiver em edição
function toggleEditUI() {
    const form = document.getElementById('char-form');
    form.classList.toggle('view-mode', !isEditMode);
    document.getElementById('btn-toggle-edit').innerText = isEditMode ? "SALVAR EDIÇÃO" : "INICIAR EDIÇÃO";
    
    document.querySelectorAll('#char-form input[type="text"], #char-form input[type="number"], #char-form textarea').forEach(el => {
        if(!isEditMode) el.setAttribute('readonly', true);
        else el.removeAttribute('readonly');
    });

    document.querySelectorAll('.choice-card').forEach(el => {
        // Permite clicar nos cards se estiver em modo de edição
        el.style.pointerEvents = isEditMode ? 'auto' : 'none';
        if(isEditMode) el.classList.remove('locked');
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
        alert(`O limite de ${LIMIT} almas forjadas foi atingido.`);
        return;
    }

    editingIndex = null;
    currentAvatarBase64 = '';
    currentGallery = [];
    currentPowerDraft = [];
    isEditMode = true;

    // LIMPEZA TOTAL DA FICHA PARA NÃO APARECEREM DADOS ANTIGOS
    document.getElementById('char-form').reset();
    document.getElementById('char-name').value = '';
    document.querySelectorAll('.attr-input').forEach(el => el.value = '0');
    document.getElementById('pts-count').value = '0';
    document.querySelectorAll('.res-val-input').forEach(el => el.value = '');
    
    document.getElementById('avatar-preview-container').innerHTML = '<span style="color:#666; font-size:0.8rem;">Nenhum retrato</span>';
    document.getElementById('gallery-container').innerHTML = '';
    document.getElementById('skills-list').innerHTML = '';
    document.getElementById('powers-list').innerHTML = '';
    document.getElementById('specific-content-container').innerHTML = '';
    
    currentUnlockedNodes = [];
    if(document.getElementById('tree-unlocked-data')) {
        document.getElementById('tree-unlocked-data').value = '';
    }

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
        
        // Verifica se usa a árvore nova ou o HTML padrão
        if(natureName === 'O Envolto (Horror Cósmico)' || natureName === 'Classer (Linhagem Herdada)') {
             buildSkillTreeUI(natureName);
        } else {
             document.getElementById('specific-content-container').innerHTML = natureData.tabHtml;
        }
    }
    
    updatePowerSelects(currentNature);
    recalculateStats();
}



let cropperInstance = null;
let cropTarget = null; 

function openCropModal(imageSrc, target) {
    cropTarget = target;
    document.getElementById('crop-image').src = imageSrc;
    document.getElementById('crop-modal').style.display = 'flex';
    
    if(cropperInstance) cropperInstance.destroy();
    
    cropperInstance = new Cropper(document.getElementById('crop-image'), {
        aspectRatio: target === 'avatar' ? 1 : NaN,
        viewMode: 1,
        autoCropArea: 1
    });
}

function confirmCrop() {
    if(!cropperInstance) return;
    const canvas = cropperInstance.getCroppedCanvas({ width: 800, height: 800 });
    const base64 = canvas.toDataURL('image/jpeg', 0.8);
    
    if(cropTarget === 'avatar') {
        currentAvatarBase64 = base64;
        document.getElementById('avatar-preview-container').innerHTML = `<img src="${base64}">`;
    } else if(cropTarget === 'gallery') {
        currentGallery.push(base64);
        renderGallery();
    }
    cancelCrop();
}

function cancelCrop() {
    document.getElementById('crop-modal').style.display = 'none';
    if(cropperInstance) cropperInstance.destroy();
    cropperInstance = null;
}

function renderGallery() {
    const container = document.getElementById('gallery-container');
    container.innerHTML = '';
    currentGallery.forEach((img, idx) => {
        container.innerHTML += `
            <div class="gallery-thumb">
                <img src="${img}" onclick="viewFullscreen('${img}')">
                ${isEditMode ? `<button type="button" class="delete-btn" onclick="removeGalleryImage(${idx}, event)">X</button>` : ''}
            </div>
        `;
    });
}

function removeGalleryImage(idx, e) {
    e.stopPropagation();
    currentGallery.splice(idx, 1);
    renderGallery();
}

function previewAvatar(e) {
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => openCropModal(evt.target.result, 'avatar');
    reader.readAsDataURL(file);
    e.target.value = '';
}

function addGalleryImages(e) {
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => openCropModal(evt.target.result, 'gallery');
    reader.readAsDataURL(file);
    e.target.value = '';
}

let fsZoom = 1;
function viewFullscreen(src) {
    const modal = document.getElementById('fs-modal');
    const img = document.getElementById('fs-img');
    img.src = src;
    fsZoom = 1;
    img.style.transform = `scale(${fsZoom})`;
    modal.style.display = 'flex';
}

document.addEventListener('DOMContentLoaded', () => {
    const fsModal = document.getElementById('fs-modal');
    if(fsModal) {
        fsModal.addEventListener('wheel', (e) => {
            e.preventDefault();
            fsZoom += e.deltaY * -0.002;
            fsZoom = Math.min(Math.max(0.5, fsZoom), 5);
            document.getElementById('fs-img').style.transform = `scale(${fsZoom})`;
        });
    }
});

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
        currentAvatarBase64 = '';
        document.getElementById('avatar-preview-container').innerHTML = `<span style="color:#666; font-size:0.8rem;">Nenhum retrato</span>`;
    }

    if(char.gallery) {
        currentGallery = [...char.gallery];
    } else {
        currentGallery = [];
    }
    renderGallery();

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
        
        // Define icone em 3D sutil baseado na classe/natureza
        let iconColorClass = "icon-exodo";
        if(char.mode === 'ocultatun') iconColorClass = "icon-ocultatun";
        if(char.nature && char.nature.includes('Envolto')) iconColorClass = "icon-envolto";
        if(char.nature && char.nature.includes('Classer')) iconColorClass = "icon-classer";
        if(char.nature && char.nature.includes('Ordem')) iconColorClass = "icon-ordem";

        const wrapper = document.createElement('div');
        wrapper.className = 'card-wrapper';
        wrapper.innerHTML = `
            <div class="card-3d-icon-wrapper ${iconColorClass}">
                <div class="cube-icon">
                    <div class="cube-face front"></div><div class="cube-face back"></div>
                    <div class="cube-face left"></div><div class="cube-face right"></div>
                    <div class="cube-face top"></div><div class="cube-face bottom"></div>
                </div>
            </div>
            <button class="delete-soul" onclick="deleteCharacter(${index}, event)" title="Excluir Ficha">X</button>
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

function deleteCharacter(index, e) {
    e.stopPropagation();
    if(confirm("Deseja expurgar esta alma para sempre do Vazio? A ficha será deletada e as informações apagadas.")) {
        characters.splice(index, 1);
        saveGlobalCharacters();
        renderCharList();
        document.getElementById('sanctuary-limits').innerText = `Almas Vivas: ${characters.length} / ${currentUser.role === 'jogador' ? 5 : 10}`;
    }
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


document.addEventListener('DOMContentLoaded', () => {
    const attrs = ['for', 'vig', 'agi', 'int', 'prn', 'pre'];
    attrs.forEach(a => {
        const el = document.getElementById('attr-' + a);
        if(el) {
            el.addEventListener('input', recalculateStats);
        }
    });
});



const treeData = {
    'O Envolto (Horror Cósmico)': [
        { id: 'e1', name: 'A Quimera', x: 50, y: 10, parent: null, desc: 'Abre sua percepção para a anti-existência. Visão no escuro anômala.' },
        { id: 'e2', name: 'O Véu/Fenda', x: 30, y: 25, parent: 'e1', desc: 'Permite interagir com objetos etéreos e atravessar frestas.' },
        { id: 'e3', name: 'O Paradoxo', x: 70, y: 25, parent: 'e1', desc: 'Confunde o tempo local. +2 em Iniciativa e Reflexos.' },
        { id: 'e4', name: 'O Colapso', x: 15, y: 45, parent: 'e2', desc: 'Ataques causam necrose instantânea (+1d6 Dano Entrópico).' },
        { id: 'e5', name: 'A Ressonância', x: 40, y: 45, parent: 'e2', desc: 'Vozes ancestrais aterrorizam inimigos próximos.' },
        { id: 'e6', name: 'A Anomalia', x: 60, y: 45, parent: 'e3', desc: 'Seu corpo ignora o primeiro ataque físico recebido por cena.' },
        { id: 'e7', name: 'A Inércia', x: 85, y: 45, parent: 'e3', desc: 'Reduz o deslocamento de inimigos em 3m num raio de 9m.' },
        { id: 'e8', name: 'O Sangue Negro', x: 10, y: 65, parent: 'e4', desc: 'Sangue corrosivo. Atacantes sofrem 1d4 de dano corpo-a-corpo.' },
        { id: 'e9', name: 'Oblívio', x: 35, y: 65, parent: 'e5', desc: 'Apaga temporariamente memórias de um alvo.' },
        { id: 'e10', name: 'A Emanação', x: 65, y: 65, parent: 'e6', desc: 'Pode projetar sua consciência intangível até 18m.' },
        { id: 'e11', name: 'A Entropia', x: 90, y: 65, parent: 'e7', desc: 'Estruturas e materiais mundanos apodrecem ao seu toque.' },
        { id: 'e12', name: 'A Gravidade', x: 50, y: 80, parent: 'e5', desc: 'Controle de massa. Pode flutuar e andar nas paredes.' },
        { id: 'e13', name: 'O Vértice', x: 50, y: 95, parent: 'e12', desc: 'Ponto focal da anti-existência. Pode conjurar um buraco negro anômalo.' }
    ],
    'Classer (Linhagem Herdada)': [
        { id: 'c1', name: 'Adaptação Extrema', x: 50, y: 10, parent: null, desc: 'Seu DNA é reescrito. Imune a doenças e venenos comuns.' },
        { id: 'c2', name: 'Aeternus Vitalis', x: 25, y: 25, parent: 'c1', desc: 'Regeneração celular brutal. Recupera 2 PV por rodada ativo.' },
        { id: 'c3', name: 'Velocitus Bellator', x: 75, y: 25, parent: 'c1', desc: 'Reflexos predatórios. Ganha +3 metros de Deslocamento Base.' },
        { id: 'c4', name: 'Resiliência Instintiva', x: 15, y: 45, parent: 'c2', desc: 'Seus ossos densificam. +2 Defesa Passiva Natural.' },
        { id: 'c5', name: 'Sangue Fervente', x: 40, y: 45, parent: 'c2', desc: 'Cura PV com base em dano sofrido no mesmo turno.' },
        { id: 'c6', name: 'Mentis Aurorae', x: 60, y: 45, parent: 'c3', desc: 'Expansão neural. Percebe o mundo em câmera lenta (+5 Prontidão).' },
        { id: 'c7', name: 'Predador Perfeito', x: 85, y: 45, parent: 'c3', desc: 'Ataques corpo-a-corpo recebem Margem de Crítico +1.' },
        { id: 'c8', name: 'Reconstrução', x: 25, y: 65, parent: 'c4', desc: 'Pode recolocar membros decepados em campo.' },
        { id: 'c9', name: 'Força Titânica', x: 50, y: 65, parent: 'c5', desc: 'Sua capacidade de carga e dano de impacto dobram.' },
        { id: 'c10', name: 'Visão Preditiva', x: 75, y: 65, parent: 'c6', desc: 'Anula penalidades de ataque surpresa ou flanqueamento.' },
        { id: 'c11', name: 'Ápice Genético', x: 50, y: 85, parent: 'c9', desc: 'Ultrapassa o teto biológico para testes heroicos.' }
    ]
};
let currentUnlockedNodes = [];

function buildSkillTreeUI(nature) {
    const container = document.getElementById('specific-content-container');
    
    // Verifica se a natureza tem uma árvore
    if(!treeData[nature]) {
        // Renderização padrão se não for árvore
        const natureData = ruleset[currentMode].natures[nature];
        if(natureData && natureData.tabHtml) {
            container.innerHTML = natureData.tabHtml;
        }
        return;
    }
    
    // Constrói a UI da árvore
    let html = `
        <h3 style="color:var(--theme-color); font-family: 'Cinzel', serif; margin-bottom: 10px; text-align:center;">Ramificações Biológicas e Espirituais</h3>
        <p style="color:#aaa; font-size:0.85rem; text-align:center; margin-bottom:15px;">A evolução cobra seu preço. Desbloqueie os nodos adjacentes.</p>
        <div class="tree-ui-container">
            <svg class="tree-svg" id="tree-svg"></svg>
            <div class="tree-nodes" id="tree-nodes"></div>
        </div>
        <div id="tree-node-info" class="desc-box" style="margin-top:15px; min-height:60px; text-align:center;">Selecione um ponto na árvore para ver a descrição.</div>
        <input type="hidden" id="tree-unlocked-data" value="">
    `;
    container.innerHTML = html;
    
    setTimeout(() => renderTree(nature), 50);
}

function renderTree(nature) {
    const nodesContainer = document.getElementById('tree-nodes');
    const svgContainer = document.getElementById('tree-svg');
    if(!nodesContainer || !svgContainer) return;
    
    nodesContainer.innerHTML = '';
    svgContainer.innerHTML = '';
    
    const nodes = treeData[nature];
    
    // Recupera dados salvos
    const savedDataEl = document.getElementById('spec-tree-unlocks');
    if(savedDataEl && savedDataEl.value) {
        try { currentUnlockedNodes = JSON.parse(savedDataEl.value); } catch(e){}
    } else {
        // Lê do objeto personagem atual se existir
        if(editingIndex !== null && characters[editingIndex].specificData && characters[editingIndex].specificData['tree-unlocked-data']) {
            try { currentUnlockedNodes = JSON.parse(characters[editingIndex].specificData['tree-unlocked-data']); } catch(e){}
        } else {
            currentUnlockedNodes = [];
        }
    }
    document.getElementById('tree-unlocked-data').value = JSON.stringify(currentUnlockedNodes);

    // Renderiza Linhas (SVG)
    nodes.forEach(node => {
        if(node.parent) {
            const parent = nodes.find(n => n.id === node.parent);
            if(parent) {
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', parent.x + '%');
                line.setAttribute('y1', parent.y + '%');
                line.setAttribute('x2', node.x + '%');
                line.setAttribute('y2', node.y + '%');
                line.setAttribute('class', 'tree-line');
                line.setAttribute('id', `line-${parent.id}-${node.id}`);
                
                if(currentUnlockedNodes.includes(node.id)) {
                    line.classList.add('unlocked');
                }
                svgContainer.appendChild(line);
            }
        }
    });

    // Renderiza Nodos (HTML)
    nodes.forEach(node => {
        const div = document.createElement('div');
        div.className = 'tree-node';
        div.style.left = node.x + '%';
        div.style.top = node.y + '%';
        div.id = `node-${node.id}`;
        
        let initial = node.name.substring(0,2).toUpperCase();
        div.innerHTML = `<span>${initial}</span><div class="tree-node-label">${node.name}</div>`;
        
        if(currentUnlockedNodes.includes(node.id)) {
            div.classList.add('unlocked');
        }
        
        div.onclick = () => handleNodeClick(node, nature);
        nodesContainer.appendChild(div);
    });
}

function handleNodeClick(node, nature) {
    const infoBox = document.getElementById('tree-node-info');
    let statusText = currentUnlockedNodes.includes(node.id) ? '<span style="color:var(--theme-color)">[DESBLOQUEADO]</span>' : '<span style="color:#888">[BLOQUEADO]</span>';
    
    infoBox.innerHTML = `<strong>${node.name}</strong> ${statusText}<br>${node.desc}`;
    
    if(!isEditMode) return; // Se não puder editar, só mostra a info
    
    // Verifica se pode desbloquear
    if(!currentUnlockedNodes.includes(node.id)) {
        let canUnlock = false;
        if(node.parent === null) canUnlock = true;
        else if (currentUnlockedNodes.includes(node.parent)) canUnlock = true;
        
        if(canUnlock) {
            // Adiciona botão para desbloquear
            infoBox.innerHTML += `<br><button class="souls-btn small-btn" style="margin-top:10px;" onclick="unlockNode('${node.id}', '${nature}')">Desbloquear Habilidade</button>`;
        } else {
            infoBox.innerHTML += `<br><span style="color:red; font-size:0.8rem;">Requer habilidade anterior desbloqueada.</span>`;
        }
    } else {
         infoBox.innerHTML += `<br><button class="souls-btn small-btn" style="margin-top:10px; border-color:red; color:red;" onclick="relockNode('${node.id}', '${nature}')">Revogar Habilidade</button>`;
    }
}

function unlockNode(nodeId, nature) {
    if(!currentUnlockedNodes.includes(nodeId)) {
        currentUnlockedNodes.push(nodeId);
        document.getElementById('tree-unlocked-data').value = JSON.stringify(currentUnlockedNodes);
        renderTree(nature);
        
        // Re-clica no nó para atualizar o painel inferior
        const nodes = treeData[nature];
        const node = nodes.find(n => n.id === nodeId);
        if(node) handleNodeClick(node, nature);
    }
}

function relockNode(nodeId, nature) {
    // Remove este nó e todos os filhos dele recursivamente
    let toRemove = [nodeId];
    const nodes = treeData[nature];
    
    let changed = true;
    while(changed) {
        changed = false;
        nodes.forEach(n => {
            if(toRemove.includes(n.parent) && !toRemove.includes(n.id)) {
                toRemove.push(n.id);
                changed = true;
            }
        });
    }
    
    currentUnlockedNodes = currentUnlockedNodes.filter(id => !toRemove.includes(id));
    document.getElementById('tree-unlocked-data').value = JSON.stringify(currentUnlockedNodes);
    renderTree(nature);
    
    const node = nodes.find(n => n.id === nodeId);
    if(node) handleNodeClick(node, nature);
}
