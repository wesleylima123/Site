// PARTICLES
function createEmbers() {
    const container = document.getElementById('particles');
    if(!container) return;
    setInterval(() => {
        const ember = document.createElement('div');
        ember.classList.add('ember');
        ember.style.left = Math.random() * 100 + 'vw';
        ember.style.animationDuration = (Math.random() * 3 + 2) + 's';
        container.appendChild(ember);
        setTimeout(() => ember.remove(), 5000);
    }, 150);
}
createEmbers();

// ==========================================
// USER DATABASE & AUTHENTICATION
// ==========================================
let usersDB = JSON.parse(localStorage.getItem('mundosSombriosUsers')) || [];
let requestsDB = JSON.parse(localStorage.getItem('mundosSombriosRequests')) || [];

if (usersDB.length === 0) {
    usersDB = [
        { id: 'u1', username: 'admin', password: '123', role: 'admin' },
        { id: 'u2', username: 'mestre', password: '123', role: 'mestre' },
        { id: 'u3', username: 'jogador', password: '123', role: 'jogador' }
    ];
    localStorage.setItem('mundosSombriosUsers', JSON.stringify(usersDB));
}

let currentUser = null;

// ==========================================
// GAME DATABASE
// ==========================================
let allCharactersDB = JSON.parse(localStorage.getItem('mundosSombriosChars')) || [];
let allTablesDB = JSON.parse(localStorage.getItem('mundosSombriosTables')) || [];
let allJoinedTablesDB = JSON.parse(localStorage.getItem('mundosSombriosJoined')) || [];

let characters = []; 
let myTables = [];
let joinedTables = [];
const MAX_TABLES = 10;

let editingIndex = null;
let currentAvatarBase64 = '';
let currentGallery = [];
let isEditMode = true;
let selectedGameMode = '';
let activeCarouselIndex = 0;

let cropper = null;
let currentCropTarget = '';
let editingImageIndex = -1; 
let currentPowerDraft = [];

// VTT STATE
let vttCanvas = null;
let isVttGM = false;
let isDraftMode = false;
let currentTableData = null;
let currentVttTheme = 'default';
let chatLocked = false;
let tablePlayers = []; 
let myVttCharIndex = -1; 
let npcHpHidden = false;
let diceHistory = [];

// ==========================================
// AUTHENTICATION LOGIC
// ==========================================
function doLogin() {
    const user = document.getElementById('login-user').value.trim();
    const pass = document.getElementById('login-pass').value.trim();
    
    if(!user || !pass) { alert("Preencha as credenciais."); return; }
    
    const account = usersDB.find(u => u.username === user && u.password === pass);
    if(account) {
        currentUser = account;
        document.getElementById('login-user').value = '';
        document.getElementById('login-pass').value = '';
        
        document.getElementById('display-username').innerText = currentUser.username;
        
        // Emblema de Mestre
        const emblem = document.getElementById('master-emblem');
        if(currentUser.role === 'mestre' || currentUser.role === 'admin') {
            emblem.style.display = 'block';
            makeDraggable(emblem, emblem, false);
        } else {
            emblem.style.display = 'none';
        }
        
        // Botão Admin
        document.getElementById('btn-admin-panel').style.display = currentUser.role === 'admin' ? 'block' : 'none';
        
        // Restrição Tab Mestre Ancoragem
        document.getElementById('tab-btn-gm').style.display = (currentUser.role === 'mestre' || currentUser.role === 'admin') ? 'inline-block' : 'none';

        loadUserData();
        
        if(currentUser.role === 'admin') {
            renderAdminRequestsWindows();
        }

        showScreen('screen-mode-select');
    } else {
        alert("Entidade não reconhecida ou senha incorreta no Vazio.");
    }
}

function doLogout() {
    if(confirm("Deseja desconectar do Vazio?")) {
        currentUser = null;
        document.getElementById('master-emblem').style.display = 'none';
        document.getElementById('admin-requests-container').innerHTML = '';
        showScreen('screen-login');
    }
}

function openRegister() {
    document.getElementById('reg-user').value = '';
    document.getElementById('reg-email').value = '';
    document.getElementById('reg-pass').value = '';
    document.getElementById('reg-req-master').checked = false;
    document.getElementById('register-modal').style.display = 'flex';
}

function closeRegister() {
    document.getElementById('register-modal').style.display = 'none';
}

function doRegister() {
    const user = document.getElementById('reg-user').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const pass = document.getElementById('reg-pass').value.trim();
    const reqMaster = document.getElementById('reg-req-master').checked;
    
    if(!user || !pass || !email) { alert("Preencha todos os campos."); return; }
    if(usersDB.find(u => u.username === user)) { alert("Nome já reclamado por outra alma."); return; }
    
    const newUser = {
        id: 'u' + Date.now(),
        username: user,
        email: email,
        password: pass,
        role: 'jogador' // starts as player
    };
    usersDB.push(newUser);
    localStorage.setItem('mundosSombriosUsers', JSON.stringify(usersDB));
    
    if(reqMaster) {
        requestsDB.push({ id: Date.now(), userId: newUser.id, username: user });
        localStorage.setItem('mundosSombriosRequests', JSON.stringify(requestsDB));
    }
    
    alert("Alma Despertada! Agora você pode atravessar o portal (Login).");
    closeRegister();
}

function openRecover() {
    document.getElementById('rec-email').value = '';
    document.getElementById('recover-modal').style.display = 'flex';
}

function closeRecover() {
    document.getElementById('recover-modal').style.display = 'none';
}

function doRecover() {
    const email = document.getElementById('rec-email').value.trim();
    const acc = usersDB.find(u => u.email === email);
    if(acc) {
        alert(`O Olho que Tudo Vê encontrou a senha: ${acc.password}`);
    } else {
        alert("E-mail inexistente no Vazio.");
    }
    closeRecover();
}

// ==========================================
// ADMIN PANEL
// ==========================================
function openAdminPanel() {
    renderAdminPanel();
    document.getElementById('admin-panel-modal').style.display = 'flex';
}

function renderAdminPanel() {
    const tbody = document.getElementById('admin-users-list');
    tbody.innerHTML = '';
    usersDB.forEach((u, index) => {
        tbody.innerHTML += `
            <tr>
                <td>${u.id}</td>
                <td><input type="text" id="edit-user-${index}" value="${u.username}"></td>
                <td><input type="text" id="edit-pass-${index}" value="${u.password}"></td>
                <td>
                    <select id="edit-role-${index}">
                        <option value="jogador" ${u.role==='jogador'?'selected':''}>Jogador</option>
                        <option value="mestre" ${u.role==='mestre'?'selected':''}>Mestre</option>
                        <option value="admin" ${u.role==='admin'?'selected':''}>Admin</option>
                    </select>
                </td>
                <td><button class="souls-btn small-btn" style="border-color:#00ffcc; color:#00ffcc;" onclick="saveUserRow(${index})">Salvar</button></td>
            </tr>
        `;
    });
}

function saveUserRow(index) {
    usersDB[index].username = document.getElementById(`edit-user-${index}`).value;
    usersDB[index].password = document.getElementById(`edit-pass-${index}`).value;
    usersDB[index].role = document.getElementById(`edit-role-${index}`).value;
    localStorage.setItem('mundosSombriosUsers', JSON.stringify(usersDB));
    alert("Registro Akáshico alterado.");
}

function renderAdminRequestsWindows() {
    const container = document.getElementById('admin-requests-container');
    container.innerHTML = '';
    requestsDB.forEach((req, idx) => {
        const top = 100 + (idx * 30);
        const left = 100 + (idx * 30);
        const win = document.createElement('div');
        win.id = `req-win-${req.id}`;
        win.className = 'vtt-floating-window';
        win.style.cssText = `position:absolute; top:${top}px !important; left:${left}px !important; transform:none !important; width:300px; display:flex; pointer-events:auto; z-index:9500;`;
        
        win.innerHTML = `
            <div class="vtt-window-header" id="req-header-${req.id}">
                <span class="vtt-font" style="font-size:0.9rem;">Elevação de Mestre</span>
                <button class="win-close-btn" onclick="document.getElementById('req-win-${req.id}').style.display='none'">X</button>
            </div>
            <div class="vtt-window-body" style="text-align:center;">
                <p style="margin-bottom:15px; font-size:0.9rem;"><b>${req.username}</b> deseja forjar Fendas (Mestre).</p>
                <div style="display:flex; gap:10px; justify-content:center;">
                    <button class="souls-btn small-btn" style="border-color:#a8ff00; color:#a8ff00;" onclick="handleReq(${req.id}, true)">Aceitar</button>
                    <button class="souls-btn small-btn" style="border-color:#ff3333; color:#ff3333;" onclick="handleReq(${req.id}, false)">Negar</button>
                </div>
            </div>
        `;
        container.appendChild(win);
        makeDraggable(win, win.querySelector(`#req-header-${req.id}`), false);
    });
}

function handleReq(reqId, approved) {
    const req = requestsDB.find(r => r.id === reqId);
    if(req) {
        if(approved) {
            const u = usersDB.find(u => u.id === req.userId);
            if(u) {
                u.role = 'mestre';
                localStorage.setItem('mundosSombriosUsers', JSON.stringify(usersDB));
            }
        }
        requestsDB = requestsDB.filter(r => r.id !== reqId);
        localStorage.setItem('mundosSombriosRequests', JSON.stringify(requestsDB));
        document.getElementById(`req-win-${reqId}`).remove();
    }
}

// ==========================================
// DATA ISOLATION
// ==========================================
function loadUserData() {
    characters = allCharactersDB.filter(c => c.ownerId === currentUser.id);
    myTables = allTablesDB.filter(t => t.ownerId === currentUser.id);
    joinedTables = allJoinedTablesDB.filter(t => t.ownerId === currentUser.id);
}

function saveGlobalCharacters() {
    characters.forEach(c => {
        const idx = allCharactersDB.findIndex(dbC => dbC.id === c.id);
        if(idx !== -1) allCharactersDB[idx] = c;
        else allCharactersDB.push(c);
    });
    localStorage.setItem('mundosSombriosChars', JSON.stringify(allCharactersDB));
}

function saveGlobalJoinedTables() {
    joinedTables.forEach(t => {
        const idx = allJoinedTablesDB.findIndex(dbT => dbT.code === t.code && dbT.ownerId === currentUser.id);
        if(idx !== -1) allJoinedTablesDB[idx] = t;
        else allJoinedTablesDB.push(t);
    });
    allJoinedTablesDB = allJoinedTablesDB.filter(t => t.ownerId !== currentUser.id || joinedTables.some(jt => jt.code === t.code));
    localStorage.setItem('mundosSombriosJoined', JSON.stringify(allJoinedTablesDB));
}


// DICIONÁRIOS
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
    if(!nature) return "";
    if(nature.includes("Nexo Padrão")) return "card-nexo";
    if(nature.includes("Arquiteto")) return "card-aprimorador";
    if(nature.includes("Operador")) return "card-player";
    if(nature.includes("Classer")) return "card-classer";
    if(nature.includes("Carreira")) return "card-carreira";
    if(nature.includes("Designado")) return "card-designado";
    if(nature.includes("Envolto")) return "card-envolto";
    if(nature.includes("Ordem")) return "card-ordem";
    return "";
}

function applyNatureTheme(nature) {
    const layout = document.getElementById('pdf-content');
    layout.className = 'builder-layout'; 
    if(!nature) return;
    if(nature.includes("Nexo Padrão")) layout.classList.add('theme-nexo');
    else if(nature.includes("Arquiteto")) layout.classList.add('theme-arquiteto');
    else if(nature.includes("Operador")) layout.classList.add('theme-operador');
    else if(nature.includes("Classer")) layout.classList.add('theme-classer');
    else if(nature.includes("Carreira")) layout.classList.add('theme-carreira');
    else if(nature.includes("Designado")) layout.classList.add('theme-designado');
    else if(nature.includes("Envolto")) layout.classList.add('theme-envolto');
    else if(nature.includes("Ordem")) layout.classList.add('theme-ordem');
}

// NAVIGATION
function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active', 'overlay'));
    const target = document.getElementById(id);
    target.classList.add('active');
    
    if(id === 'screen-char-select') {
        isEditMode = true; 
        renderCharList();
        document.getElementById('sanctuary-limits').innerText = `Almas Vivas: ${characters.length} / ${currentUser.role === 'jogador' ? 5 : 10}`;
    }
    if(id === 'screen-ancoragem') {
        renderAncoragem();
    }
}

function selectGameMode(mode) {
    selectedGameMode = mode;
    const titleEl = document.getElementById('sanctuary-title');
    titleEl.innerText = mode === 'exodo' ? "Santuário de Êxodo" : "Santuário de Ocultatun";
    showScreen('screen-char-select');
}

function switchAncoragemTab(tab) {
    document.getElementById('ancoragem-player-tab').style.display = tab === 'player' ? 'flex' : 'none';
    document.getElementById('ancoragem-gm-tab').style.display = tab === 'gm' ? 'flex' : 'none';
    document.querySelectorAll('#screen-ancoragem .tab-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
}

// MESA / ANCORAGEM
function generateRoomCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function openCreateTableModal() {
    if(currentUser.role === 'jogador') {
        alert("Apenas Mestres ou Administradores têm o poder de abrir novas Fendas.");
        return;
    }
    document.getElementById('new-table-name').value = '';
    document.getElementById('create-table-modal').style.display = 'flex';
}

function confirmCreateTable() {
    if(myTables.length >= MAX_TABLES) {
        alert("Você atingiu o limite máximo de 10 Fendas (Mesas).");
        return;
    }
    const name = document.getElementById('new-table-name').value.trim();
    if(!name) {
        alert("A fenda precisa de um nome.");
        return;
    }
    
    currentVttTheme = document.getElementById('new-table-theme').value;
    document.getElementById('create-table-modal').style.display = 'none';
    
    // Entra em Draft Mode
    isDraftMode = true;
    enterVTT('draft', true, name);
}

function saveDraftTable() {
    const code = generateRoomCode();
    const newTable = {
        id: Date.now().toString(),
        name: document.getElementById('vtt-table-name').innerText,
        code: code,
        theme: currentVttTheme,
        ownerId: currentUser.id,
        banned: []
    };
    
    myTables.push(newTable);
    
    // Save to global DB
    allTablesDB.push(newTable);
    localStorage.setItem('mundosSombriosTables', JSON.stringify(allTablesDB));
    
    isDraftMode = false;
    currentTableData = newTable;
    
    document.getElementById('btn-save-table').style.display = 'none';
    alert(`Fenda Imortalizada com sucesso!
Código de Acesso para os Jogadores: ${code}`);
}

function renderAncoragem() {
    const gmList = document.getElementById('gm-tables-list');
    const plList = document.getElementById('player-tables-list');
    gmList.innerHTML = '';
    plList.innerHTML = '';

    if(myTables.length === 0) {
        gmList.innerHTML = '<p style="color:#666;">Nenhuma fenda criada.</p>';
    } else {
        myTables.forEach(t => {
            gmList.innerHTML += `
                <div class="portal-wrapper">
                    <div class="portal-3d portal-pyramid" onclick="enterVTT('${t.id}', true)">
                        <div class="pyramid-face p-front"></div><div class="pyramid-face p-back"></div><div class="pyramid-face p-right"></div><div class="pyramid-face p-left"></div><div class="pyramid-base"></div>
                    </div>
                    <p>${t.name}<br><span style="font-size:0.7rem; color:#888;">Code: ${t.code}</span></p>
                    <div class="portal-actions">
                        <button class="souls-btn small-btn" style="padding:2px 8px; font-size:0.7rem;" onclick="copyCode('${t.code}')">Copiar Código</button>
                        <button class="souls-btn small-btn" style="padding:2px 8px; font-size:0.7rem; border-color:red; color:red;" onclick="deleteTable('${t.id}')">Excluir</button>
                    </div>
                </div>
            `;
        });
    }

    if(joinedTables.length === 0) {
        plList.innerHTML = '<p style="color:#666;">Nenhuma conexão ativa.</p>';
    } else {
        joinedTables.forEach(t => {
            plList.innerHTML += `
                <div class="portal-wrapper">
                    <div class="portal-3d portal-cube" onclick="enterVTT('${t.code}', false)">
                        <div class="face front"></div><div class="face back"></div><div class="face right"></div><div class="face left"></div><div class="face top"></div><div class="face bottom"></div>
                    </div>
                    <p>${t.name}<br><span style="font-size:0.7rem; color:#888;">(Conectado)</span></p>
                    <div class="portal-actions">
                        <button class="souls-btn small-btn" style="padding:2px 8px; font-size:0.7rem; border-color:red; color:red;" onclick="leaveJoinedTable('${t.code}')">Sair da Mesa</button>
                    </div>
                </div>
            `;
        });
    }
}

function copyCode(code) {
    navigator.clipboard.writeText(code).then(() => {
        alert("Código copiado para a área de transferência!");
    });
}

function deleteTable(id) {
    if(confirm("Tem certeza que deseja apagar essa Fenda para sempre? O mundo será destruído.")) {
        myTables = myTables.filter(t => t.id !== id);
        allTablesDB = allTablesDB.filter(t => t.id !== id);
        localStorage.setItem('mundosSombriosTables', JSON.stringify(allTablesDB));
        renderAncoragem();
    }
}

function leaveJoinedTable(code) {
    if(confirm("Deseja cortar sua conexão permanente com esta Fenda?")) {
        joinedTables = joinedTables.filter(t => t.code !== code);
        saveGlobalJoinedTables();
        renderAncoragem();
    }
}

function openJoinTableModal() {
    const select = document.getElementById('join-char-select-vtt');
    select.innerHTML = '';
    if(characters.length === 0) {
        select.innerHTML = '<option disabled>Nenhuma alma no santuário</option>';
    } else {
        characters.forEach((c, i) => select.innerHTML += `<option value="${i}">${c.name} - ${c.nature}</option>`);
    }
    document.getElementById('join-code-input').value = '';
    document.getElementById('join-modal').style.display = 'flex';
}

function confirmJoinTable() {
    const code = document.getElementById('join-code-input').value.trim().toUpperCase();
    const charIndex = document.getElementById('join-char-select-vtt').value;
    
    if(!code || !charIndex) {
        alert("Preencha o código e selecione uma alma.");
        return;
    }

    document.getElementById('join-modal').style.display = 'none';
    myVttCharIndex = parseInt(charIndex);
    
    const ownTable = myTables.find(t => t.code === code);
    if(ownTable) {
        alert("Você é o Mestre desta mesa! Entrando como Mestre.");
        enterVTT(ownTable.id, true);
        return;
    }

    let existingJoin = joinedTables.find(t => t.code === code);
    if(!existingJoin) {
        existingJoin = { code: code, name: "Fenda " + code, ownerId: currentUser.id };
        joinedTables.push(existingJoin);
        saveGlobalJoinedTables();
    }
    
    enterVTT(code, false);
}

// BUILDER FUNCTIONS (RESTRUCTURED CLASSES AND EXPANSIONS)
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
    else box.innerText = "Descrição indisponível nos registros primários.";
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
            powersToUse = ["Habilidades Manuais"];
        }
    }
    powersToUse.forEach(p => pwSelect.innerHTML += `<option value="${p}">${p}</option>`);
    updatePowerDesc();
}

function updatePowerDesc() {
    const name = document.getElementById('pb-potency-name').value;
    const box = document.getElementById('power-desc-box');
    if(descDict.powers[name]) box.innerText = descDict.powers[name];
    else box.innerText = "";
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
            if(currentNature.includes("Carrasco")) val = (vig * 10) + 15;
            else if(currentNature.includes("Ordem")) val = (vig * 10) + 10;
            else if(currentNature.includes("Esotérico")) val = (vig * 10) + 12;
            else val = (vig * 10) + 10;
        }
        else if(type.includes("EP") || type.includes("Energia") || type.includes("EE")) {
            val = (Math.max(int, pre) * 5) + 15;
        }
        else if(type.includes("EB") || type.includes("Estamina")) {
            val = (vig * 3) + 5;
        }
        else if(type.includes("DS")) {
            let baseDS = (int + prn) * 3;
            val = baseDS;
        }
        else if(type.includes("CO") || type.includes("Decadência") || type.includes("Assimilação")) val = 0; 
        else if(type.includes("LHL")) val = 75; 
        else val = "-"; 
        
        inp.placeholder = "Base: " + val;
        
        if(!inp.value && isEditMode) {
             if (val !== 0 && val !== "-") {
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
    document.getElementById('btn-toggle-edit').innerText = isEditMode ? "SALVAR EDIÇÃO" : "INICIAR EDIÇÃO";
    
    // Manage input attributes
    document.querySelectorAll('#char-form input[type="text"], #char-form input[type="number"], #char-form textarea').forEach(el => {
        if(!isEditMode) el.setAttribute('readonly', true);
        else el.removeAttribute('readonly');
    });
    
    // In view mode, pointer-events:none on choice cards
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
    
    if(!name) { alert("Dê um nome ao poder/ritual."); return; }
    if(currentPowerDraft.length === 0) { alert("Anexe pelo menos uma potência à formula."); return; }

    const container = document.getElementById('powers-list');
    const div = document.createElement('div');
    div.className = 'list-item';
    
    let partsHtml = currentPowerDraft.map(p => `<span class="nature-text">${p.potency} (Cap:${p.cap})</span>`).join(" + ");
    
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
            alert("Ficha do jogador atualizada na Mesa.");
            closeBuilder();
            renderVttCards();
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
        ownerId: currentUser.id, // Vínculo com a conta
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

    // Restrictions
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
        btnNew.innerText = "DESPERTAR NOVA ALMA";
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

// PDF DOWNLOAD E EXPORTAÇÃO JSON
async function downloadPDF() {
    const wasEdit = isEditMode;
    isEditMode = false;
    toggleEditUI();
    const builder = document.getElementById('screen-builder');
    builder.classList.add('pdf-print-mode');
    const name = document.getElementById('char-name').value || 'Alma_Desconhecida';
    const opt = { margin: 10, filename: `${name}_Ficha.pdf`, image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2, useCORS: true, backgroundColor: '#111' }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }};
    await html2pdf().set(opt).from(builder).save();
    builder.classList.remove('pdf-print-mode');
    isEditMode = wasEdit;
    toggleEditUI();
}

function exportCharacterJSON() {
    if (editingIndex === null) return;
    const sourceArray = document.getElementById('screen-vtt').classList.contains('active') ? tablePlayers : characters;
    const char = sourceArray[editingIndex];
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(char, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    let safeName = (char.name || "Alma_Desconhecida").replace(/\s+/g, '_');
    downloadAnchorNode.setAttribute("download", safeName + "_Ficha.json");
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
            if(document.getElementById('screen-char-select').classList.contains('active')){
                renderCharList();
            }
            alert(`Alma invocada do Vazio com sucesso!`);
        } catch (err) {
            alert("Erro fatal ao ler o Códice JSON.");
        }
        event.target.value = '';
    };
    reader.readAsText(file);
}

// ---------------------------------------------------------------------
// VTT - VIRTUAL TABLETOP LOGIC (JANELAS E MESAS)
// ---------------------------------------------------------------------

function enterVTT(tableIdOrCode, asGM, draftName = null) {
    isVttGM = asGM;
    document.querySelectorAll('.gm-only-btn').forEach(el => el.style.display = asGM ? 'flex' : 'none');
    
    tablePlayers = [];
    currentTableData = null;
    diceHistory = [];
    renderDiceHistory();
    
    if(tableIdOrCode === 'draft') {
        document.getElementById('vtt-table-name').innerText = draftName || "Forjando Nova Fenda...";
        document.getElementById('btn-save-table').style.display = 'block';
    } else if(asGM) {
        document.getElementById('btn-save-table').style.display = 'none';
        currentTableData = myTables.find(t => t.id == tableIdOrCode);
        document.getElementById('vtt-table-name').innerText = currentTableData ? currentTableData.name : "Sessão Mestra";
        
        if(currentTableData && currentTableData.theme) {
            document.getElementById('vtt-theme-select').value = currentTableData.theme;
            previewVttTheme();
        }
        
        // Mock players
        tablePlayers.push({ id: 1, name: 'Jogador (Teste)', nature: 'Nexo Padrão', className: 'Combatente', resources: {PV: 15}, isMe: false });
        tablePlayers.push({ id: 2, name: 'Goblin Abissal', nature: 'Agente Designado (Ocultatun)', className: 'NPC', resources: {PV: 20}, isMe: false, isNPC: true });
    } else {
        document.getElementById('btn-save-table').style.display = 'none';
        const jTable = joinedTables.find(t => t.code === tableIdOrCode);
        document.getElementById('vtt-table-name').innerText = jTable ? jTable.name : ("Conectado: " + tableIdOrCode);
        
        if(myVttCharIndex !== -1 && characters[myVttCharIndex]) {
            let myChar = JSON.parse(JSON.stringify(characters[myVttCharIndex]));
            myChar.isMe = true;
            tablePlayers.push(myChar);
        }
        tablePlayers.push({ id: 3, name: 'Aliado Fictício', nature: 'A Ordem dos Sete (Alta Glória)', className: 'Sentinela', resources: {PV: 30}, isMe: false });
    }
    
    showScreen('screen-vtt');
    
    // Esconder tudo, mostrar apenas chat inicialmente
    document.querySelectorAll('.vtt-floating-window').forEach(el => el.style.display = 'none');
    toggleVttWindow('vtt-chat-box');
    
    renderVttCards();
}

function centerWindow(el) {
    el.style.left = (window.innerWidth / 2 - el.offsetWidth / 2) + 'px';
    el.style.top = (window.innerHeight / 2 - el.offsetHeight / 2) + 'px';
}

function toggleVttWindow(id) {
    // Fecha todas as outras, mantendo exclusividade visual
    document.querySelectorAll('.vtt-floating-window').forEach(el => {
        if(el.id !== id) el.style.display = 'none';
    });

    const el = document.getElementById(id);
    if(el.style.display === 'none' || el.style.display === '') {
        el.style.display = 'flex';
        el.style.zIndex = 600;
        centerWindow(el); // Centraliza sempre que abre
        
        if(id === 'vtt-grid-window') {
            setTimeout(initVttGrid, 50);
        }
    } else {
        el.style.display = 'none';
    }
}

function leaveVTT() {
    if(confirm("Deseja desconectar sua alma desta fenda?")) {
        isDraftMode = false;
        showScreen('screen-ancoragem');
        tablePlayers = [];
    }
}

function openManagePlayers() {
    const list = document.getElementById('manage-players-list');
    list.innerHTML = '';
    tablePlayers.forEach((p, idx) => {
        if(!p.isMe) {
            list.innerHTML += `
                <div style="display:flex; justify-content:space-between; align-items:center; background:#111; padding:10px; border:1px solid #444; margin-bottom:10px;">
                    <span style="color:#fff;">${p.name} ${p.isNPC ? '(NPC)' : ''}</span>
                    <div>
                        <button class="souls-btn small-btn" style="padding:5px;" onclick="kickPlayer(${idx}, 'temp')">Expulsar</button>
                        <button class="souls-btn small-btn" style="padding:5px; border-color:red; color:red;" onclick="kickPlayer(${idx}, 'perm')">Banir</button>
                    </div>
                </div>
            `;
        }
    });
    if(list.innerHTML === '') list.innerHTML = '<p>Nenhum outro jogador presente.</p>';
    document.getElementById('manage-players-modal').style.display = 'flex';
}

function kickPlayer(index, type) {
    const p = tablePlayers[index];
    if(confirm(`Deseja ${type === 'perm' ? 'BANIR' : 'EXPULSAR'} ${p.name}?`)) {
        if(type === 'perm' && currentTableData && !p.isNPC) {
            currentTableData.banned.push(p.id);
            localStorage.setItem('mundosSombriosTables', JSON.stringify(allTablesDB));
        }
        tablePlayers.splice(index, 1);
        renderVttCards();
        openManagePlayers(); // refresh list
    }
}

// VTT THEMES
function openThemeEditor() { document.getElementById('theme-modal').style.display = 'flex'; }
function cancelVttTheme() { document.getElementById('theme-modal').style.display = 'none'; }
function previewVttTheme() {
    const theme = document.getElementById('vtt-theme-select').value;
    const font = document.getElementById('vtt-font-select').value;
    const vttScreen = document.getElementById('screen-vtt');
    vttScreen.setAttribute('data-theme', theme);
    vttScreen.style.setProperty('--vtt-font-family', font);
    
    // Theme colors
    if(theme === 'cyber') { vttScreen.style.setProperty('--vtt-accent', '#00ffcc'); vttScreen.style.setProperty('--vtt-bg', '#001111'); }
    else if(theme === 'gothic') { vttScreen.style.setProperty('--vtt-accent', '#ff3333'); vttScreen.style.setProperty('--vtt-bg', '#110000'); }
    else if(theme === 'cosmic') { vttScreen.style.setProperty('--vtt-accent', '#9933ff'); vttScreen.style.setProperty('--vtt-bg', '#0a001a'); }
    else { vttScreen.style.setProperty('--vtt-accent', '#d4af37'); vttScreen.style.setProperty('--vtt-bg', '#050505'); }
}
function applyVttTheme() { 
    if(currentTableData) {
        currentTableData.theme = document.getElementById('vtt-theme-select').value;
        const idx = allTablesDB.findIndex(t => t.id === currentTableData.id);
        if(idx !== -1) allTablesDB[idx].theme = currentTableData.theme;
        localStorage.setItem('mundosSombriosTables', JSON.stringify(allTablesDB));
    }
    cancelVttTheme(); 
}

// VTT DRAGGABLES
function setupDraggables() {
    makeDraggable(document.getElementById('vtt-grid-window'), document.getElementById('grid-window-header'), false);
    makeDraggable(document.getElementById('vtt-gallery-window'), document.getElementById('gallery-window-header'), false);
    makeDraggable(document.getElementById('vtt-dice-box'), document.getElementById('dice-box-header'), true); 
    makeDraggable(document.getElementById('vtt-chat-box'), document.getElementById('chat-box-header'), false); 
}

function makeDraggable(el, header, requiresGM) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    header.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        if(requiresGM && !isVttGM) {
            alert("Apenas o Mestre dita onde os dados caem.");
            return;
        }
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
        
        if (el.id === 'master-emblem') {
            el.style.zIndex = 10001; 
        } else {
            el.style.zIndex = 600; // bring to front
        }
    }

    function elementDrag(e) {
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        
        let newTop = el.offsetTop - pos2;
        let newLeft = el.offsetLeft - pos1;
        
        // Prevent getting stuck outside viewport
        if(el.id === 'master-emblem') {
            newTop = Math.max(0, Math.min(newTop, window.innerHeight - el.offsetHeight));
            newLeft = Math.max(0, Math.min(newLeft, window.innerWidth - el.offsetWidth));
        }
        
        el.style.top = newTop + "px";
        el.style.left = newLeft + "px";
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

// VTT GRID (Fabric.js)
function initVttGrid() {
    const container = document.getElementById('canvas-wrapper');
    document.getElementById('vtt-table-name-display').innerText = document.getElementById('vtt-table-name').innerText;
    
    if(!vttCanvas) {
        vttCanvas = new fabric.Canvas('vtt-canvas', {
            width: container.clientWidth,
            height: container.clientHeight,
            selection: false
        });
        
        drawGridLines();
        
        vttCanvas.on('object:moving', function(e) {
            if(!isVttGM && e.target.owner !== 'me') {
                e.target.set({left: e.transform.original.left, top: e.transform.original.top});
                vttCanvas.renderAll();
            }
        });
    } else {
        vttCanvas.setWidth(container.clientWidth);
        vttCanvas.setHeight(container.clientHeight);
        vttCanvas.calcOffset(); 
    }
}

function drawGridLines() {
    const objects = vttCanvas.getObjects('line');
    objects.forEach(obj => { if(obj.isGridLine) vttCanvas.remove(obj); });

    const gridSize = 50;
    for (let i = 0; i < (vttCanvas.width / gridSize); i++) {
        vttCanvas.add(new fabric.Line([ i * gridSize, 0, i * gridSize, vttCanvas.height], { stroke: '#333', selectable: false, isGridLine: true }));
    }
    for (let i = 0; i < (vttCanvas.height / gridSize); i++) {
        vttCanvas.add(new fabric.Line([ 0, i * gridSize, vttCanvas.width, i * gridSize], { stroke: '#333', selectable: false, isGridLine: true }));
    }
    vttCanvas.sendToBack(...vttCanvas.getObjects('line'));
}

function canvasSetMode(mode) {
    vttCanvas.isDrawingMode = false;
    vttCanvas.getObjects().forEach(o => o.set('selectable', mode === 'select'));
}

function canvasAddPCToken() {
    if(!tablePlayers.length) return;
    const myChar = tablePlayers.find(p => p.isMe) || tablePlayers[0];
    
    fabric.Image.fromURL(myChar.avatar || '', function(img) {
        if(!img) {
            const circle = new fabric.Circle({ radius: 25, fill: '#00ffcc', stroke: '#fff', strokeWidth: 2, shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.8)', blur: 10, offsetX: 5, offsetY: 5 }) });
            createTokenGroup(circle, myChar.name, 'me', '#00ffcc');
        } else {
            img.scaleToWidth(50);
            img.scaleToHeight(50);
            img.set({clipPath: new fabric.Circle({radius:25, originX:'center', originY:'center'})});
            const circle = new fabric.Circle({ radius: 26, fill: 'transparent', stroke: '#00ffcc', strokeWidth: 2, shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.8)', blur: 10, offsetX: 5, offsetY: 5 }) });
            createTokenGroup(img, myChar.name, 'me', '#00ffcc', circle);
        }
    });
}

function canvasAddNPCToken() {
    if(!isVttGM) return;
    const color = prompt("Cor do Monstro/NPC (Ex: red, #ff00ff):", "#ff3333");
    const name = prompt("Nome do Monstro:", "Goblin Abissal");
    const circle = new fabric.Circle({ radius: 25, fill: color, stroke: '#000', strokeWidth: 2, shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.8)', blur: 10, offsetX: 5, offsetY: 5 }) });
    createTokenGroup(circle, name, 'gm', color);
}

function createTokenGroup(mainObj, nameText, owner, color, borderObj = null) {
    const text = new fabric.Text(nameText, { fontSize: 12, fill: '#fff', originX: 'center', top: 30, backgroundColor: 'rgba(0,0,0,0.7)' });
    const objs = borderObj ? [mainObj, borderObj, text] : [mainObj, text];
    const group = new fabric.Group(objs, { left: 100, top: 100, owner: owner, borderColor: color, cornerColor: color, transparentCorners: false });
    vttCanvas.add(group);
}

function canvasSetBackground(e) {
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = function(f) {
        fabric.Image.fromURL(f.target.result, function(img) {
            vttCanvas.setBackgroundImage(img, vttCanvas.renderAll.bind(vttCanvas), {
                scaleX: vttCanvas.width / img.width,
                scaleY: vttCanvas.height / img.height
            });
        });
    };
    reader.readAsDataURL(file);
}

function canvasAddShape(type) {
    let shape;
    if(type === 'cone') {
        shape = new fabric.Triangle({ width: 100, height: 100, fill: 'rgba(255,51,51,0.3)', stroke: '#ff3333', left: 150, top: 150, owner: isVttGM?'gm':'me' });
    } else if (type === 'line') {
        shape = new fabric.Rect({ width: 200, height: 10, fill: 'rgba(0,255,204,0.5)', stroke: '#00ffcc', left: 150, top: 150, owner: isVttGM?'gm':'me' });
    } else if (type === 'radius') {
        shape = new fabric.Circle({ radius: 100, fill: 'rgba(212,175,55,0.3)', stroke: '#d4af37', left: 150, top: 150, owner: isVttGM?'gm':'me' });
    }
    vttCanvas.add(shape);
}

function canvasToggleRuler() {
    alert("Função de Régua: Clique e arraste para medir (Simulado). Grid = 1.5m");
}

function canvasDeleteSelected() {
    const active = vttCanvas.getActiveObject();
    if(active) {
        if(!isVttGM && active.owner !== 'me') { alert("Você não pode apagar isso."); return; }
        vttCanvas.remove(active);
    }
}

// VTT CARDS & QUICK ACCESS
function renderVttCards() {
    const container = document.getElementById('vtt-active-cards-container');
    const qaContainer = document.getElementById('vtt-quick-access');
    if(!container) return;
    
    container.innerHTML = '';
    qaContainer.innerHTML = '';

    tablePlayers.forEach((char, index) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'card-wrapper';
        
        let hpVal = char.resources && char.resources['PV'] ? char.resources['PV'] : 10;
        
        let hpVisibility = "";
        if(char.isNPC && npcHpHidden && !isVttGM) {
            hpVisibility = "display:none;";
        }
        
        wrapper.innerHTML = `
            <div class="soul-card ${getNatureCardClass(char.nature)}">
                <div class="ornament"></div>
                ${char.avatar ? `<img src="${char.avatar}" class="card-bg-img">` : ''}
                <div class="soul-card-icon" style="${char.avatar ? 'background-image:url('+char.avatar+')' : ''}"></div>
                <h3 style="font-size:0.8rem">${char.name}</h3>
                <div class="card-hp-bar-container" style="${hpVisibility}"><div class="card-hp-bar" style="width: 100%;"></div></div>
                <span style="font-size:10px; color:#fff; z-index:2; position:relative; ${hpVisibility}">PV: ${hpVal}/${hpVal}</span>
            </div>`;
            
        wrapper.onclick = () => {
            const builder = document.getElementById('screen-builder');
            builder.classList.add('overlay');
            const restrict = !isVttGM && !char.isMe; 
            loadCharacterToBuilder(index, tablePlayers, restrict);
        };
        container.appendChild(wrapper);

        // GM Quick Access Buttons
        if(isVttGM && !char.isNPC) {
            const qaBtn = document.createElement('div');
            qaBtn.className = 'qa-btn';
            qaBtn.style.backgroundImage = `url(${char.avatar || ''})`;
            qaBtn.title = char.name;
            qaBtn.onclick = () => wrapper.click();
            qaContainer.appendChild(qaBtn);
        }
    });
}

function toggleNPCHealthVisibility() {
    npcHpHidden = !npcHpHidden;
    document.getElementById('npc-hp-status').innerText = npcHpHidden ? "Oculto" : "Público";
    renderVttCards();
}

// VTT 3D DICE SIMULATION & HISTORY
function buildCSSDiceFaces(type, result) {
    const die = document.getElementById('css-die');
    die.innerHTML = '';
    die.className = `die-3d ${type}`;
    
    let numFaces = 6;
    if (type === 'd4') numFaces = 4;
    else if (type === 'd8') numFaces = 8;
    else if (type === 'd10' || type === 'd12' || type === 'd20') {
        die.className = 'die-3d complex-poly';
        numFaces = 3; 
    }

    for(let i=0; i<numFaces; i++) {
        const face = document.createElement('div');
        face.className = 'die-face';
        
        if (type === 'd4' || type === 'd8') {
            face.setAttribute('data-val', result);
        } else {
            face.innerText = result;
        }
        die.appendChild(face);
    }
}

function roll3DDice(type) {
    const die = document.getElementById('css-die');
    const resultText = document.getElementById('dice-result-text');
    
    die.style.transition = 'none';
    die.style.transform = 'rotateX(0deg) rotateY(0deg) rotateZ(0deg)';
    resultText.innerText = 'Rolando...';
    
    buildCSSDiceFaces(type, '?');
    
    setTimeout(() => {
        die.style.transition = 'transform 2s cubic-bezier(0.1, 0.8, 0.2, 1)';
        const rotX = Math.floor(Math.random() * 720) + 720;
        const rotY = Math.floor(Math.random() * 720) + 720;
        const rotZ = Math.floor(Math.random() * 360);
        die.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg) rotateZ(${rotZ}deg)`;
        
        setTimeout(() => {
            let max = parseInt(type.substring(1));
            let result = Math.floor(Math.random() * max) + 1;
            
            buildCSSDiceFaces(type, result); 
            
            resultText.innerText = `Resultado: ${result}`;
            
            let sender = "Mestre";
            if(!isVttGM) {
                const me = tablePlayers.find(p => p.isMe);
                sender = me ? me.name : "Jogador";
            }
            
            addDiceRollToHistory(type, result, sender);
            addChatMessage('Sistema', `(${sender}) Rolou um ${type} e tirou ${result}!`, '#d4af37');
        }, 2000);
    }, 50);
}

function addDiceRollToHistory(type, result, sender) {
    const id = Date.now();
    diceHistory.push({ id, type, result, sender });
    renderDiceHistory();
}

function renderDiceHistory() {
    const list = document.getElementById('dice-history-list');
    list.innerHTML = '';
    
    [...diceHistory].reverse().forEach(roll => {
        let delBtn = isVttGM ? `<button style="background:none; border:none; color:red; cursor:pointer; margin-left:10px;" onclick="deleteDiceRoll(${roll.id})">(X)</button>` : '';
        list.innerHTML += `<li style="padding:5px; border-bottom:1px solid #333;"><b style="color:var(--vtt-accent)">${roll.sender}</b>: ${roll.type} ➔ <b>${roll.result}</b> ${delBtn}</li>`;
    });
}

function deleteDiceRoll(id) {
    diceHistory = diceHistory.filter(r => r.id !== id);
    renderDiceHistory();
}

function clearDiceHistory() {
    if(confirm("Apagar todo o histórico de rolagens?")) {
        diceHistory = [];
        renderDiceHistory();
    }
}

// VTT CHAT
function sendChatMessage() {
    if(chatLocked && !isVttGM) {
        alert("O Mestre bloqueou o chat.");
        return;
    }
    const input = document.getElementById('chat-input');
    const msg = input.value.trim();
    if(msg) {
        let sender = "Mestre";
        if(!isVttGM) {
            const me = tablePlayers.find(p => p.isMe);
            sender = me ? me.name : "Jogador";
        }
        addChatMessage(sender, msg, isVttGM ? '#ff00ff' : '#00ffcc');
        input.value = '';
    }
}
function addChatMessage(sender, msg, color) {
    const chat = document.getElementById('chat-messages');
    chat.innerHTML += `<div style="margin-bottom:8px;"><b style="color:${color}">${sender}:</b> <span style="color:#ddd">${msg}</span></div>`;
    chat.scrollTop = chat.scrollHeight;
}
function toggleChatLock() {
    chatLocked = !chatLocked;
    const btn = document.getElementById('btn-lock-chat');
    btn.innerText = chatLocked ? '🔏' : '🔓';
    addChatMessage('Sistema', chatLocked ? 'O chat foi bloqueado pelo Mestre.' : 'O chat foi liberado.', '#ff3333');
}

// VTT GALLERY
function addCampGalleryImage(e) {
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
        const container = document.getElementById('camp-gallery-container');
        container.innerHTML += `
            <div class="gallery-thumb">
                <img src="${evt.target.result}" onclick="viewFullscreen(this.src)">
                ${isVttGM ? `<button class="delete-btn hide-on-view" onclick="this.parentElement.remove()">X</button>` : ''}
            </div>`;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
}
