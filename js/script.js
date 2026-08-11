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
const CURRENT_USER_SESSION_KEY = 'mundosSombriosCurrentUserId';

function saveCurrentUserSession() {
    if (currentUser && currentUser.id) {
        localStorage.setItem(CURRENT_USER_SESSION_KEY, currentUser.id);
    } else {
        localStorage.removeItem(CURRENT_USER_SESSION_KEY);
    }
}

function restoreCurrentUserSession() {
    const userId = localStorage.getItem(CURRENT_USER_SESSION_KEY);
    if (!userId) return false;

    const account = usersDB.find(u => u.id === userId);
    if (!account) {
        localStorage.removeItem(CURRENT_USER_SESSION_KEY);
        return false;
    }

    currentUser = account;
    document.getElementById('display-username').innerText = currentUser.username;

    const emblem = document.getElementById('master-emblem');
    if (currentUser.role === 'mestre' || currentUser.role === 'admin') {
        emblem.style.display = 'block';
        if (typeof makeDraggable === 'function') makeDraggable(emblem, emblem, false);
    } else {
        emblem.style.display = 'none';
    }

    document.getElementById('btn-admin-panel').style.display = currentUser.role === 'admin' ? 'block' : 'none';
    document.getElementById('tab-btn-gm').style.display = (currentUser.role === 'mestre' || currentUser.role === 'admin') ? 'inline-block' : 'none';

    loadUserData();
    if (currentUser.role === 'admin' && typeof renderAdminRequestsWindows === 'function') {
        renderAdminRequestsWindows();
    }

    return true;
}

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
let currentMode = '';
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
let currentSheetEquipment = [];
let selectedVttEquipmentCharId = null;

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

        saveCurrentUserSession();
        showScreen('screen-mode-select');
    } else {
        alert("Entidade não reconhecida ou senha incorreta no Vazio.");
    }
}

function doLogout() {
    if(confirm("Deseja desconectar do Vazio?")) {
        currentUser = null;
        saveCurrentUserSession();
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
    if(nature.includes("Nexo Padrão")) layout.classList.add('theme-exodo-padrao');
    else if(nature.includes("Arquiteto")) layout.classList.add('theme-arquiteto');
    else if(nature.includes("Operador")) layout.classList.add('theme-operador');
    else if(nature.includes("Classer") || nature.includes("Herdada")) layout.classList.add('theme-exodo-classer');
    else if(nature.includes("Carreira")) layout.classList.add('theme-ocultatun-carreira');
    else if(nature.includes("Designado")) layout.classList.add('theme-ocultatun-designado');
    else if(nature.includes("Envolto")) layout.classList.add('theme-ocultatun-envolto');
    else if(nature.includes("Ordem")) layout.classList.add('theme-ocultatun-ordem');
}

// NAVIGATION
function showScreen(id) {
    const target = document.getElementById(id);
    if(!target) {
        console.error('[Mundos Sombrios] Tela não encontrada:', id);
        return false;
    }
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active', 'overlay'));
    target.classList.add('active');
    
    if(id === 'screen-char-select') {
        isEditMode = true; 
        if(typeof renderCharList === 'function') renderCharList();
        if(currentUser) document.getElementById('sanctuary-limits').innerText = `Almas Vivas: ${characters.length} / ${currentUser.role === 'jogador' ? 5 : 10}`;
    }
    if(id === 'screen-ancoragem' && typeof renderAncoragem === 'function') {
        renderAncoragem();
    }
    return true;
}

function selectGameMode(mode) {
    if (mode !== 'exodo' && mode !== 'ocultatun') {
        console.error('[Mundos Sombrios] Modo inválido selecionado:', mode);
        alert('Modo de jogo inválido. Escolha Êxodo ou Ocultatun.');
        return false;
    }
    selectedGameMode = mode;
    currentMode = mode;
    try { sessionStorage.setItem('mundosSombriosSelectedMode', mode); } catch(e) {}
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
    // Entrada robusta: o botão não depende de estados residuais da sessão ou da ficha anterior.
    if(!currentUser) {
        alert('A sessão do Santuário expirou. Entre novamente no Vazio.');
        showScreen('screen-login');
        return false;
    }
    const mode = (selectedGameMode === 'exodo' || selectedGameMode === 'ocultatun')
        ? selectedGameMode : (document.getElementById('char-mode')?.value || '');
    if(!mode || !ruleset[mode]) {
        alert('Escolha primeiro o modo de jogo: Êxodo ou Ocultatun.');
        showScreen('screen-mode-select');
        return false;
    }
    const LIMIT = currentUser.role === 'jogador' ? 5 : 10;
    if(!Array.isArray(characters)) characters = [];
    if(characters.length >= LIMIT) {
        alert(`O limite de ${LIMIT} almas forjadas foi atingido.`);
        return false;
    }
    const requiredIds = ['char-form','char-name','nature-grid','class-container','specific-content-container'];
    const missing = requiredIds.filter(id => !document.getElementById(id));
    if(missing.length) {
        console.error('[Mundos Sombrios] Elementos ausentes no construtor:', missing);
        alert('Não foi possível abrir a criação de ficha porque a janela está incompleta. Recarregue o site.');
        return false;
    }

    editingIndex = null;
    currentAvatarBase64 = '';
    currentGallery = [];
    currentPowerDraft = [];
    currentSheetEquipment = [];
    isEditMode = true;

    document.getElementById('char-form').reset();
    document.getElementById('char-name').value = '';
    document.querySelectorAll('.attr-input').forEach(el => el.value = '0');
    document.getElementById('pts-count').value = '0';
    document.querySelectorAll('.res-val-input').forEach(el => el.value = '');
    document.getElementById('avatar-preview-container').innerHTML = '<span style="color:#666; font-size:0.8rem;">Nenhum retrato</span>';
    document.getElementById('gallery-container').innerHTML = '';
    document.getElementById('skills-list').innerHTML = '';
    document.getElementById('powers-list').innerHTML = '';
    renderEquipmentSheet();
    document.getElementById('specific-content-container').innerHTML = '';
    currentUnlockedNodes = [];
    if(document.getElementById('tree-unlocked-data')) document.getElementById('tree-unlocked-data').value = '';

    selectedGameMode = mode;
    populateSelects(mode);
    if(!startBuilder(mode)) return false;
    toggleEditUI();
    return true;
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
    if(mode !== 'exodo' && mode !== 'ocultatun' || !ruleset[mode]) {
        console.error('[Mundos Sombrios] Modo inválido ao abrir o construtor:', mode);
        return false;
    }
    currentMode = mode;
    const modeInput = document.getElementById('char-mode');
    if(!modeInput) return false;
    modeInput.value = mode;
    const natureGrid = document.getElementById('nature-grid');
    if(!natureGrid) return false;
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
    return true;
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
        
        if(natureName === 'O Envolto (Horror Cósmico)' || natureName === 'Classer (Linhagem Herdada)') {
             buildSkillTreeUI(natureName);
        } else {
             document.getElementById('specific-content-container').innerHTML = natureData.tabHtml;
        }
    }
    
    updatePowerSelects(currentNature);
    applyEquipmentProfile({mode:currentMode,nature:currentNature,name:document.getElementById('char-name')?.value||''});
    renderEquipmentSheet();
    recalculateStats();
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
            let baseVig = (vig < 0) ? (vig * 10) + 10 : (vig * 10) + 10;
            if(baseVig < 5) baseVig = 5;
            
            if(currentClass === "Carrasco Cinzento") val = (vig * 10) + 15;
            else if(currentClass === "Esotérico") val = (vig * 10) + 12;
            else val = baseVig;
            if(val < 5) val = 5;
        }
        else if(type.includes("EP") || type.includes("Energia") || type.includes("EE")) {
            if(currentClass === "Hermético") val = 0;
            else if(currentClass === "Esotérico") val = (int * 5) + 15;
            else if(currentNature.includes("Designado") || currentNature.includes("Envolto") || currentNature.includes("Taumatúrgico")) {
                val = (Math.max(int, pre) * 5) + 15;
            }
            else val = 0;
        }
        else if(type.includes("EB") || type.includes("Estamina")) {
            if(currentNature.includes("Carreira") || currentClass.includes("Mercador")) {
                val = 6 + vig;
            } else {
                val = (vig * 3) + 5;
            }
        }
        else if(type.includes("Ameaça")) {
            val = vig + 3;
        }
        else if(type.includes("DS") || type.includes("ES") || type.includes("Síntese")) {
            val = 8 + int + pre + 1;
        }
        else if(type.includes("CO") || type.includes("Decadência") || type.includes("Assimilação")) val = 0; 
        else if(type.includes("LHL")) val = 75; 
        else val = "-"; 
        
        inp.placeholder = "Base: " + val;
        
        if(isEditMode) {
             inp.value = val !== "-" ? val : "";
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
    
    document.querySelectorAll('#char-form input[type="text"], #char-form input[type="number"], #char-form textarea').forEach(el => {
        if(!isEditMode) el.setAttribute('readonly', true);
        else el.removeAttribute('readonly');
    });

    document.querySelectorAll('.choice-card').forEach(el => {
        el.style.pointerEvents = isEditMode ? 'auto' : 'none';
        if (isEditMode) {
            el.classList.remove('locked');
        } else {
            el.classList.add('locked');
        }
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
    if(!container) return;
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

function closeFullscreen() {
    document.getElementById('fs-modal').style.display = 'none';
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

    if (restoreCurrentUserSession()) {
        showScreen('screen-mode-select');
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
        equipment: currentSheetEquipment,
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
    if (!char) return false;
    const inVTT = document.getElementById('screen-vtt')?.classList.contains('active');
    const isOwnVTT = inVTT && !!char.isMe;
    const isOtherPlayerVTT = inVTT && !isVttGM && !isOwnVTT;
    if (inVTT) restrictToIdentity = isOtherPlayerVTT;
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

    currentSheetEquipment = Array.isArray(char.equipment) ? JSON.parse(JSON.stringify(char.equipment)) : [];
    renderEquipmentSheet();

    // Restrictions
    if(restrictToIdentity) {
        document.getElementById('btn-tab-stats').style.display = 'none';
        document.getElementById('btn-tab-skills').style.display = 'none';
        document.getElementById('btn-tab-powers').style.display = 'none';
        document.getElementById('btn-tab-equipment').style.display = 'none';
        isEditMode = false;
        document.getElementById('btn-toggle-edit').style.display = 'none';
        document.getElementById('upload-avatar-group').style.display = 'none';
        document.getElementById('upload-gallery-group').style.display = 'none';
        document.getElementById('btn-final-save').style.display = 'none';
    } else {
        document.getElementById('btn-tab-stats').style.display = '';
        document.getElementById('btn-tab-skills').style.display = '';
        document.getElementById('btn-tab-powers').style.display = '';
        document.getElementById('btn-tab-equipment').style.display = '';
        
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
        
        let cName = char.className || 'default';
        let safeSlug = cName.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        let iconColorClass = "icon-" + safeSlug;

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


// ==========================================
// ARSENAL / DISPOSITIVOS & EQUIPAMENTOS
// ==========================================
const PREMADE_EQUIPMENT = [
 {name:'Pistola “NULO”', faction:'ALFA-01 — Os Ceifadores', category:'Ritualístico', chassis:'Ligeiro', pe:6, stage:2, charges:null, effect:'Base 1d6. VF Silenciamento: sem estampido convencional; identificação da origem -5. VF Marca Fantasma: 1 Pressão para marcar alvo; +2 para rastreá-lo até fim da cena.'},
 {name:'Kit de Apagamento', faction:'ALFA-01 — Os Ceifadores', category:'Ritualístico', chassis:'Utilitário', pe:7, stage:2, effect:'Apaga digitais, sangue, resíduos de EP, registros eletrônicos simples e evidências de presença.'},
 {name:'Rifle Predador', faction:'SIGMA-33 — Os Predadores', category:'Ritualístico', chassis:'Padrão', pe:16, stage:3, effect:'Base 1d10. VF Munição de Linhagem: +2 dano contra criaturas anômalas. VF Rompe-Regeneração: alvo com regeneração perde regeneração até próximo turno.'},
 {name:'Kit de Caça Anômala', faction:'SIGMA-33 — Os Predadores', category:'Ritualístico', chassis:'Utilitário', pe:7, stage:2, effect:'+2 em Investigação e Sobrevivência para rastrear criaturas anômalas.'},
 {name:'Escopeta Exorcista', faction:'ECTA-44 — Os Últimos Caçadores', category:'Ritualístico', chassis:'Massivo', pe:14, stage:3, effect:'Base 1d12. VF Cinza Consagrada: +2 dano contra entidades infernais. VF Quebra-Pacto: acerto reduz em 2 resistência espiritual até próximo turno.'},
 {name:'Selo de Ruptura', faction:'ECTA-44 — Os Últimos Caçadores', category:'Ritualístico', chassis:'Utilitário', pe:7, stage:2, effect:'Bloqueia possessão, invocação, teleporte infernal ou fuga planar menor.'},
 {name:'Rifle de Fase', faction:'C-137 — Os Desbravadores do Além', category:'Anômalo', chassis:'Padrão', pe:23, stage:4, effect:'Base 1d10. Ativação: 1d4 Mental ou -5 PV. VF Penetração Dimensional: ignora cobertura física comum. VF Fase Instável: alvo -2 Defesa Passiva contra próximo ataque.'},
 {name:'Âncora Temporal', faction:'C-137 — Os Desbravadores do Além', category:'Anômalo', chassis:'Utilitário', pe:14, stage:3, effect:'Ativação: 1d4 Mental ou -5 PV. Impede teleporte, deslocamento ou arrastamento temporal por 1 rodada.'},
 {name:'Canhão de Estaca', faction:'SIGMA-02 — Os Bate-Estaca', category:'Ritualístico', chassis:'Massivo', pe:19, stage:3, effect:'Base 1d12. VF Perfurador de Colosso: +1 dado de dano contra criaturas Grandes ou superiores. VF Âncora Cinética: acerto reduz deslocamento em 3m.'},
 {name:'Lança-Âncora', faction:'SIGMA-02 — Os Bate-Estaca', category:'Ritualístico', chassis:'Padrão', pe:9, stage:2, effect:'Prende criatura grande a uma estrutura.'},
 {name:'Injetor de Calma', faction:'EPSILON-00 — Mente Sã', category:'Ritualístico', chassis:'Utilitário', pe:7, stage:2, effect:'Remove 1d6 Estresse ou concede +2 Vontade por 1 cena.'},
 {name:'Kit de Lacuna', faction:'EPSILON-00 — Mente Sã', category:'Anômalo', chassis:'Utilitário', pe:14, stage:3, effect:'Ativação: 1d4 Mental ou -5 PV. Permite apagar uma memória específica de baixa complexidade.'},
 {name:'Pistola de Identidade', faction:'DELTA-02 — Olho do Saber', category:'Ritualístico', chassis:'Ligeiro', pe:6, stage:2, effect:'Base 1d6. VF Arma de Serviço: assume aparência de arma pequena mundana. VF Assinatura Limpa: investigação balística -5.'},
 {name:'Máscara Biométrica', faction:'DELTA-02 — Olho do Saber', category:'Anômalo', chassis:'Utilitário', pe:19, stage:3, effect:'Ativação: 1d4 Mental ou -5 PV. +5 para evitar reconhecimento.'},
 {name:'Rifle Funerário', faction:'TÂNATOS-01 — Os Coveiros', category:'Ritualístico', chassis:'Padrão', pe:11, stage:3, effect:'Base 1d10. VF Cinza Terminal: +2 dano contra mortos-vivos. VF Não Retorne: morto-vivo derrotado não pode realizar reanimação simples até fim da cena.'},
 {name:'Caixa de Sepultamento', faction:'TÂNATOS-01 — Os Coveiros', category:'Ritualístico', chassis:'Utilitário', pe:7, stage:2, effect:'Sela restos, objetos ou manifestações menores.'},
 {name:'Maleta de Selagem', faction:'ÔMEGA-01 — O Relicário', category:'Ritualístico', chassis:'Utilitário', pe:9, stage:3, effect:'Pode conter objeto anômalo pequeno, documento, componente, amostra ou artefato de baixa Capacidade.'},
 {name:'Chave do Pináculo', faction:'ÔMEGA-01 — O Relicário', category:'Anômalo', chassis:'Ligeiro', pe:18, stage:3, effect:'Ativação: 1d4 Mental ou -5 PV. Pode abrir acesso para armazenamento da Ocultatun, se o Mestre determinar disponibilidade.'},
 {name:'Lâmina da Agonia Veloz', faction:'Exemplo de Forja', category:'Ritualístico', chassis:'Padrão', pe:11, stage:3, effect:'Espada de oficial da Ocultatun. Causa dano Cap 3; após o combate, corre risco de enferrujar e perder corte.'},
 {name:'O Olho de Vidro do Abismo', faction:'Exemplo de Forja', category:'Anômalo', chassis:'Utilitário', pe:23, stage:5, effect:'Amuleto com cristal de um Nexo que permite ver através de paredes. Ao ativar, usuário perde 5 PV.'}
];

function getEquipmentProfile(char=currentBuilderCharacter()){
    const nature=char?.nature||currentNature||'';
    const inferredMode=(char?.mode)||(nature.includes('Ocultatun')||nature.includes('Envolto')||nature.includes('Ordem dos Sete')?'ocultatun':null)||currentMode||'exodo';
    const mode=inferredMode;
    if(mode==='ocultatun') return {
        mode:'ocultatun', key:'ocultatun', eyebrow:'OCULTATUN · ARSENAL ANÔMALO', title:'Arsenal Anômalo & Ritualístico',
        subtitle:'Itens construídos por Chassi + Vetores de Manifestação + Estágio + Categoria. O item mantém PE, ES e Cargas de Integridade.',
        addTitle:'Registrar equipamento da Ocultatun', addSubtitle:'Use os campos técnicos do sistema PE.',
        labels:['Nome do item','Categoria / tipo','PE · ES · Cargas','Efeito / VF / observações'],
        placeholders:['Lâmina, rifle, dispositivo...','Ritualístico ou Anômalo · Chassi','Ex.: 11 PE · ES 3 · 10 cargas','Descreva Chassi, VM, VF, efeito e particularidades.'],
        fields:'ocultatun'
    };
    if(nature.includes('Operador de Sistema')) return {
        mode:'exodo', key:'kafra', eyebrow:'ÊXODO · PROJETO PLAYER', title:'Repositório Kafra & Dispositivos',
        subtitle:'Inventário de dispositivos vinculados à interface. Registre Smart-Link, PCs, origem e efeito de cada item.',
        addTitle:'Registrar dispositivo Kafra', addSubtitle:'A ficha mantém o inventário separado das Potências.',
        labels:['Nome do dispositivo','Tipo / Smart-Link','PC / vínculo / estado','Efeito / função'],
        placeholders:['Ex.: Faca Fractal','Smart-Link · IA · dispositivo','Ex.: 2 PC · IA Domínios · íntegro','Função, bônus, interface ou observações.'],
        fields:'kafra'
    };
    if(nature.includes('Classer')) return {
        mode:'exodo', key:'linhagem', eyebrow:'ÊXODO · LINHAGEM HERDADA', title:'Equipamento de Campo & Atavismo',
        subtitle:'Registro de equipamento compatível com o Classer, mantendo a evolução da linhagem separada da árvore LHL.',
        addTitle:'Registrar equipamento de campo', addSubtitle:'O item não altera automaticamente LHL ou EB.',
        labels:['Nome do equipamento','Tipo / função','Estado / vínculo','Efeito / observações'],
        placeholders:['Ex.: arma, proteção, ferramenta...','Armamento · proteção · utilitário','Ex.: íntegro · vinculado à linhagem','Descrição do uso e efeitos.'],
        fields:'linhagem'
    };
    return {
        mode:'exodo', key:'exodo', eyebrow:'ÊXODO · DISPOSITIVOS DE CAMPO', title:'Dispositivos & Equipamentos de Êxodo',
        subtitle:'Inventário de campo do Gene Êxodo. Registre o dispositivo, sua função, vínculo e estado sem misturar a economia PE da Ocultatun.',
        addTitle:'Registrar dispositivo de Êxodo', addSubtitle:'CÊ, Assimilação e Estigma continuam sendo recursos da ficha; o item fica no inventário.',
        labels:['Nome do dispositivo','Tipo / função','Vínculo / estado','Efeito / descrição'],
        placeholders:['Ex.: equipamento de campo','Armamento · proteção · ferramenta · dispositivo','Ex.: CÊ · Estigma · íntegro','Descrição do uso, bônus ou limitações.'],
        fields:'exodo'
    };
}
function currentBuilderCharacter(){
    return {mode:currentMode||document.getElementById('char-mode')?.value||'exodo', nature:currentNature||document.getElementById('char-nature')?.value||'', name:document.getElementById('char-name')?.value||''};
}
function applyEquipmentProfile(char=currentBuilderCharacter()){
    const p=getEquipmentProfile(char);
    const set=(id,val)=>{const e=document.getElementById(id);if(e)e.textContent=val;};
    set('equipment-sheet-eyebrow',p.eyebrow); set('equipment-sheet-title',p.title); set('equipment-sheet-subtitle',p.subtitle);
    set('equipment-add-eyebrow',p.eyebrow); set('equipment-add-title',p.addTitle); set('equipment-add-subtitle',p.addSubtitle);
    ['name','type','meta','effect'].forEach((k,i)=>{set('sheet-eq-'+k+'-label',p.labels[i]); const e=document.getElementById('sheet-eq-'+k); if(e)e.placeholder=p.placeholders[i];});
    const profile=document.getElementById('equipment-sheet-profile');
    if(profile) profile.innerHTML=p.key==='ocultatun'
      ? '<span>PE de Arsenal</span><span>Chassi + VM + ES</span><span>Ritualístico / Anômalo</span><span>Cargas de Integridade / Gamma Lock</span>'
      : p.key==='kafra' ? '<span>Smart-Link</span><span>Repositório Kafra</span><span>PC / vínculo de interface</span><span>Dispositivo de sistema</span>'
      : '<span>Dispositivo de campo</span><span>Vínculo e estado</span><span>Função narrativa</span><span>Sem PE/ES de Ocultatun</span>';
    const add=document.getElementById('equipment-add-modal'); if(add) add.dataset.profile=p.key;
}
function renderEquipmentSheet(){
 const c=document.getElementById('equipment-sheet-list'); if(!c)return;
 applyEquipmentProfile(); c.innerHTML='';
 if(!currentSheetEquipment.length){ c.innerHTML='<div class="equipment-empty">Nenhum item registrado nesta ficha.</div>'; return; }
 const p=getEquipmentProfile();
 currentSheetEquipment.forEach((it,i)=>{
   const meta=p.key==='ocultatun'
      ? `<span><b>PE</b>${escHtml(it.pe ?? '—')}</span><span><b>ES</b>${escHtml(it.stage ?? '—')}</span>${it.charges!==null&&it.charges!==undefined?`<span><b>Cargas</b>${escHtml(it.charges)}</span>`:''}`
      : `<span><b>VÍNCULO</b>${escHtml(it.link||it.notes||'—')}</span><span><b>ESTADO</b>${escHtml(it.status||'Íntegro')}</span>`;
   c.innerHTML += `<article class="equipment-item-card ${it.category==='Anômalo'?'anomalous':''} mode-${p.key}"><div class="equipment-item-main"><span class="equipment-tag">${escHtml(it.category||'Equipamento')}</span><h4>${escHtml(it.name)}</h4><p>${escHtml(it.effect||'Sem descrição.')}</p></div><div class="equipment-item-meta">${meta}<button class="hide-on-view equipment-remove" onclick="removeEquipmentFromCurrentSheet(${i})">×</button></div></article>`;
 });
}
function openEquipmentAddModal(){ applyEquipmentProfile(); document.getElementById('equipment-add-modal').style.display='flex'; }
function addEquipmentToCurrentSheet(){
 const p=getEquipmentProfile(); const name=document.getElementById('sheet-eq-name').value.trim(); if(!name)return alert('Dê um nome ao item.');
 const type=document.getElementById('sheet-eq-type').value.trim()||'Equipamento'; const meta=document.getElementById('sheet-eq-meta').value.trim(); const effect=document.getElementById('sheet-eq-effect').value.trim()||'Sem descrição.';
 let item={name,category:type,effect,notes:meta,source:p.mode==='ocultatun'?'Registro manual da Ocultatun':'Registro manual de Êxodo'};
 if(p.key==='ocultatun'){ item.pe='—'; item.stage='—'; item.charges=null; item.notes=meta; }
 else { item.link=meta; item.status='Íntegro'; }
 currentSheetEquipment.push(normalizeEquipment(item)); renderEquipmentSheet(); document.getElementById('equipment-add-modal').style.display='none'; ['sheet-eq-name','sheet-eq-type','sheet-eq-meta','sheet-eq-effect'].forEach(id=>document.getElementById(id).value='');
}
function removeEquipmentFromCurrentSheet(i){ if(!isEditMode)return; currentSheetEquipment.splice(i,1); renderEquipmentSheet(); }
function getVttCharById(id){ return tablePlayers.find(c=>String(c.id)===String(id)); }
function renderVttEquipment(){
 const c=document.getElementById('vtt-equipment-list'); if(!c)return; c.innerHTML='';
 if(!tablePlayers.length){c.innerHTML='<div class="equipment-empty">Nenhuma ficha presente na mesa.</div>';return;}
 tablePlayers.forEach((p,i)=>{ const items=Array.isArray(p.equipment)?p.equipment:[], prof=getEquipmentProfile(p);
   const meta=prof.key==='ocultatun'?'PE · ES · Cargas de Integridade':'Vínculo · Estado · Função';
   c.innerHTML+=`<section class="vtt-player-arsenal mode-${prof.key}"><div class="vtt-player-arsenal-head"><div><span class="eyebrow">${escHtml(prof.eyebrow)}</span><h4>${escHtml(p.name)}</h4><p>${escHtml(meta)}</p></div><button class="souls-btn small-btn" onclick="openCharacterEquipmentFromVtt(${i})">ABRIR FICHA</button></div>${items.length?items.map(it=>`<div class="vtt-eq-row"><div><b>${escHtml(it.name)}</b><span>${escHtml(it.category||'Equipamento')} · ${prof.key==='ocultatun'?`PE ${escHtml(it.pe??'—')} · ES ${escHtml(it.stage??'—')}`:`${escHtml(it.link||'sem vínculo')} · ${escHtml(it.status||'Íntegro')}`}</span></div><p>${escHtml(it.effect||'')}</p></div>`).join(''):'<div class="equipment-empty compact">Sem equipamentos registrados.</div>'}</section>`;
 });
}
function openVttEquipmentWindow(){ renderVttEquipment(); toggleVttWindow('vtt-equipment-window'); }
function openCharacterEquipmentFromVtt(index){ const builder=document.getElementById('screen-builder'); builder.classList.add('overlay'); loadCharacterToBuilder(index,tablePlayers,!isVttGM && !tablePlayers[index].isMe); setTimeout(()=>{applyEquipmentProfile(tablePlayers[index]);openTab('tab-equipment');},30); }

function getTableGameMode(){ const modes=tablePlayers.map(p=>p.mode || ((p.nature||'').includes('Ocultatun')||(p.nature||'').includes('Envolto')||(p.nature||'').includes('Ordem dos Sete')?'ocultatun':'exodo')).filter(Boolean); return modes[0]||currentMode||'ocultatun'; }
function openEquipmentShop(){ renderEquipmentShop(); document.getElementById('equipment-shop-modal').style.display='flex'; }
function closeEquipmentShop(){ document.getElementById('equipment-shop-modal').style.display='none'; }
function renderEquipmentShop(){
 const c=document.getElementById('equipment-shop-list'); if(!c)return; const mode=getTableGameMode();
 const eyebrow=document.getElementById('equipment-shop-eyebrow'), title=document.getElementById('equipment-shop-title'), sub=document.getElementById('equipment-shop-subtitle');
 if(mode!=='ocultatun'){
   if(eyebrow)eyebrow.textContent='ÊXODO · CATÁLOGO DE CAMPO'; if(title)title.textContent='Loja de Dispositivos de Êxodo'; if(sub)sub.textContent='Nenhum catálogo pré-pronto de equipamentos de Êxodo está registrado nesta versão dos arquivos do site.';
   c.innerHTML='<div class="equipment-empty shop-empty">O catálogo pré-pronto disponível nos arquivos atuais é o Arsenal Anômalo/Ritualístico da Ocultatun. A loja de Êxodo permanece separada para não importar regras do sistema PE para este modo.</div>'; return;
 }
 if(eyebrow)eyebrow.textContent='SALA BRANCA · LOJA DO MERCADOR'; if(title)title.textContent='Loja de Arsenal da Ocultatun'; if(sub)sub.textContent='Itens pré-prontos do sistema Chassi + Vetores + Estágio + Categoria.';
 c.innerHTML=PREMADE_EQUIPMENT.map((it,i)=>`<article class="shop-item ${it.category==='Anômalo'?'anomalous':''}"><div><span class="equipment-tag">${escHtml(it.category)}</span><h4>${escHtml(it.name)}</h4><small>${escHtml(it.faction)} · ${escHtml(it.chassis)} · ${it.pe} PE · ES ${it.stage}</small><p>${escHtml(it.effect)}</p></div><button class="souls-btn small-btn" onclick="givePremadeEquipment(${i})">ENTREGAR</button></article>`).join('');
}
function givePremadeEquipment(i){ if(!isVttGM)return; const it=PREMADE_EQUIPMENT[i]; const targets=tablePlayers.filter(p=>!p.isNPC && (p.mode || ((p.nature||'').includes('Ocultatun')||(p.nature||'').includes('Envolto')||(p.nature||'').includes('Ordem dos Sete')?'ocultatun':'exodo'))==='ocultatun'); if(!targets.length)return alert('A loja da Ocultatun só pode entregar itens a uma ficha do modo Ocultatun.'); const names=targets.map((p,idx)=>`${idx+1}. ${p.name}`).join('\n'); const choice=prompt(`Entregar ${it.name} para:\n${names}\n\nDigite o número:`); const n=Number(choice)-1; if(!Number.isInteger(n)||!targets[n])return; const target=targets[n]; target.equipment=Array.isArray(target.equipment)?target.equipment:[]; const item=normalizeEquipment({...it,charges:10+(Number(target.stats?.vig)||0)-Number(it.stage||0),source:'Loja da Ocultatun'}); target.equipment.push(item); syncVttCharacterToOwner(target); renderVttCards(); renderVttEquipment(); renderEquipmentShop(); alert(`${it.name} entregue a ${target.name}.`); }
function syncVttCharacterToOwner(char){ if(!char||char.isNPC)return; const idx=allCharactersDB.findIndex(c=>c.id===char.id); if(idx>=0){ allCharactersDB[idx].equipment=char.equipment; localStorage.setItem('mundosSombriosChars',JSON.stringify(allCharactersDB)); characters=allCharactersDB.filter(c=>c.ownerId===currentUser.id); } }
function openForgeWindow(){
 const mode=getTableGameMode();
 const eyebrow=document.getElementById('forge-eyebrow'), title=document.getElementById('forge-title'), sub=document.getElementById('forge-subtitle');
 const grid=document.getElementById('forge-grid'), msg=document.getElementById('forge-exodo-message'), submit=document.querySelector('#forge-modal .modal-actions .souls-btn');
 if(mode!=='ocultatun') { if(eyebrow)eyebrow.textContent='ÊXODO · FORJA DE DISPOSITIVOS'; if(title)title.textContent='Registro de Dispositivos de Êxodo'; if(sub)sub.textContent='A forja técnica Chassi + VM + ES é exclusiva do sistema de equipamentos da Ocultatun.'; if(grid)grid.style.display='none'; if(msg){msg.style.display='block';msg.innerHTML='<strong>Modo Êxodo</strong><span>Os arquivos atuais não definem aqui uma fórmula de forja equivalente ao sistema PE da Ocultatun. Registre o dispositivo diretamente na janela de equipamentos da ficha para não importar regras entre os modos.</span>';} if(submit)submit.style.display='none'; }
 else { if(eyebrow)eyebrow.textContent='ENGENHARIA DE CONSTRUÇÃO · PE'; if(title)title.textContent='Forja de Itens da Ocultatun'; if(sub)sub.textContent='Chassi + Vetores de Manifestação + Estágio + Categoria.'; if(grid)grid.style.display='grid'; if(msg)msg.style.display='none'; if(submit)submit.style.display=''; }
 populateForgeRecipients(); updateForgeCost(); document.getElementById('forge-modal').style.display='flex';
}
function closeForgeWindow(){ document.getElementById('forge-modal').style.display='none'; }
function populateForgeRecipients(){ const s=document.getElementById('forge-recipient'); s.innerHTML=tablePlayers.filter(p=>!p.isNPC && (getTableGameMode()!=='ocultatun'||(p.mode || ((p.nature||'').includes('Ocultatun')||(p.nature||'').includes('Envolto')||(p.nature||'').includes('Ordem dos Sete')?'ocultatun':'exodo'))==='ocultatun')).map(p=>`<option value="${escHtml(p.id)}">${escHtml(p.name)}</option>`).join(''); if(!s.innerHTML)s.innerHTML='<option value="">Nenhum jogador compatível</option>'; }
function updateForgeCost(){ const ch=document.getElementById('forge-chassis'); const pe=Number(ch?.selectedOptions[0]?.dataset.pe||0); const vm=[...document.getElementById('forge-vectors')?.selectedOptions||[]].length*5; const es=Math.min(10,Math.max(1,Number(document.getElementById('forge-stage')?.value||1))); const cat=document.getElementById('forge-category')?.value; const total=pe+vm+(es*2)+(cat==='Ritualístico'?-5:0); const preview=document.getElementById('forge-preview'); if(preview)preview.innerHTML=`<b>Custo estimado: ${total} PE</b><span>Chassi ${pe} + ${vm} PE em VM + ${es*2} PE em ES ${es} ${cat==='Ritualístico'?'− 5 PE ritualísticos':''}</span>`; }
function forgeItemForTable(){ if(!isVttGM)return; if(getTableGameMode()!=='ocultatun')return alert('A forja técnica Chassi + VM + ES desta janela pertence ao sistema de equipamentos da Ocultatun. Para Êxodo, registre o dispositivo na ficha sem importar PE/ES.'); const name=document.getElementById('forge-name').value.trim(), recipientId=document.getElementById('forge-recipient').value, target=getVttCharById(recipientId); if(!name||!target)return alert('Defina nome e destinatário.'); const chassis=document.getElementById('forge-chassis').value, category=document.getElementById('forge-category').value, stage=Math.min(10,Math.max(1,Number(document.getElementById('forge-stage').value||1))), vectors=[...document.getElementById('forge-vectors').selectedOptions].map(o=>o.value), base={Ligeiro:2,Padrão:5,Massivo:8,Proteção:4,Utilitário:3}[chassis], pe=base+vectors.length*5+stage*2+(category==='Ritualístico'?-5:0), charges=10+(Number(target.stats?.vig)||0)-stage, item=normalizeEquipment({name,category,chassis,stage,pe,charges,vectors,effect:document.getElementById('forge-effect').value.trim(),source:'Forja da Mesa'}); target.equipment=Array.isArray(target.equipment)?target.equipment:[]; target.equipment.push(item); syncVttCharacterToOwner(target); currentTableData=currentTableData||{}; currentTableData.forgedItems=Array.isArray(currentTableData.forgedItems)?currentTableData.forgedItems:[]; currentTableData.forgedItems.push(item); renderVttCards(); renderVttEquipment(); closeForgeWindow(); alert(`${name} foi forjado e entregue a ${target.name}.`); }

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
        tablePlayers.push({ id: 1, name: 'Jogador (Teste)', nature: 'Nexo Padrão', className: 'Combatente', resources: {PV: 15}, equipment: [], isMe: false });
        tablePlayers.push({ id: 2, name: 'Goblin Abissal', nature: 'Agente Designado (Ocultatun)', className: 'NPC', resources: {PV: 20}, equipment: [], isMe: false, isNPC: true });
    } else {
        document.getElementById('btn-save-table').style.display = 'none';
        const jTable = joinedTables.find(t => t.code === tableIdOrCode);
        document.getElementById('vtt-table-name').innerText = jTable ? jTable.name : ("Conectado: " + tableIdOrCode);
        
        if(myVttCharIndex !== -1 && characters[myVttCharIndex]) {
            let myChar = JSON.parse(JSON.stringify(characters[myVttCharIndex]));
            myChar.equipment = Array.isArray(myChar.equipment) ? myChar.equipment : [];
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
    makeDraggable(document.getElementById('vtt-equipment-window'), document.getElementById('equipment-window-header'), false); 
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
                <button type="button" class="vtt-card-eq-btn" onclick="event.stopPropagation(); openCharacterEquipmentFromVtt(${index})">⚙ Arsenal</button>
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

document.addEventListener('DOMContentLoaded', () => {
    const attrs = ['for', 'vig', 'agi', 'int', 'prn', 'pre'];
    attrs.forEach(a => {
        const el = document.getElementById('attr-' + a);
        if(el) el.addEventListener('input', recalculateStats);
    });
});

const tierData = {
    'O Envolto (Horror Cósmico)': [
        {
            tier: 1, name: 'I. Despertar', options: [
                { id: 'e1_1', name: 'A Quimera', desc: 'Abre sua percepção para a anti-existência. Visão no escuro anômala.' },
                { id: 'e1_2', name: 'O Véu/Fenda', desc: 'Permite interagir com objetos etéreos e atravessar frestas.' },
                { id: 'e1_3', name: 'O Paradoxo', desc: 'Confunde o tempo local. +2 em Iniciativa e Reflexos.' }
            ]
        },
        {
            tier: 2, name: 'II. Aprofundamento', options: [
                { id: 'e2_1', name: 'O Colapso', desc: 'Ataques causam necrose instantânea (+1d6 Dano Entrópico).' },
                { id: 'e2_2', name: 'A Ressonância', desc: 'Vozes ancestrais aterrorizam inimigos próximos.' },
                { id: 'e2_3', name: 'A Anomalia', desc: 'Seu corpo ignora o primeiro ataque físico recebido por cena.' },
                { id: 'e2_4', name: 'A Inércia', desc: 'Reduz o deslocamento de inimigos em 3m num raio de 9m.' }
            ]
        },
        {
            tier: 3, name: 'III. Ruptura', options: [
                { id: 'e3_1', name: 'O Sangue Negro', desc: 'Sangue corrosivo. Atacantes sofrem 1d4 de dano corpo-a-corpo.' },
                { id: 'e3_2', name: 'Oblívio', desc: 'Apaga temporariamente memórias de um alvo.' },
                { id: 'e3_3', name: 'A Emanação', desc: 'Pode projetar sua consciência intangível até 18m.' },
                { id: 'e3_4', name: 'A Entropia', desc: 'Estruturas e materiais mundanos apodrecem ao seu toque.' }
            ]
        },
        {
            tier: 4, name: 'IV. O Abismo', options: [
                { id: 'e4_1', name: 'A Gravidade', desc: 'Controle de massa. Pode flutuar e andar nas paredes.' },
                { id: 'e4_2', name: 'O Vértice', desc: 'Ponto focal da anti-existência. Pode conjurar um buraco negro anômalo.' }
            ]
        }
    ],
    'Classer (Linhagem Herdada)': [
        {
            tier: 1, name: 'I. Mutação Primária', options: [
                { id: 'c1_1', name: 'Adaptação Extrema', desc: 'Seu DNA é reescrito. Imune a doenças e venenos comuns.' },
                { id: 'c1_2', name: 'Aeternus Vitalis', desc: 'Regeneração celular brutal. Recupera 2 PV por rodada ativo.' },
                { id: 'c1_3', name: 'Velocitus Bellator', desc: 'Reflexos predatórios. Ganha +3 metros de Deslocamento Base.' }
            ]
        },
        {
            tier: 2, name: 'II. Adaptação Celular', options: [
                { id: 'c2_1', name: 'Resiliência Instintiva', desc: 'Seus ossos densificam. +2 Defesa Passiva Natural.' },
                { id: 'c2_2', name: 'Sangue Fervente', desc: 'Cura PV com base em dano sofrido no mesmo turno.' },
                { id: 'c2_3', name: 'Mentis Aurorae', desc: 'Expansão neural. Percebe o mundo em câmera lenta (+5 Prontidão).' }
            ]
        },
        {
            tier: 3, name: 'III. Evolução Forçada', options: [
                { id: 'c3_1', name: 'Predador Perfeito', desc: 'Ataques corpo-a-corpo recebem Margem de Crítico +1.' },
                { id: 'c3_2', name: 'Reconstrução', desc: 'Pode recolocar membros decepados em campo.' },
                { id: 'c3_3', name: 'Força Titânica', desc: 'Sua capacidade de carga e dano de impacto dobram.' }
            ]
        },
        {
            tier: 4, name: 'IV. O Ápice', options: [
                { id: 'c4_1', name: 'Visão Preditiva', desc: 'Anula penalidades de ataque surpresa ou flanqueamento.' },
                { id: 'c4_2', name: 'Ápice Genético', desc: 'Ultrapassa o teto biológico para testes heroicos.' }
            ]
        }
    ]
};

let currentUnlockedNodes = [];

function buildSkillTreeUI(nature) {
    const container = document.getElementById('specific-content-container');
    if(!advancedTreeData[nature]) {
        const natureData = ruleset[currentMode].natures[nature];
        if(natureData && natureData.tabHtml) { container.innerHTML = natureData.tabHtml; }
        return;
    }

    const isEnvolto = nature === 'O Envolto (Horror Cósmico)';
    if(isEnvolto){
        container.innerHTML = `
            <section id="ef-space-final" class="ef-space-final" aria-label="Espaço Final do Envolto">
                <header class="ef-header">
                    <div class="ef-seal" aria-hidden="true">∅</div>
                    <div class="ef-heading">
                        <span class="ef-kicker">OCULTATUN · O ENVOLTO</span>
                        <h2>ESPAÇO FINAL</h2>
                        <p>Registro de Potências. Cada ramificação é uma deformação progressiva da casca.</p>
                    </div>
                    <div class="ef-progress"><span>DESPERTOS</span><strong id="ef-progress-value">0 / 39</strong></div>
                </header>
                <div class="ef-view-controls" role="toolbar" aria-label="Controles de visualização da Skill Tree">
                    <button type="button" id="ef-fit-tree" class="ef-view-btn">⛶ VER ÁRVORE COMPLETA</button>
                    <button type="button" id="ef-zoom-out" class="ef-view-btn" aria-label="Diminuir zoom">−</button>
                    <output id="ef-zoom-value" class="ef-zoom-value">100%</output>
                    <button type="button" id="ef-zoom-in" class="ef-view-btn" aria-label="Aumentar zoom">+</button>
                </div>
                <div class="ef-main">
                    <div class="ef-tree-frame">
                        <div class="ef-paper-noise" aria-hidden="true"></div>
                        <div class="ef-infection" aria-hidden="true"><span></span><i></i><b></b></div>
                        <div id="tree-scroll-wrapper" class="ef-tree-scroll">
                            <svg id="tree-svg" class="ef-svg" aria-hidden="true"></svg>
                            <div id="tree-nodes" class="ef-nodes"></div>
                        </div>
                        <div class="ef-frame-note">OS 13 RASGOS DA CASCA · ARRASTE O FUNDO PARA MOVER A ÁRVORE</div>
                    </div>
                    <aside class="ef-info">
                        <div class="ef-info-label">ANOTAÇÃO DE CAMPO</div>
                        <div id="tree-node-info" class="ef-info-body">Selecione uma árvore ou um nodo para revelar custo, efeito e progressão.</div>
                        <input type="hidden" id="tree-unlocked-data" value="">
                    </aside>
                </div>
            </section>`;
        setTimeout(() => renderTree(nature), 50);
        return;
    }

    let html = `
        <h3 style="color:var(--theme-color); font-family: 'Cinzel', serif; margin-bottom: 10px; text-align:center;">Tabelas de Potência e Mutação</h3>
        <p style="color:#aaa; font-size:0.85rem; text-align:center; margin-bottom:15px;">Selecione os Nodos Iniciais (Tabelas) para visualizar as opções e ramificar suas Habilidades.</p>
        <div class="tree-ui-container envolto-skilltree-window" style="height:860px; overflow:auto; border:1px solid #333; position:relative; background:rgba(0,0,0,0.6);">
            <div id="tree-scroll-wrapper" style="position:relative; height:100%; min-width:100%;">
                <svg class="tree-svg" id="tree-svg" style="position:absolute; top:0; left:0; width:100%; height:100%; pointer-events:none;"></svg>
                <div class="tree-nodes" id="tree-nodes" style="position:absolute; top:0; left:0; width:100%; height:100%;"></div>
            </div>
        </div>
        <div id="tree-node-info" class="desc-box envolto-table-info" style="margin-top:15px; min-height:150px; text-align:left;">Selecione uma Tabela (Nodo Raiz) para iniciar.</div>
        <input type="hidden" id="tree-unlocked-data" value="">
        <input type="hidden" id="ef-table-layout-data" value="{}">
        <input type="hidden" id="ef-tree-layout-version" value="31">
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
    
    const tiers = tierData[nature];
    if(!tiers) return;

    if(editingIndex !== null && characters[editingIndex] && characters[editingIndex].specificData && characters[editingIndex].specificData['tree-unlocked-data']) {
        try { currentUnlockedNodes = JSON.parse(characters[editingIndex].specificData['tree-unlocked-data']); } catch(e){}
    } else {
        const savedDataEl = document.getElementById('spec-tree-unlocks');
        if(savedDataEl && savedDataEl.value) {
            try { currentUnlockedNodes = JSON.parse(savedDataEl.value); } catch(e){}
        } else if (!currentUnlockedNodes.length) {
            currentUnlockedNodes = [];
        }
    }
    document.getElementById('tree-unlocked-data').value = JSON.stringify(currentUnlockedNodes);

    const spacingX = 100 / (tiers.length + 1);
    
    tiers.forEach((t, i) => {
        const x = spacingX * (i + 1);
        const y = 50; 
        
        let selectedOpt = null;
        t.options.forEach(opt => {
            if(currentUnlockedNodes.includes(opt.id)) selectedOpt = opt;
        });

        if(i < tiers.length - 1) {
            const nextX = spacingX * (i + 2);
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', x + '%');
            line.setAttribute('y1', y + '%');
            line.setAttribute('x2', nextX + '%');
            line.setAttribute('y2', y + '%');
            line.setAttribute('class', 'tree-line');
            if(selectedOpt) line.classList.add('unlocked');
            svgContainer.appendChild(line);
        }

        const div = document.createElement('div');
        div.className = 'tree-node';
        if(selectedOpt) div.classList.add('unlocked');
        
        div.style.left = x + '%';
        div.style.top = y + '%';
        
        let labelText = selectedOpt ? selectedOpt.name : t.name;
        let iconText = selectedOpt ? selectedOpt.name.substring(0,2).toUpperCase() : "T" + t.tier;

        div.innerHTML = `<span>${iconText}</span><div class="tree-node-label">${labelText}</div>`;
        
        div.onclick = () => handleTierClick(t, i, selectedOpt, nature);
        nodesContainer.appendChild(div);
    });
}

function handleTierClick(tierObj, index, selectedOpt, nature) {
    const infoBox = document.getElementById('tree-node-info');
    
    let isLocked = false;
    if(index > 0) {
        const prevTier = tierData[nature][index - 1];
        const hasPrev = prevTier.options.some(o => currentUnlockedNodes.includes(o.id));
        if(!hasPrev) isLocked = true;
    }

    if(isLocked) {
        infoBox.innerHTML = `<strong style="color:red; font-size:1.2rem;">[BLOQUEADO] ${tierObj.name}</strong><br><br><span style="color:#aaa;">Desbloqueie e selecione uma ramificação no Tier anterior primeiro para avançar na sua evolução.</span>`;
        return;
    }

    let html = `<strong style="font-size:1.1rem; color:var(--theme-color);">${tierObj.name}</strong> - Escolha sua Ramificação:<br><div style="display:flex; flex-wrap:wrap; gap:10px; justify-content:center; margin-top:10px;">`;
    
    tierObj.options.forEach(opt => {
        const isSelected = currentUnlockedNodes.includes(opt.id);
        const btnColor = isSelected ? '#a8ff00' : 'var(--theme-color)';
        const borderStyle = isSelected ? `border-color:#a8ff00; box-shadow:0 0 10px #a8ff00 inset; background:rgba(168,255,0,0.1);` : `border-color:#555;`;
        
        if(isEditMode) {
            html += `<div class="choice-card" style="padding:10px; width:45%; ${borderStyle}" onclick="selectTierOption('${opt.id}', ${index}, '${nature}')">
                        <h4 style="color:${btnColor}; font-size:0.9rem;">${opt.name}</h4>
                        <p style="font-size:0.75rem;">${opt.desc}</p>
                     </div>`;
        } else {
             if(isSelected) {
                 html += `<div class="choice-card active" style="padding:10px; width:45%;">
                            <h4>${opt.name}</h4>
                            <p style="font-size:0.75rem;">${opt.desc}</p>
                          </div>`;
             }
        }
    });

    html += `</div>`;
    if(selectedOpt && isEditMode) {
        html += `<button type="button" class="souls-btn small-btn" style="margin-top:15px; border-color:red; color:red;" onclick="relockTier(${index}, '${nature}')">Desfazer Ramificação</button>`;
    }
    
    infoBox.innerHTML = html;
}

function selectTierOption(optId, tierIndex, nature) {
    if(!isEditMode) return;
    
    const tierObj = tierData[nature][tierIndex];
    tierObj.options.forEach(o => {
        currentUnlockedNodes = currentUnlockedNodes.filter(id => id !== o.id);
    });

    currentUnlockedNodes.push(optId);
    
    for(let i = tierIndex + 1; i < tierData[nature].length; i++) {
        tierData[nature][i].options.forEach(o => {
            currentUnlockedNodes = currentUnlockedNodes.filter(id => id !== o.id);
        });
    }

    document.getElementById('tree-unlocked-data').value = JSON.stringify(currentUnlockedNodes);
    renderTree(nature);
    
    const selOpt = tierObj.options.find(o => o.id === optId);
    handleTierClick(tierObj, tierIndex, selOpt, nature);
}

function relockTier(tierIndex, nature) {
    if(!isEditMode) return;
    
    for(let i = tierIndex; i < tierData[nature].length; i++) {
        tierData[nature][i].options.forEach(o => {
            currentUnlockedNodes = currentUnlockedNodes.filter(id => id !== o.id);
        });
    }
    
    document.getElementById('tree-unlocked-data').value = JSON.stringify(currentUnlockedNodes);
    renderTree(nature);
    handleTierClick(tierData[nature][tierIndex], tierIndex, null, nature);
}const advancedTreeData = {
    'O Envolto (Horror Cósmico)': [
        {
            treeId: 'colapso',
            name: 'ÁRVORE 1: O COLAPSO (Potência Destrutiva)',
            desc: 'O apagamento puro. Não é dano físico, é a remoção da matéria da equação existencial.\nFoco de Build: DPS extremo, críticos automáticos, destruição de armaduras.\nInterconexão (Pré-requisitos Externos): Para acessar o Tier 3 do Colapso, o usuário precisa possuir pelo menos o Tier 1 da Árvore de Oblívio.',
            tiers: {
                1: [
                    { id: 'col1', cap: 1, name: 'Dano Singular', effect: 'Causa 1d6 de Dano Ontológico (ignora RD física). Alcance de Toque.', cost: 2, example: 'Um soco onde a mão do Arauto atravessa a densidade da armadura inimiga.' },
                    { id: 'col2', cap: 2, name: 'Dano Brutal', effect: 'Causa 2d6 de Dano. Acertos Críticos tem uma redução de crítico natural de 18-20 no dado.', cost: 4, example: 'Uma rajada de estática negra projetada das palmas das mãos.' },
                    { id: 'col3', cap: 3, name: 'Estilhaço Constante', effect: 'Causa 3d6. O alvo sofre 1d4 de Dano contínuo por 2 rodadas, crítico de todos os ataques sobe para 3% durante o uso da capacidade.', cost: 6, example: 'O sangue do inimigo entra em ebulição fria, corroendo as veias por dentro.' }
                ],
                2: [
                    { id: 'col4', cap: 4, name: 'Cone de Negação', effect: 'Causa 4d6 de Dano. Passa a ser em Área (Cone 9m). Teste de Reflexos divide, reduz crítico natural em -2.', cost: 12, example: 'Um grito silencioso que desintegra portas e a pele de quem estiver à frente.' },
                    { id: 'col5', cap: 5, name: 'Fratura Perfurante', effect: 'Causa 5d6. Qualquer acerto reduz a Defesa Passiva do alvo em -2 permanentemente até a cura e alimenta o dano crítico em 7%.', cost: 15, example: 'Lâminas feitas do próprio Espaço Final que mutilam não só o corpo, mas o instinto de esquiva.' },
                    { id: 'col6', cap: 6, name: 'Aniquilação Seletiva', effect: 'Causa 6d6. O usuário pode escolher quem não recebe dano dentro de uma área de explosão de 6m reduzindo o crítico natural em -3.', cost: 18, example: 'Uma chuva de cinzas geométricas que queima cultistas, mas ignora aliados no centro.' }
                ],
                3: [
                    { id: 'col7', cap: 7, name: 'Ruptura de Casca', effect: 'Causa 7d8. Inimigos que sofram dano perdem a capacidade de cura/regeneração por 1 cena, aumentando dano crítico em 13%.', cost: 35, example: 'Um feixe ocular que cauteriza as células em uma frequência impossível.' },
                    { id: 'col8', cap: 8, name: 'Colapso Atômico', effect: 'Causa 8d10. Inimigos reduzidos a 0 PV são apagados da existência (não deixam corpo ou itens) reduzindo o crítico natural em -5.', cost: 40, example: 'O usuário toca no peito do alvo, e ele simplesmente deixa de ter acontecido.' },
                    { id: 'col9', cap: 9, name: 'Falha Crítica do Universo', effect: 'Causa 10d10. Alcance visual. CD +5 para resistir, com aumento de dano crítico em 30%.', cost: 45, example: 'Um buraco negro do tamanho de uma moeda invocado dentro do crânio do alvo.' },
                    { id: 'col10', cap: 10, name: 'DECRETO DO ELDER', effect: 'Causa 15d10. Dano Irresistível. O usuário ganha 10 Pontos de Corrupção Ontológica instantâneos, aumentando o dano crítico em 50%.', cost: 50, example: 'O Céu se abre. A gravidade esmaga o alvo transformando-o em uma poça de antimatéria.' }
                ]
            }
        },
        {
            treeId: 'quimera',
            name: 'ÁRVORE 2: A QUIMERA (Mutação)',
            desc: 'Moldar a própria carne (ou a dos outros) ignorando a biologia evolutiva.\nFoco de Build: Tanking, Adaptação, Sobrevivência, Alteração de Status.\nInterconexão: Para liberar o Tier 2 de Quimera, exige-se o Tier 1 de Anomalia (Criação).',
            tiers: {
                1: [
                    { id: 'qui1', cap: 1, name: 'Endurecimento Aberrante', effect: '+2 na Defesa Passiva e RD 2. Dura 3 rodadas.', cost: 2, example: 'A pele adquire a textura de basalto que chora sangue negro.' },
                    { id: 'qui2', cap: 2, name: 'Anatomia Improvisada', effect: 'O usuário ganha deslocamento alternativo (Ex: Escalar paredes em velocidade normal ou guelras).', cost: 4, example: 'Dedos se alongam em ganchos ósseos; fendas se abrem no pescoço para respirar miasma.' },
                    { id: 'qui3', cap: 3, name: 'Armamento Carnal', effect: 'O corpo gera uma Arma Natural. Causa Dano equivalente a uma arma pesada (1d10), mas usa VIG para atacar.', cost: 6, example: 'O braço se torce e estilhaça, formando uma foice de cálcio cristalizado.' }
                ],
                2: [
                    { id: 'qui4', cap: 4, name: 'Reestruturação Regenerativa', effect: 'Cura imediata de 3d8 PV. Pode recolocar membros decepados (se segurados).', cost: 12, example: 'Fibras de estática negra costuram um braço amputado de volta ao tronco em segundos.' },
                    { id: 'qui5', cap: 5, name: 'Densidade Paradoxal', effect: 'O usuário ignora acertos críticos (todo crítico conta como acerto normal) e ganha RD 10.', cost: 15, example: 'O corpo do personagem se torna parcialmente translúcido e resistente como chumbo.' },
                    { id: 'qui6', cap: 6, name: 'Metamorfose Invasiva', effect: 'Força uma mutação em um alvo (Toque). O alvo sofre desvantagem em testes de AGI e FOR (CD Fortitude).', cost: 18, example: 'Tocar no joelho do inimigo e fazer com que a articulação dobre para trás.' }
                ],
                3: [
                    { id: 'qui7', cap: 7, name: 'Casca do Devorador', effect: 'Crescimento colossal (Tamanho Enorme). +10 em FOR, alcance natural aumenta para 4,5m. Defesa cai pela metade.', cost: 35, example: 'O peito rasga e uma abominação de músculos deformados engole a forma original do jogador.' },
                    { id: 'qui8', cap: 8, name: 'Células Falsas', effect: 'Se os PV caírem a 0, o corpo evapora e se reconstrói em um raio de 9m com 50% dos PV totais (1x por dia).', cost: 40, example: 'Ao receber um tiro fatal, o corpo se desfaz em fumaça cinza e reaparece atrás do atirador.' },
                    { id: 'qui9', cap: 9, name: 'Parasita Ontológico', effect: 'Funde-se fisicamente com outro ser (aliado ou inimigo). Se inimigo, drena 2d10 PV por rodada e assume o controle.', cost: 45, example: 'Transformar-se em um lodo vivo que invade o corpo do alvo pelas vias respiratórias.' },
                    { id: 'qui10', cap: 10, name: 'AVATAR DE XAL-MHYR', effect: 'O corpo não possui mais biologia. Imunidade a Dano Físico, Veneno, Doença. Só sofre dano Ontológico ou Mental.', cost: 50, example: 'O jogador se torna uma silhueta bidimensional cortada do tecido da realidade.' }
                ]
            }
        },
        {
            treeId: 'fenda',
            name: 'ÁRVORE 3: O VÉU / A FENDA (Potência Espacial)',
            desc: 'O espaço não é uma distância, é uma ilusão que pode ser dobrada ou rasgada.\nFoco de Build: Mobilidade absoluta, controle de campo, reposicionamento tático.\nInterconexão: Exige Tier 2 de Gravidade para o Tier 3.',
            tiers: {
                1: [
                    { id: 'fen1', cap: 1, name: 'Passo Deslizado', effect: 'Teletransporte para qualquer lugar visível até 9m de distância. Ação de Movimento.', cost: 2, example: 'Dar um passo para dentro de uma sombra e sair na sombra do inimigo.' },
                    { id: 'fen2', cap: 2, name: 'Troca Equivalente', effect: 'Troca de lugar com um aliado ou objeto até 15m.', cost: 4, example: 'Uma bala está vindo; o usuário troca de lugar com um pneu de carro a 10 metros dali.' },
                    { id: 'fen3', cap: 3, name: 'Distensão Mínima', effect: 'Alcance de ataques corpo a corpo aumenta em 3 metros (o braço "estica" através do espaço).', cost: 6, example: 'Dar um soco no ar, e o impacto atingir o rosto do inimigo do outro lado da sala.' }
                ],
                2: [
                    { id: 'fen4', cap: 4, name: 'Buraco de Minhoca', effect: 'Abre um portal que dura 3 rodadas. Pode ligar dois pontos a até 100m de distância.', cost: 12, example: 'Desenhar um círculo no ar com sangue e abrir passagem para o teto de um prédio vizinho.' },
                    { id: 'fen5', cap: 5, name: 'Isolamento Euclidiano', effect: 'Prende um alvo em um "canto" do espaço. O alvo não pode se mover ou atacar além de 1m (CD Vontade).', cost: 15, example: 'Dobrar o ar ao redor do inimigo, prendendo-o em uma caixa invisível e asfixiante.' },
                    { id: 'fen6', cap: 6, name: 'Evasão Dimensional', effect: 'Como Reação a um ataque, o usuário sai da realidade por 1 rodada. Dano e efeitos são anulados.', cost: 18, example: 'No momento de uma explosão, o personagem "pisca" para o Espaço Final, retornando ileso.' }
                ],
                3: [
                    { id: 'fen7', cap: 7, name: 'Dilaceração de Área', effect: 'Rasga o espaço num raio de 9m. Todos dentro são teletransportados aleatoriamente até 300m (sofrem dano/desorientação).', cost: 35, example: 'O chão vira vidro quebrado, engolindo e cuspindo todos pelo cenário.' },
                    { id: 'fen8', cap: 8, name: 'Sala Branca', effect: 'Teletransporta o usuário e 1 alvo para dimensão de bolso (1 hora). Ninguém de fora intervém.', cost: 40, example: 'Puxar o chefão do culto para um vazio branco absoluto.' },
                    { id: 'fen9', cap: 9, name: 'Ubiqüidade Parcial', effect: 'Existe em 3 lugares. Ganha 3 ações padrão, mas sofre triplo de dano em áreas.', cost: 45, example: 'Três cópias exatas atacando de ângulos mortos.' },
                    { id: 'fen10', cap: 10, name: 'ONIPRESENÇA ASSASSINA', effect: 'Teletransporte sem limite de distância/visão. Qualquer alvo adjacente à chegada é destruído instantaneamente.', cost: 50, example: 'Pensar no imperador em Paris, surgir nas suas costas e explodir seu crânio atómicamente.' }
                ]
            }
        },
        {
            treeId: 'oblivio',
            name: 'ÁRVORE 4: OBLÍVIO (Decadência / Aflição)',
            desc: 'Enfraquecer mentes, maldições, apodrecimento da alma e apagar memórias.\nFoco de Build: Debuffer Supremo, Assassinato Silencioso, Tortura.\nInterconexão: Exige Tier 1 de Ressonância (Mente) para progredir ao Tier 2.',
            tiers: {
                1: [
                    { id: 'obl1', cap: 1, name: 'Fadiga Antológica', effect: 'Alvo sofre penalidade de -2 em todos os testes e ataques (CD Fortitude).', cost: 2, example: 'Um sussurro que faz o inimigo sentir o peso de mil anos em seus ombros de uma só vez.' },
                    { id: 'obl2', cap: 2, name: 'Cegueira/Surdez Existencial', effect: 'Alvo perde um sentido à escolha (CD Vontade). Falha nos testes que dependem do sentido.', cost: 4, example: 'Os olhos da vítima ficam brancos; ela não fica cega pela luz, ela esquece o que é "ver".' },
                    { id: 'obl3', cap: 3, name: 'Apatia Causal', effect: 'O alvo não pode realizar Ações de Reação ou Ações Rápidas por 2 rodadas.', cost: 6, example: 'O cérebro do inimigo atrasa o reconhecimento de que está em perigo.' }
                ],
                2: [
                    { id: 'obl4', cap: 4, name: 'Necrose Lógica', effect: 'O alvo sofre 2d4 de dano permanente nos PV totais a cada rodada (Dano incurável na cena).', cost: 12, example: 'Um toque podre que transforma a carne do inimigo em carvão esfarelento.' },
                    { id: 'obl5', cap: 5, name: 'Apagamento de Habilidade', effect: 'O alvo esquece como usar uma de suas Perícias base por 24h.', cost: 15, example: 'O atirador de elite olha para o rifle; de repente, parece um idioma alienígena.' },
                    { id: 'obl6', cap: 6, name: 'Aura de Desespero', effect: 'Área de 9m. Inimigos que entrarem devem fazer Teste de Vontade ou fugirão aterrorizados.', cost: 18, example: 'Uma fumaça densa emanando do jogador que induz um ataque de pânico primordial.' }
                ],
                3: [
                    { id: 'obl7', cap: 7, name: 'Murchar a Casca', effect: 'Reduz 2 pontos de um Atributo Base do inimigo permanentemente (CD Extrema de Fortitude).', cost: 35, example: 'O braço musculoso do carrasco seca e atrofia em segundos.' },
                    { id: 'obl8', cap: 8, name: 'Morte Lenta e Certeira', effect: 'Define um prazo (ex: 3 rodadas). Se o alvo não matar o usuário até lá, seus PV caem a 0 instantaneamente.', cost: 40, example: 'Uma marca de ampulheta cravada no peito da vítima, pulsando até o infarto.' },
                    { id: 'obl9', cap: 9, name: 'Contágio Memético', effect: 'Maldição. Se o alvo infectado tocar em outro, o segundo recebe os mesmos debuffs e dano.', cost: 45, example: 'Doença de pele de olhos que piscam e transferem paralisia pelo toque.' },
                    { id: 'obl10', cap: 10, name: 'O SOM DO FIM', effect: 'O usuário decreta o fim de um conceito na cena. Ninguém pode usar testes daquele Atributo/Perícia.', cost: 50, example: 'Arrancar a própria garganta para falar, paralisando uma horda inteira que "esqueceu" como andar.' }
                ]
            }
        },
        {
            treeId: 'inercia',
            name: 'ÁRVORE 5: A INÉRCIA (Potência Temporal)',
            desc: 'O tempo não passa; a percepção humana é que é linear. Ensina a parar, acelerar ou quebrar essa linha.\nFoco de Build: Controlo de ações, buffs de velocidade, anulação de danos por rebobinar.\nInterconexão: Exige o Tier 1 de O Véu / A Fenda para aceder ao Tier 3.',
            tiers: {
                1: [
                    { id: 'ine1', cap: 1, name: 'Atraso Cognitivo', effect: 'O alvo é relegado para o fim da ordem de Iniciativa (CD Vontade).', cost: 2, example: 'Um olhar que faz o atirador hesitar meio segundo.' },
                    { id: 'ine2', cap: 2, name: 'Aceleração Entrópica', effect: 'O utilizador ganha uma Ação de Movimento extra na sua rodada.', cost: 4, example: 'Os músculos vibram e o Arauto percorre o triplo da distância como um borrão.' },
                    { id: 'ine3', cap: 3, name: 'Eco Recente', effect: 'Permite ver o que aconteceu num espaço confinado nas últimas 24 horas.', cost: 6, example: 'Olhar para as cinzas e ver o incêndio a acontecer ao contrário.' }
                ],
                2: [
                    { id: 'ine4', cap: 4, name: 'Estase Localizada', effect: 'Paralisa um alvo no tempo por 1d4 rodadas (CD Fortitude Extrema). O alvo é imune a danos.', cost: 12, example: 'Prender um cultista numa bolha onde o ar e a luz deixaram de fluir.' },
                    { id: 'ine5', cap: 5, name: 'Rebobinar Carnal', effect: 'Desfaz o dano sofrido por 1 alvo na última rodada, devolvendo os PV perdidos.', cost: 15, example: 'A bala sai do peito do aliado e volta para a arma do inimigo.' },
                    { id: 'ine6', cap: 6, name: 'Envelhecimento Precoce', effect: 'Causa 4d8 de Dano Ontológico. Objetos/armas apodrecem e enferrujam instantaneamente.', cost: 18, example: 'Tocar na caçadeira do inimigo e vê-la transformar-se em pó.' }
                ],
                3: [
                    { id: 'ine7', cap: 7, name: 'Paragem Total (Zaragoza)', effect: 'O tempo para num raio de 15m. Apenas o utilizador pode agir durante 2 rodadas.', cost: 35, example: 'O mundo fica cinzento. A chuva para no ar.' },
                    { id: 'ine8', cap: 8, name: 'Desvio de Linha Temporal', effect: 'O utilizador obriga o Mestre a rolar de novo um dado importante e aceitar o segundo resultado.', cost: 40, example: 'O golpe letal acerta; os olhos do Arauto brilham e, de repente, o monstro falhou.' },
                    { id: 'ine9', cap: 9, name: 'Cicatriz Crónica', effect: 'Causa 8d10 de Dano. O dano é aplicado de novo automaticamente no início do próximo turno do alvo.', cost: 45, example: 'Um corte de espada que sangra duas vezes: no presente e no futuro imediato.' },
                    { id: 'ine10', cap: 10, name: 'ABORTO EXISTENCIAL', effect: 'Remove permanentemente a próxima rodada de um alvo principal. Ele não pode agir, e defesas caem a 0.', cost: 50, example: 'O Elder apaga os 6 segundos seguintes da vida do alvo.' }
                ]
            }
        },
        {
            treeId: 'ressonancia',
            name: 'ÁRVORE 6: A RESSONÂNCIA (Potência Mental)',
            desc: 'Não se trata de ler a mente, mas de a reescrever com as frequências do Espaço Final.\nFoco de Build: Dominação, interrogatórios absolutos, ataques furtivos psicológicos.\nInterconexão: Exige o Tier 2 de Oblívio para aceder ao Tier 3.',
            tiers: {
                1: [
                    { id: 'res1', cap: 1, name: 'Estática Superficial', effect: 'Lê pensamentos ou intenções imediatas (Ação Rápida).', cost: 2, example: 'Ouvir o plano de ataque do inimigo antes de puxar a faca.' },
                    { id: 'res2', cap: 2, name: 'Ruído de Xal-Mhyr', effect: 'Causa 2d6 de Dano Mental. O alvo fica Confuso (50% chance de atacar o alvo errado).', cost: 4, example: 'Injetar o som de estrelas a morrer diretamente no córtex.' },
                    { id: 'res3', cap: 3, name: 'Ligação de Colmeia', effect: 'Cria telepatia perfeita entre até 5 aliados durante uma cena inteira.', cost: 6, example: 'A equipa comunica sem palavras, partilhando visões periféricas.' }
                ],
                2: [
                    { id: 'res4', cap: 4, name: 'Comando Soberano', effect: 'O alvo obedece a uma instrução simples de até 5 palavras (CD Vontade). Não suicídio direto.', cost: 12, example: '"Larga a arma e dorme." O segurança desaba.' },
                    { id: 'res5', cap: 5, name: 'Agonia Fantasma', effect: 'Cérebro acredita que o corpo arde. Sofre 4d6 de Dano e fica Atordoado.', cost: 15, example: 'A vítima contorce-se a gritar a tentar apagar um fogo inexistente.' },
                    { id: 'res6', cap: 6, name: 'Edição de Memória', effect: 'Apaga ou reescreve até 10 minutos de memória de um alvo humano mundano.', cost: 18, example: 'Faz a testemunha acreditar que um cão atacou a vítima.' }
                ],
                3: [
                    { id: 'res7', cap: 7, name: 'Marioneta Carnal', effect: 'Assume controlo total do corpo físico do alvo durante 3 rodadas.', cost: 35, example: 'O líder ataca os próprios seguidores a chorar, incapaz de parar.' },
                    { id: 'res8', cap: 8, name: 'Morte Cerebral', effect: 'Dano Massivo Mental de 8d8. A 0 PV, estado vegetativo permanente.', cost: 40, example: 'Apagar o "eu" do inimigo da existência com um olhar.' },
                    { id: 'res9', cap: 9, name: 'Parasita de Conhecimento', effect: 'Rouba permanentemente uma Perícia ou Segredo do alvo.', cost: 45, example: 'Sugar a perícia "Medicina" do médico inimigo.' },
                    { id: 'res10', cap: 10, name: 'DOMÍNIO DO DEVORADOR', effect: 'Dominação em área (15m). Quem falhar CD Extrema torna-se devoto suicida por 1 hora.', cost: 50, example: 'A sala inteira ajoelha-se, pronta para se sacrificar ao comando do Arauto.' }
                ]
            }
        },
        {
            treeId: 'anomalia',
            name: 'ÁRVORE 7: A ANOMALIA (Criação Material)',
            desc: 'O princípio da conservação da massa é uma mentira; a matéria é geometria à espera de ser corrompida.\nFoco de Build: Crafting, armadilhas, barreiras.\nInterconexão: Exige Tier 1 de Quimera para desbloquear Tier 2.',
            tiers: {
                1: [
                    { id: 'ano1', cap: 1, name: 'Massa Impossível', effect: 'Cria objetos pequenos (até 2kg) de materiais anómalos. Dura 1 hora.', cost: 2, example: 'Manifestar uma chave feita de gelo que não derrete e queima a pele.' },
                    { id: 'ano2', cap: 2, name: 'Munição Ontológica', effect: 'Gera munições que ignoram RD mundana. Aumenta o dano da arma de fogo em +1d6.', cost: 4, example: 'Balas formadas por dentes afiados que sorriem.' },
                    { id: 'ano3', cap: 3, name: 'Transmutação Simples', effect: 'Altera propriedades de uma superfície 2x2m (pedra vira lodo, madeira vira vidro).', cost: 6, example: 'Transformar a barricada de cimento em vidro quebradiço.' }
                ],
                2: [
                    { id: 'ano4', cap: 4, name: 'Barreira de Não-Espaço', effect: 'Cria um muro 3x3m (50 PV/RD 10). Se quebrado, explode (3d6 Dano).', cost: 12, example: 'Muro de geometria negra a proteger aliados.' },
                    { id: 'ano5', cap: 5, name: 'Armamento Primordial', effect: 'Manifesta Arma do Envolto letal e temporária.', cost: 15, example: 'Invocar espada feita de estática e ódio.' },
                    { id: 'ano6', cap: 6, name: 'Anatomia do Ambiente', effect: 'Cria armadilhas ambientais animadas na área.', cost: 18, example: 'O soalho cria braços que esmagam invasores.' }
                ],
                3: [
                    { id: 'ano7', cap: 7, name: 'Estrutura Viva', effect: 'Cria fortificação ou veículo orgânico (150 PV) que obedece a comandos mentais.', cost: 35, example: 'Jipe com motor de coração gigante e carapaça de osso.' },
                    { id: 'ano8', cap: 8, name: 'Criação de Singularidade', effect: 'Gera objeto com gravidade própria que atrai inimigos (9m, Teste de FOR).', cost: 40, example: 'Sol negro atirado atrai tudo para o centro.' },
                    { id: 'ano9', cap: 9, name: 'Transmutação Viva', effect: 'Transmuta inimigo em objeto inanimado permanentemente (CD Extrema Fortitude). Consciente.', cost: 45, example: 'Transformar soldado blindado em estátua de sal.' },
                    { id: 'ano10', cap: 10, name: 'ARQUITETURA ELDER', effect: 'Altera topografia de 1km (ex: montanha na cidade). Exige CO e sacrifício.', cost: 50, example: 'Catedral gótica invertida ergue-se dos escombros urbanos num instante.' }
                ]
            }
        },
        {
            treeId: 'paradoxo',
            name: 'ÁRVORE 8: O PARADOXO (Ilusão Absoluta)',
            desc: 'Quando os sentidos mentem com convicção suficiente, a realidade curva-se para pedir desculpa.\nFoco de Build: Engano, dano indireto, labirintos mentais.\nInterconexão: Exige Tier 1 de Fenda e Tier 1 de Ressonância.',
            tiers: {
                1: [
                    { id: 'par1', cap: 1, name: 'Falha Ótica', effect: 'Cria ilusão visual/sonora simples (Percepção vs CD da Ilusão).', cost: 2, example: 'Som de metralhadora ou demónio a rastejar pelo teto.' },
                    { id: 'par2', cap: 2, name: 'Camuflagem Geométrica', effect: 'Invisível enquanto não atacar, fundindo-se com o conceito do espaço.', cost: 4, example: 'A luz dobra-se, sendo "esquecido" pela ótica local.' },
                    { id: 'par3', cap: 3, name: 'Isca Psíquica', effect: 'Duplo perfeito. Inimigos atacam o duplo se falharem em Vontade.', cost: 6, example: 'O inimigo corta a ilusão, o verdadeiro está atrás dele.' }
                ],
                2: [
                    { id: 'par4', cap: 4, name: 'Pesadelo Tátil', effect: 'A ilusão tem consistência física momentânea. Pode causar 3d6 de Dano.', cost: 12, example: 'Ilusão de besta morde; o cérebro fabrica a ferida e sangra.' },
                    { id: 'par5', cap: 5, name: 'Labirinto Sensorial', effect: 'Cega, ensurdece e retira o tato de até 3 alvos (CD Vontade Extrema). Paralisados.', cost: 15, example: 'Alvos veem-se lançados no vazio escuro sem gravidade.' },
                    { id: 'par6', cap: 6, name: 'Miragem Inversa', effect: 'Esconde o que está lá (pontes, chamas, ferimentos).', cost: 18, example: 'Esconder ravina de 20m parecendo chão liso.' }
                ],
                3: [
                    { id: 'par7', cap: 7, name: 'Recreação Histórica', effect: 'Ilusão de área (50m) que reproduz exatamente o ambiente como era noutra época.', cost: 35, example: 'Armazém vira matadouro de 1920 a funcionar em pleno.' },
                    { id: 'par8', cap: 8, name: 'Morte por Convicção', effect: 'Decreta alvo executado. Falha Vontade = Dano Massivo (10d10).', cost: 40, example: 'Som da lâmina; a cabeça cai, cortada pelo paradoxo.' },
                    { id: 'par9', cap: 9, name: 'Realidade Subscrita', effect: 'Transfere ilusão para matéria permanente (fogo falso fica real).', cost: 45, example: 'Parede de chumbo ilusória forçada por átomos a ser verdadeira.' },
                    { id: 'par10', cap: 10, name: 'O TEATRO DOS CEGOS', effect: 'Reescreve regras da física para os inimigos (30m) por 3 rodadas.', cost: 50, example: 'Gravidade no teto, respirar queima os pulmões.' }
                ]
            }
        },
        {
            treeId: 'entropia',
            name: 'ÁRVORE 9: A ENTROPIA (Azar / Sorte Reversa)',
            desc: 'A probabilidade viciada. Entropia reescreve a sorte como força agressiva.\nFoco de Build: Debuff de área, controlo de rolagens, anular críticos.\nInterconexão: Exige Tier 1 de Inércia para Tier 2.',
            tiers: {
                1: [
                    { id: 'ent1', cap: 1, name: 'Falha Menor', effect: 'Obriga alvo a rerolar ataque/perícia e ficar com pior resultado.', cost: 2, example: 'A arma escorrega das mãos no momento do disparo.' },
                    { id: 'ent2', cap: 2, name: 'Desvio Cinético', effect: '+3 na Defesa Passiva contra ataques à distância por 1 cena.', cost: 4, example: 'Balas recusam-se a seguir trajetória reta perto do Arauto.' },
                    { id: 'ent3', cap: 3, name: 'Sorte Macabra', effect: 'Próximo ataque do utilizador é Crítico automático.', cost: 6, example: 'Faca atirada às cegas ricocheteia e acerta a jugular.' }
                ],
                2: [
                    { id: 'ent4', cap: 4, name: 'Colapso de Ferramenta', effect: 'Arma, rádio ou mecânica inimiga avaria permanentemente.', cost: 12, example: 'Motor do carro de fuga derrete numa poça radioativa.' },
                    { id: 'ent5', cap: 5, name: 'Propagação de Azar', effect: 'Raio de 9m, todos os inimigos rolam resistência com Desvantagem por 3 rodadas.', cost: 15, example: 'Névoa transforma passos em tropeções e respiração em tosse.' },
                    { id: 'ent6', cap: 6, name: 'Maldição do Destino', effect: 'O alvo perde a capacidade de Críticos; críticos viram falhas/críticas.', cost: 18, example: 'Quanto melhor o golpe do espadachim inimigo, mais ele corta a própria perna.' }
                ],
                3: [
                    { id: 'ent7', cap: 7, name: 'Ruína Probabilística', effect: 'Causa 7d8 de Dano. Maximizado se o alvo falhar Teste Vontade.', cost: 35, example: 'Teto, janela e viga desabam ao mesmo tempo sobre o alvo.' },
                    { id: 'ent8', cap: 8, name: 'Milagre Invertido', effect: 'Transforma a cura do alvo em Dano Ontológico igual ao valor.', cost: 40, example: 'Ritual de cura inimigo vira ácido nas veias.' },
                    { id: 'ent9', cap: 9, name: 'Zona de Entropia Morta', effect: 'Área 15m. Teste d20 falha automaticamente se natural não for 15+.', cost: 45, example: 'A realidade desiste. Nada funciona perfeitamente.' },
                    { id: 'ent10', cap: 10, name: 'O ÚNICO RESULTADO', effect: 'Dita uma ação incontestável para o inimigo (sem rolagem).', cost: 50, example: 'Xal-Mhyr dita; alvo atira na própria cabeça ou sofre evento predeterminado.' }
                ]
            }
        },
        {
            treeId: 'gravidade',
            name: 'ÁRVORE 10: A GRAVIDADE (Potência Cinética)',
            desc: 'A gravidade é definida pelo peso das fendas no ar.\nFoco de Build: Controlo de Multidões, esmagamento físico.\nInterconexão: Exige Tier 1 de Colapso para desbloquear Tier 3.',
            tiers: {
                1: [
                    { id: 'gra1', cap: 1, name: 'Peso Emocional', effect: 'Reduz o deslocamento de um alvo a metade (CD Fortitude).', cost: 2, example: 'A culpa materializa-se, pesando como chumbo as botas da vítima.' },
                    { id: 'gra2', cap: 2, name: 'Repulsão Singular', effect: 'Afasta inimigo adjacente em 6m e o deita ao chão.', cost: 4, example: 'Onda de choque silenciosa partindo das palmas.' },
                    { id: 'gra3', cap: 3, name: 'Queda Horizontal', effect: 'O utilizador pode caminhar pelas paredes/teto por 1 hora.', cost: 6, example: 'A gravidade pessoal vira 90 graus à sua vontade.' }
                ],
                2: [
                    { id: 'gra4', cap: 4, name: 'Esmagamento Euclidiano', effect: 'Causa 4d8 de Dano contusão (Área 6m). Quem falhar fica Caído.', cost: 12, example: 'Ar pesado esmaga capacetes e ossos dos adversários.' },
                    { id: 'gra5', cap: 5, name: 'Campo de Suspensão', effect: 'Levita objetos/criaturas desprevenidas num raio de 9m no ar.', cost: 15, example: 'A sala flutua num vácuo gravitacional.' },
                    { id: 'gra6', cap: 6, name: 'Vetor Cortante', effect: 'Causa 6d6 Cortante. Ignora RD física, fatiando pela gravidade.', cost: 18, example: 'Puxa o ar com tanta violência que cria uma lâmina de vácuo transparente.' }
                ],
                3: [
                    { id: 'gra7', cap: 7, name: 'Singularidade Menor', effect: 'Atrai todos (15m) para ponto central, causando 7d8 Esmagamento.', cost: 35, example: 'Poço gravitacional do tamanho de um punho absorve o salão.' },
                    { id: 'gra8', cap: 8, name: 'Inversão Planetária', effect: 'Área 30m, gravidade inverte-se. Todos caem "para cima" (3 rodadas).', cost: 40, example: 'O céu converte-se no chão temporário.' },
                    { id: 'gra9', cap: 9, name: 'Densidade de Anã Branca', effect: 'Corpo imovível/indestrutível. RD 30, imune a quedas/repulsão.', cost: 45, example: 'A carne vira estrela morta, partindo as armas de quem a ataca.' },
                    { id: 'gra10', cap: 10, name: 'BURACO NEGRO ONTOLÓGICO', effect: 'Rasgão de 1 min. Criatura puxada sofre morte instantânea ao centro.', cost: 50, example: 'Orbe estático que engole som, luz e vida no vazio.' }
                ]
            }
        },
        {
            treeId: 'sangue_negro',
            name: 'ÁRVORE 11: O SANGUE NEGRO (Necromancia)',
            desc: 'O Espaço Final não conhece a vida nem a morte. Reanima a carne falhada.\nFoco de Build: Exército, autossustento, resiliência aterradora.\nInterconexão: Exige Tier 2 de Quimera para aceder ao Tier 2.',
            tiers: {
                1: [
                    { id: 'san1', cap: 1, name: 'Animação Falsa', effect: 'Reanima cadáver pequeno/médio para seguir ordens por 1h.', cost: 2, example: 'Cão/cultista morto levanta vertendo lodo negro.' },
                    { id: 'san2', cap: 2, name: 'Sifão de Vida', effect: 'Causa 2d6 Dano e cura utilizador em metade (Toque).', cost: 4, example: 'Arrancar a vitalidade através de um toque parasitário.' },
                    { id: 'san3', cap: 3, name: 'Memória do Sangue', effect: 'Tocar no sangue fresco revela últimos 5 min de vida do cadáver.', cost: 6, example: 'Provar sangue e ver assassino pelos olhos da vítima.' }
                ],
                2: [
                    { id: 'san4', cap: 4, name: 'Marionetas de Alcatrão', effect: 'Reanima até 3 cadáveres para combate (atributos originais, metade dos PV).', cost: 12, example: 'Levantar patrulha abatida como escudos de carne.' },
                    { id: 'san5', cap: 5, name: 'Podridão Inversa', effect: 'Cura 4d8 PV de aliado, mas aliado adquire 2 Pontos Corrupção.', cost: 15, example: 'Costurar ferida com fios negros que murmuram à noite.' },
                    { id: 'san6', cap: 6, name: 'Eco do Caído', effect: 'Arranca sombra do cadáver para ataque (5d8 Dano Ontológico) no assassino.', cost: 18, example: 'A sombra estica-se na parede e estrangula o agressor.' }
                ],
                3: [
                    { id: 'san7', cap: 7, name: 'Legião do Espaço Final', effect: 'Reanima todos os cadáveres (30m). Explodem (4d6 Dano) quando mortos.', cost: 35, example: 'Cemitério acorda como vasos de estática destrutivos.' },
                    { id: 'san8', cap: 8, name: 'Casca Imortal', effect: 'Se PV cair < 0, utilizador luta por 3 rodadas antes do corpo falir.', cost: 40, example: 'Coração não bate, mas ataca impiedosamente.' },
                    { id: 'san9', cap: 9, name: 'Partilha de Morte', effect: 'Liga utilizador ao alvo. Dano sofrido pelo utilizador também passa ao alvo.', cost: 45, example: 'Arauto perfurado = coração do inimigo também sofre dano.' },
                    { id: 'san10', cap: 10, name: 'O ÚLTIMO SUSPIRO DE XAL-MHYR', effect: 'Ressuscita morto recente (<10min). Ele perde classe original e vira "Tocado".', cost: 50, example: 'Arraste a alma de volta envolta em contaminação ontológica.' }
                ]
            }
        },
        {
            treeId: 'emanacao',
            name: 'ÁRVORE 12: A EMANAÇÃO (Invocação)',
            desc: 'Abrir comportas para formas de vida do abismo passearem pela Terra.\nFoco de Build: Pets, dano colateral massivo.\nInterconexão: Exige Tier 2 de O Véu / Fenda para Tier 3.',
            tiers: {
                1: [
                    { id: 'ema1', cap: 1, name: 'Sussurro Invocado', effect: 'Invoca entidade invisível/inofensiva para espionar até 1km.', cost: 2, example: 'Olho flutuante que sussurra segredos através da sala.' },
                    { id: 'ema2', cap: 2, name: 'Familiar Aberrante', effect: 'Invoca construto bizarro menor para combate ou investigação.', cost: 4, example: 'Aranha de pernas com dedos humanos.' },
                    { id: 'ema3', cap: 3, name: 'Enxame Geomêtrico', effect: 'Invoca bando de agulhas/espelhos flutuantes causando 3d4 Dano Área 6m.', cost: 6, example: 'Estilhaços rasgam quem atravessa o corredor.' }
                ],
                2: [
                    { id: 'ema4', cap: 4, name: 'Invocar o Devorador', effect: 'Invoca cão do Envolto (50 PV) que causa Dano Ontológico.', cost: 12, example: 'Cão de músculos e dentes de cristal a emergir do chão.' },
                    { id: 'ema5', cap: 5, name: 'Porta-Voz Involuntário', effect: 'Força alvo a canalizar ataque de área de dentro do corpo.', cost: 15, example: 'Refém flutua disparando raio gélido da boca.' },
                    { id: 'ema6', cap: 6, name: 'Manifestação de Horror', effect: 'Invoca presença invisível gigante (15m). Inimigos perdem -5 de Defesa.', cost: 18, example: 'Mentes fraquejam só com o peso do colossal.' }
                ],
                3: [
                    { id: 'ema7', cap: 7, name: 'Guardião do Limiar', effect: 'Invoca abominação nível Boss menor por 3 rodadas (9x9m).', cost: 35, example: 'Massa de tentáculos a espalhar caos pela barricada.' },
                    { id: 'ema8', cap: 8, name: 'Fenda de Invocação Múltipla', effect: 'Portais enviam feixes em 4 alvos, causando 6d8 Dano cada.', cost: 40, example: '4 Lanças de outra dimensão rasgam o ar.' },
                    { id: 'ema9', cap: 9, name: 'Avatar Partilhado', effect: 'Funde-se à invocação maior, duplicando PV e golpes corpo-a-corpo.', cost: 45, example: 'Arauto usa monstro como exoesqueleto imensurável.' },
                    { id: 'ema10', cap: 10, name: 'A CHEGADA', effect: 'A Mão do Elder limpa 50m. Morte instantânea <100 PV. Entra em coma por 2d4 dias.', cost: 50, example: 'Céu quebra como vidro e a mão apaga exércitos inteiros.' }
                ]
            }
        },
        {
            treeId: 'vertice',
            name: 'ÁRVORE 13: O VÉRTICE (Defesa Absoluta)',
            desc: 'O controlo definitivo do Não. O Vértice rege o colapso das intenções.\nFoco de Build: Invulnerabilidade pontual, reflexão de danos.\nInterconexão: Exige Tier 2 de A Anomalia para Tier 3.',
            tiers: {
                1: [
                    { id: 'ver1', cap: 1, name: 'Negação Superficial', effect: 'Reduz o dano do próximo ataque recebido a metade (Reação).', cost: 2, example: 'Escudo hexagonal cinza surge entre faca e garganta.' },
                    { id: 'ver2', cap: 2, name: 'Armadura de Vazio', effect: 'Garante RD 5 e imunidade a danos críticos durante 3 rodadas.', cost: 4, example: 'Pele escurece absorvendo impactos cinéticos.' },
                    { id: 'ver3', cap: 3, name: 'Passo Lateral Dimensional', effect: 'Bónus passivo de +4 em todos Testes de Reflexo e Agilidade.', cost: 6, example: 'O corpo do personagem sempre um micro-centímetro noutra dimensão.' }
                ],
                2: [
                    { id: 'ver4', cap: 4, name: 'Redirecionamento', effect: '(Reação). Alvo atirador à distância vê ataque redirecionado num raio de 6m.', cost: 12, example: 'Agarra bala do ar com dobra espacial atirando em outro inimigo.' },
                    { id: 'ver5', cap: 5, name: 'Bolha de Fuga', effect: 'Cria refúgio 3x3m ao redor do grupo (Dura 2 rodadas). Nada físico entra.', cost: 15, example: 'Cúpula protege a equipe do desabamento do teto.' },
                    { id: 'ver6', cap: 6, name: 'Rejeição de Conceito', effect: 'Torna-se imune a um tipo de dano (Fogo, Cortante, Mental) pela cena.', cost: 18, example: 'Caminha em labaredas de lança-chamas ignorando calor.' }
                ],
                3: [
                    { id: 'ver7', cap: 7, name: 'O Muro do Fim', effect: 'Cria barreira de 15m. Atravessar sofre 5d10 Dano Ontológico, para movimento.', cost: 35, example: 'Divide o campo com falha na renderização do mundo.' },
                    { id: 'ver8', cap: 8, name: 'Intocável', effect: 'Por 2 rodadas, todas as rolagens de ataque inimigas falham imeditamente.', cost: 40, example: 'Desfaz linha do alvo na matriz existencial. Balas atravessam o ar.' },
                    { id: 'ver9', cap: 9, name: 'Espelho de Xal-Mhyr', effect: '(Reação Absoluta). Devolve 100% de Dano ou Efeito de volta ao atacante (sem perda de PV).', cost: 45, example: 'Absorve magia e explode de volta ao rosto do mago.' },
                    { id: 'ver10', cap: 10, name: 'A RECUSA EXISTENCIAL', effect: 'Diz "Não" a um evento (morte aliado, bomba) e reverte o turno (1x por campanha).', cost: 50, example: 'Supremo poder de edição. O jogador recusa a visão do mestre e força o universo a mudar.' }
                ]
            }
        }
    ],
    'Classer (Linhagem Herdada)': [
        {
            treeId: 'classer_main',
            name: 'LINHAGEM HERDADA (4 Níveis)',
            desc: 'A evolução máxima e adaptação biológica dos coletores de Gene Êxodo.\nFoco de Build: Sobrevivência, Regeneração, Mobilidade e Força Bruta.',
            tiers: {
                1: [
                    { id: 'c1_1', cap: 1, name: 'Adaptação Extrema', effect: 'Seu DNA é reescrito. Imune a doenças e venenos comuns.', cost: 0, example: '' },
                    { id: 'c1_2', cap: 1, name: 'Aeternus Vitalis', effect: 'Regeneração celular brutal. Recupera 2 PV por rodada ativo.', cost: 0, example: '' },
                    { id: 'c1_3', cap: 1, name: 'Velocitus Bellator', effect: 'Reflexos predatórios. Ganha +3 metros de Deslocamento Base.', cost: 0, example: '' }
                ],
                2: [
                    { id: 'c2_1', cap: 2, name: 'Resiliência Instintiva', effect: 'Seus ossos densificam. +2 Defesa Passiva Natural.', cost: 0, example: '' },
                    { id: 'c2_2', cap: 2, name: 'Sangue Fervente', effect: 'Cura PV com base em dano sofrido no mesmo turno.', cost: 0, example: '' },
                    { id: 'c2_3', cap: 2, name: 'Mentis Aurorae', effect: 'Expansão neural. Percebe o mundo em câmera lenta (+5 Prontidão).', cost: 0, example: '' }
                ],
                3: [
                    { id: 'c3_1', cap: 3, name: 'Predador Perfeito', effect: 'Ataques corpo-a-corpo recebem Margem de Crítico +1.', cost: 0, example: '' },
                    { id: 'c3_2', cap: 3, name: 'Reconstrução', effect: 'Pode recolocar membros decepados em campo.', cost: 0, example: '' },
                    { id: 'c3_3', cap: 3, name: 'Força Titânica', effect: 'Sua capacidade de carga e dano de impacto dobram.', cost: 0, example: '' }
                ],
                4: [
                    { id: 'c4_1', cap: 4, name: 'Visão Preditiva', effect: 'Anula penalidades de ataque surpresa ou flanqueamento.', cost: 0, example: '' },
                    { id: 'c4_2', cap: 4, name: 'Ápice Genético', effect: 'Ultrapassa o teto biológico para testes heroicos.', cost: 0, example: '' }
                ]
            }
        }
    ]
};

// currentUnlockedNodes já declarado acima; bloco legado preservado sem redeclaração.


function buildSkillTreeUI(nature) {
    const container = document.getElementById('specific-content-container');
    if(!advancedTreeData[nature]) {
        const natureData = ruleset[currentMode].natures[nature];
        if(natureData && natureData.tabHtml) { container.innerHTML = natureData.tabHtml; }
        return;
    }
    
    let html = `
        <h3 style="color:var(--theme-color); font-family: 'Cinzel', serif; margin-bottom: 10px; text-align:center;">Tabelas de Potência e Mutação</h3>
        <p style="color:#aaa; font-size:0.85rem; text-align:center; margin-bottom:15px;">Selecione os Nodos Iniciais (Tabelas) para visualizar as opções e ramificar suas Habilidades.</p>
        <div class="tree-ui-container envolto-skilltree-window" style="height:860px; overflow:auto; border:1px solid #333; position:relative; background:rgba(0,0,0,0.6);">
            <div id="tree-scroll-wrapper" style="position:relative; height:100%; min-width:100%;">
                <svg class="tree-svg" id="tree-svg" style="position:absolute; top:0; left:0; width:100%; height:100%; pointer-events:none;"></svg>
                <div class="tree-nodes" id="tree-nodes" style="position:absolute; top:0; left:0; width:100%; height:100%;"></div>
            </div>
        </div>
        <div id="tree-node-info" class="desc-box envolto-table-info" style="margin-top:15px; min-height:150px; text-align:left;">Selecione uma Tabela (Nodo Raiz) para iniciar.</div>
        <input type="hidden" id="tree-unlocked-data" value="">
        <input type="hidden" id="ef-table-layout-data" value="{}">
    `;
    container.innerHTML = html;
    setTimeout(() => renderTree(nature), 50);
}

function renderTree(nature) {
    const nodesContainer = document.getElementById('tree-nodes');
    const svgContainer = document.getElementById('tree-svg');
    const scrollWrapper = document.getElementById('tree-scroll-wrapper');
    if(!nodesContainer || !svgContainer || !scrollWrapper) return;
    
    nodesContainer.innerHTML = '';
    svgContainer.innerHTML = '';
    
    const trees = advancedTreeData[nature];
    if(!trees) return;
    
    if(editingIndex !== null && characters[editingIndex] && characters[editingIndex].specificData && characters[editingIndex].specificData['tree-unlocked-data']) {
        try { currentUnlockedNodes = JSON.parse(characters[editingIndex].specificData['tree-unlocked-data']); } catch(e){}
    } else {
        const savedDataEl = document.getElementById('spec-tree-unlocks');
        if(savedDataEl && savedDataEl.value) {
            try { currentUnlockedNodes = JSON.parse(savedDataEl.value); } catch(e){}
        } else if (!currentUnlockedNodes.length) {
            currentUnlockedNodes = [];
        }
    }
    document.getElementById('tree-unlocked-data').value = JSON.stringify(currentUnlockedNodes);
    
        if(nature === 'O Envolto (Horror Cósmico)') {
        renderEnvoltoTree(trees, nature, nodesContainer, svgContainer, scrollWrapper);
        return;
    }

    const countTrees = trees.length;
    // Calculate the width needed so trees don't overlap. Min 100%, but 15vw per tree.
    const requiredWidth = Math.max(100, countTrees * 15); 
    scrollWrapper.style.minWidth = requiredWidth + "%";

    const spacingX = 100 / (countTrees + 1);

    trees.forEach((tree, idx) => {
        const rootX = spacingX * (idx + 1);
        const rootY = 15;
        
        drawNode('root_'+tree.treeId, 'TBL', tree.name.substring(0,8)+'...', rootX, rootY, true, () => handleRootClick(tree, nature), nodesContainer);
        
        let prevX = rootX;
        let prevY = rootY;
        
        const maxTiers = Object.keys(tree.tiers).length;
        
        for(let lvl = 1; lvl <= maxTiers; lvl++) {
            if(!tree.tiers[lvl]) break;
            
            let unlocked = tree.tiers[lvl].find(o => currentUnlockedNodes.includes(o.id));
            if(unlocked) {
                let currentX = rootX;
                let currentY = rootY + (lvl * 20); // space them vertically
                
                // Add slight diagonal aesthetic for deeper tiers
                if (lvl % 2 === 0) {
                    currentX = rootX + (idx % 2 === 0 ? 2 : -2); 
                } else if (lvl > 1) {
                    currentX = rootX + (idx % 2 === 0 ? -2 : 2);
                }
                
                drawLine(prevX, prevY, currentX, currentY, svgContainer, true);
                drawNode(unlocked.id, 'T'+lvl, unlocked.name.substring(0,10)+'...', currentX, currentY, true, () => handleNodeLevelClick(tree, lvl, unlocked, nature), nodesContainer);
                
                prevX = currentX;
                prevY = currentY;
            } else {
                break;
            }
        }
    });
}





/* =====================================================================
   ESPAÇO FINAL — MOVIMENTO LIVRE DAS TABELAS DE POTÊNCIA E MUTAÇÃO
   Cada Tabela/Raiz controla sua própria posição. A ramificação acompanha
   a Tabela, preservando as conexões orgânicas e a persistência na ficha.
   ===================================================================== */
const EF_TABLE_LAYOUT_KEY = 'ef-table-layout-data';
let envoltoTableDragState = null;

function efReadTableLayout() {
    const input = document.getElementById(EF_TABLE_LAYOUT_KEY);
    let raw = input && input.value ? input.value : '';
    if (!raw && editingIndex !== null && characters[editingIndex]?.specificData?.[EF_TABLE_LAYOUT_KEY]) {
        raw = characters[editingIndex].specificData[EF_TABLE_LAYOUT_KEY];
    }
    try {
        const parsed = raw ? JSON.parse(raw) : {};
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (_) { return {}; }
}

function efWriteTableLayout(layout) {
    const input = document.getElementById(EF_TABLE_LAYOUT_KEY);
    if (input) input.value = JSON.stringify(layout);
}

function efDefaultTablePosition(index, count, W, H) {
    const cx = W / 2, cy = H / 2;
    const radius = Math.min(W, H) * 0.3625;
    const angle = -Math.PI / 2 + index * (Math.PI * 2 / Math.max(1, count));
    return { x: cx + Math.cos(angle) * radius, y: cy + Math.sin(angle) * radius };
}

function efClampTablePosition(pos, W, H) {
    const margin = Math.min(82, Math.round(Math.min(W, H) * 0.11));
    return {
        x: Math.max(margin, Math.min(W - margin, Number(pos.x) || W / 2)),
        y: Math.max(margin, Math.min(H - margin, Number(pos.y) || H / 2))
    };
}

function efAttachTableDrag(root, tree, nature, index, count, W, H) {
    if (!root) return;
    root.classList.add('ef-table-draggable');
    root.setAttribute('title', 'Arraste para mover esta Tabela de Potência e Mutação');
    root.setAttribute('aria-label', `Mover Tabela ${index + 1}: ${tree.name}`);

    root.addEventListener('pointerdown', function (ev) {
        if (ev.button !== 0) return;
        const layout = efReadTableLayout();
        const current = layout[tree.treeId] || efDefaultTablePosition(index, count, W, H);
        envoltoTableDragState = {
            treeId: tree.treeId,
            nature,
            index,
            count,
            W,
            H,
            start: { x: ev.clientX, y: ev.clientY },
            startPos: { x: current.x, y: current.y },
            moved: false,
            pointerId: ev.pointerId
        };
        root.classList.add('ef-table-dragging');
        try { root.setPointerCapture(ev.pointerId); } catch (_) {}
        ev.preventDefault();
    });
}

if (!window.__efFreeTableDragBound) {
    window.__efFreeTableDragBound = true;
    document.addEventListener('pointermove', function (ev) {
        const state = envoltoTableDragState;
        if (!state) return;
        const zoom = Math.max(0.42, efTreeZoom || 1);
        const dx = (ev.clientX - state.start.x) / zoom;
        const dy = (ev.clientY - state.start.y) / zoom;
        if (Math.hypot(dx, dy) <= 4 && !state.moved) return;
        state.moved = true;

        const layout = efReadTableLayout();
        layout[state.treeId] = efClampTablePosition({
            x: state.startPos.x + dx,
            y: state.startPos.y + dy
        }, state.W, state.H);
        efWriteTableLayout(layout);

        const nodes = document.getElementById('tree-nodes');
        const svg = document.getElementById('tree-svg');
        const wrapper = document.getElementById('tree-scroll-wrapper');
        const trees = advancedTreeData[state.nature];
        if (nodes && svg && wrapper && trees) {
            renderEnvoltoTree(trees, state.nature, nodes, svg, wrapper);
            const movedRoot = document.getElementById('node_root_' + state.treeId);
            if (movedRoot) movedRoot.classList.add('ef-table-dragging');
        }
        ev.preventDefault();
    }, {passive:false});

    document.addEventListener('pointerup', function (ev) {
        const state = envoltoTableDragState;
        if (!state) return;
        const moved = state.moved;
        const treeId = state.treeId;
        envoltoTableDragState = null;
        const root = document.getElementById('node_root_' + treeId);
        if (root) {
            root.classList.remove('ef-table-dragging');
            if (moved) {
                root.dataset.efDragged = '1';
                setTimeout(() => { delete root.dataset.efDragged; }, 100);
            }
        }
        if (moved) {
            ev.preventDefault();
            ev.stopPropagation();
        }
    }, true);

    document.addEventListener('click', function (ev) {
        const root = ev.target.closest && ev.target.closest('.ef-table-draggable');
        if (root && root.dataset.efDragged === '1') {
            ev.preventDefault();
            ev.stopImmediatePropagation();
        }
    }, true);
}

function efResetTablePositions(nature) {
    if (!isEditMode) return;
    efWriteTableLayout({});
    renderTree(nature);
}

let efTreeZoom = null;
let efTreeZoomManual = false;

function efApplyTreeZoom(scrollWrapper, frame, zoom) {
    if (!scrollWrapper || !frame) return;
    const z = Math.max(0.42, Math.min(1.25, Number(zoom) || 1));
    efTreeZoom = z;
    scrollWrapper.style.zoom = z;
    scrollWrapper.style.transform = 'none';
    scrollWrapper.style.transformOrigin = 'top left';
    scrollWrapper.style.margin = '0';
    scrollWrapper.style.width = '1024px';
    scrollWrapper.style.height = '768px';
    scrollWrapper.style.minWidth = '1024px';
    scrollWrapper.style.minHeight = '768px';
    const out = document.getElementById('ef-zoom-value');
    if (out) out.textContent = Math.round(z * 100) + '%';
}

function efFitTreeViewport(scrollWrapper, frame) {
    if (!scrollWrapper || !frame) return;
    const availableW = Math.max(320, frame.clientWidth - 18);
    const availableH = Math.max(420, frame.clientHeight - 18);
    const fit = Math.min(1, availableW / 1960, availableH / 1360);
    efTreeZoomManual = false;
    efApplyTreeZoom(scrollWrapper, frame, fit);
    requestAnimationFrame(() => {
        frame.scrollLeft = Math.max(0, (frame.scrollWidth - frame.clientWidth) / 2);
        frame.scrollTop = Math.max(0, (frame.scrollHeight - frame.clientHeight) / 2);
    });
}

function efBindTreeViewControls() {
    const frame = document.querySelector('#ef-space-final .ef-tree-frame');
    const wrapper = document.getElementById('tree-scroll-wrapper');
    if (!frame || !wrapper || wrapper.dataset.controlsBound === '1') return;
    wrapper.dataset.controlsBound = '1';
    const fit = document.getElementById('ef-fit-tree');
    const out = document.getElementById('ef-zoom-value');
    const change = (delta) => {
        efTreeZoomManual = true;
        efApplyTreeZoom(wrapper, frame, (efTreeZoom || 1) + delta);
    };
    fit?.addEventListener('click', () => efFitTreeViewport(wrapper, frame));
    document.getElementById('ef-zoom-out')?.addEventListener('click', () => change(-0.1));
    document.getElementById('ef-zoom-in')?.addEventListener('click', () => change(0.1));
    if (out) out.textContent = Math.round((efTreeZoom || 1) * 100) + '%';
    if (!efTreeZoomManual || !efTreeZoom) efFitTreeViewport(wrapper, frame);
    if (!window.__efTreeResizeBound) {
        window.__efTreeResizeBound = true;
        let timer;
        window.addEventListener('resize', () => {
            clearTimeout(timer);
            timer = setTimeout(() => {
                const f = document.querySelector('#ef-space-final .ef-tree-frame');
                const w = document.getElementById('tree-scroll-wrapper');
                if (f && w && !efTreeZoomManual) efFitTreeViewport(w, f);
            }, 120);
        });
    }
}

function renderEnvoltoTree(trees, nature, nodesContainer, svgContainer, scrollWrapper) {
    // Área interna do Espaço Final: 1024×768. A arte da árvore mantém a
    // proporção do projeto-base 800×700 e é ampliada uniformemente para
    // ocupar o novo espaço sem esticar horizontal ou verticalmente.
    const W = 1600, H = 1180, cx = W / 2, cy = H / 2;
    const BASE_W = 800, BASE_H = 700;
    const designScale = 1;
    const count = Math.max(1, trees.length);
    const rootRadius = 290 * designScale;
    const tierRadii = [235, 190, 150].map(r => r * designScale);
    const completionRadius = 82 * designScale;

    const savedLayoutRaw = efReadTableLayout();
    const layoutVersionEl = document.getElementById('ef-tree-layout-version');
    const layoutVersion = Number(layoutVersionEl?.value || 0);
    const savedLayout = {};
    Object.entries(savedLayoutRaw || {}).forEach(([id, p]) => {
        if (!p || typeof p !== 'object') return;
        const px = Number(p.x);
        const py = Number(p.y);
        if (!Number.isFinite(px) || !Number.isFinite(py)) return;
        // Migração única para o canvas normal 1600×1180.
        // v0.30 usava 1024×768; versões anteriores usavam 800×700.
        if (layoutVersion >= 31) {
            savedLayout[id] = { x: px, y: py };
        } else if (layoutVersion >= 30) {
            savedLayout[id] = {
                x: cx + (px - 1024 / 2) * (W / 1024),
                y: cy + (py - 768 / 2) * (H / 768)
            };
        } else {
            savedLayout[id] = {
                x: cx + (px - BASE_W / 2) * (W / BASE_W),
                y: cy + (py - BASE_H / 2) * (H / BASE_H)
            };
        }
    });
    if (layoutVersion < 31 && Object.keys(savedLayout).length) {
        efWriteTableLayout(savedLayout);
        if (layoutVersionEl) layoutVersionEl.value = '31';
    } else if (layoutVersionEl && layoutVersionEl.value !== '31') {
        layoutVersionEl.value = '31';
    }
    const glyphs = ['☉','◈','⟡','◌','⟁','⌁','∆','◇','✦','✧','✥','✺','✣'];
    const completion = ['✦','✧','◇','◆','◈','✥','✣','✤','✺','✹','✷','✶','✵'];
    const themes = [
      {name:'Warp de Carne', color:'#8f32c8', ink:'#050006', bg:'#d0a4ed', shape:'flesh'},
      {name:'Sussurro do Vazio', color:'#214f9b', ink:'#02050d', bg:'#9db4df', shape:'void'},
      {name:'Linhas de Sangue', color:'#cf1730', ink:'#070102', bg:'#eda0aa', shape:'blood'},
      {name:'Miasma Ácido', color:'#b7d629', ink:'#071000', bg:'#e5ef9b', shape:'acid'},
      {name:'Ossatura Invertida', color:'#d0b45b', ink:'#110d02', bg:'#efe2ae', shape:'bone'},
      {name:'Nervo Abissal', color:'#8d2daf', ink:'#050005', bg:'#d2a0e3', shape:'nerve'},
      {name:'Fenda de Âmbar', color:'#d18b24', ink:'#100700', bg:'#f0cf93', shape:'amber'},
      {name:'Pupila Morta', color:'#267b73', ink:'#00100e', bg:'#a7dbd7', shape:'eye'},
      {name:'Geometria Doente', color:'#b92f64', ink:'#090106', bg:'#e6a8bf', shape:'geo'},
      {name:'Costura Parasita', color:'#5575bf', ink:'#02050e', bg:'#b8c7ed', shape:'suture'},
      {name:'Eco Calcificado', color:'#8f923a', ink:'#101000', bg:'#d7d999', shape:'calc'},
      {name:'Fome Carmesim', color:'#d61c25', ink:'#0c0101', bg:'#ef9ca1', shape:'hunger'},
      {name:'Raiz do Nada', color:'#5d3a8b', ink:'#040109', bg:'#c0acd9', shape:'root'}
    ];

    scrollWrapper.style.width = W + 'px';
    scrollWrapper.style.height = H + 'px';
    scrollWrapper.style.minWidth = W + 'px';
    scrollWrapper.style.minHeight = H + 'px';
    scrollWrapper.style.zoom = '1';
    svgContainer.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svgContainer.setAttribute('width', W); svgContainer.setAttribute('height', H);
    nodesContainer.style.width = W + 'px'; nodesContainer.style.height = H + 'px';
    svgContainer.innerHTML=''; nodesContainer.innerHTML='';

    const core=document.createElement('button');
    core.type='button';
    core.className='ef-core';
    core.style.left=cx+'px'; core.style.top=cy+'px';
    core.innerHTML='<span class="ef-core-glyph">∅</span><strong>ENVOLTO</strong><small>ESPAÇO FINAL</small>';
    nodesContainer.appendChild(core);

    let awakened=0;
    const safeOption=(tree,lvl)=>tree.tiers[lvl]?.find(o=>currentUnlockedNodes.includes(o.id)) || null;
    const pos=(angle,r)=>({x:cx+Math.cos(angle)*r,y:cy+Math.sin(angle)*r});

    const addOrganicPath=(a,b,theme,idx,lvl,active=true)=>{
        const ns='http://www.w3.org/2000/svg';
        const dx=b.x-a.x, dy=b.y-a.y, len=Math.max(1,Math.hypot(dx,dy)), nx=-dy/len, ny=dx/len;
        const wiggle=18+(idx%3)*5+(lvl*2); const sign=((idx+lvl)%2?1:-1);
        const p1={x:a.x+dx*.28+nx*wiggle*sign,y:a.y+dy*.28+ny*wiggle*sign};
        const p2={x:a.x+dx*.58-nx*wiggle*.7*sign,y:a.y+dy*.58-ny*wiggle*.7*sign};
        const d=`M ${a.x} ${a.y} C ${p1.x} ${p1.y}, ${p2.x} ${p2.y}, ${b.x} ${b.y}`;
        const under=document.createElementNS(ns,'path'); under.setAttribute('d',d); under.classList.add('ef-path-ink'); svgContainer.appendChild(under);
        const main=document.createElementNS(ns,'path'); main.setAttribute('d',d); main.classList.add('ef-path'); main.style.setProperty('--ef-branch',theme.color); if(active)main.classList.add('active'); svgContainer.appendChild(main);
        if(lvl>=2){
          const bx=a.x+dx*.43+nx*sign*wiggle*.6, by=a.y+dy*.43+ny*sign*wiggle*.6;
          const twig=document.createElementNS(ns,'path');
          twig.setAttribute('d',`M ${bx} ${by} q ${nx*sign*22} ${ny*sign*22} ${nx*sign*42} ${ny*sign*4}`);
          twig.classList.add('ef-twig'); twig.style.setProperty('--ef-branch',theme.color); svgContainer.appendChild(twig);
        }
    };

    trees.forEach((tree,idx)=>{
      const theme=themes[idx%themes.length];
      const defaultRoot=efDefaultTablePosition(idx,count,W,H);
      const rootPos=efClampTablePosition(savedLayout[tree.treeId] || defaultRoot,W,H);
      const base=Math.atan2(rootPos.y-cy,rootPos.x-cx);
      const branch=`ef-branch-${idx}`;
      const root=document.createElement('button'); root.type='button';
      root.className=`ef-node ef-root ef-shape-${theme.shape}`;
      root.style.left=rootPos.x+'px'; root.style.top=rootPos.y+'px';
      root.style.setProperty('--ef-branch',theme.color); root.style.setProperty('--ef-ink',theme.ink); root.style.setProperty('--ef-paper',theme.bg);
      root.dataset.branch=branch; root.dataset.tier='0'; root.id='node_root_'+tree.treeId;
      root.innerHTML=`<span class="ef-icon">${glyphs[idx%glyphs.length]}</span><small>ÁRVORE ${idx+1}</small><strong>${tree.name.replace(/^ÁRVORE\s+\d+:\s*/i,'')}</strong>`;
      root.onclick=(ev)=>{ if(root.dataset.efDragged==='1') return; handleRootClick(tree,nature); };
      nodesContainer.appendChild(root);

      let prev=rootPos;
      let lastUnlocked=null;
      for(let lvl=1;lvl<=3;lvl++){
        const tier=tree.tiers[lvl]||[];
        const selected=safeOption(tree,lvl);
        const radius=tierRadii[lvl-1];
        const angle=base + (lvl===1?-0.05:(lvl===2?0.05:0));
        const p=pos(angle,radius);
        const node=document.createElement('button'); node.type='button';
        node.className=`ef-node ef-tier ef-tier-${lvl} ef-shape-${theme.shape}`;
        node.style.left=p.x+'px'; node.style.top=p.y+'px';
        node.style.setProperty('--ef-branch',theme.color); node.style.setProperty('--ef-ink',theme.ink); node.style.setProperty('--ef-paper',theme.bg);
        node.dataset.branch=branch; node.dataset.tier=String(lvl);
        if(selected){
          awakened++; lastUnlocked=selected;
          node.classList.add('awakened'); node.innerHTML=`<span class="ef-icon">${glyphs[(idx+lvl)%glyphs.length]}</span><small>TIER ${lvl} · CAP ${selected.cap}</small><strong>${selected.name}</strong><i class="ef-tentacle ef-t1"></i><i class="ef-tentacle ef-t2"></i>`;
          node.onclick=()=>handleNodeLevelClick(tree,lvl,selected,nature);
        } else {
          node.classList.add('dormant');
          node.innerHTML=`<span class="ef-icon">?</span><small>TIER ${lvl}</small><strong>${tier.length?'BLOQUEADO':'VAZIO'}</strong>`;
          node.onclick=()=>handleRootClick(tree,nature);
        }
        nodesContainer.appendChild(node);
        addOrganicPath(prev,p,theme,idx,lvl,!!selected);
        prev=p;
      }

      const cp=pos(base,completionRadius);
      const finish=document.createElement('button'); finish.type='button';
      finish.className=`ef-node ef-completion ef-shape-${theme.shape}`;
      finish.style.left=cp.x+'px'; finish.style.top=cp.y+'px';
      finish.style.setProperty('--ef-branch',theme.color); finish.style.setProperty('--ef-ink',theme.ink); finish.innerHTML=`<span>${completion[idx%completion.length]}</span><small>CONCLUSÃO</small>`;
      finish.onclick=()=>handleRootClick(tree,nature); nodesContainer.appendChild(finish);
      if(lastUnlocked){ addOrganicPath(prev,cp,theme,idx,4,true); addOrganicPath(cp,{x:cx,y:cy},theme,idx,5,true); }
    });

    const prog=document.getElementById('ef-progress-value'); if(prog)prog.textContent=`${awakened} / ${trees.length*3}`;
    efBindTreeViewControls();
    const frame = document.querySelector('#ef-space-final .ef-tree-frame');
    if (frame && !efTreeZoomManual) efFitTreeViewport(scrollWrapper, frame);
    else if (frame) efApplyTreeZoom(scrollWrapper, frame, efTreeZoom || 1);
}

function drawNode(id, badge, label, x, y, active, onClick, container) {
    const div = document.createElement('div');
    div.className = 'tree-node';
    if(active) div.classList.add('unlocked');
    div.style.left = x + '%';
    div.style.top = y + '%';
    div.id = 'node_' + id;
    div.innerHTML = `<span>${badge}</span><div class="tree-node-label">${label}</div>`;
    div.onclick = onClick;
    container.appendChild(div);
}

function drawLine(x1, y1, x2, y2, container, active) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1 + '%');
    line.setAttribute('y1', y1 + '%');
    line.setAttribute('x2', x2 + '%');
    line.setAttribute('y2', y2 + '%');
    line.setAttribute('class', 'tree-line');
    if(active) line.classList.add('unlocked');
    container.appendChild(line);
}

function handleRootClick(tree, nature) {
    const infoBox = document.getElementById('tree-node-info');
    let html = `<strong style="font-size:1.1rem; color:var(--theme-color);">${tree.name}</strong><br><p style="margin-top:5px; font-size:0.85rem; color:#bbb;">${tree.desc}</p>`;
    
    let t1Selected = tree.tiers[1] ? tree.tiers[1].find(o => currentUnlockedNodes.includes(o.id)) : null;
    
    if(tree.tiers[1]) {
        html += `<h4 style="margin-top:15px; color:#fff; border-bottom:1px solid #444; padding-bottom:5px;">Habilidades Disponíveis - Nível 1:</h4>`;
        html += `<div style="display:flex; flex-wrap:wrap; gap:10px; justify-content:flex-start; margin-top:10px;">`;
        
        tree.tiers[1].forEach(opt => {
            const isSel = currentUnlockedNodes.includes(opt.id);
            const borderStyle = isSel ? 'border-color:#a8ff00; background:rgba(168,255,0,0.1); box-shadow:inset 0 0 10px #a8ff00;' : 'border-color:#555; background:rgba(0,0,0,0.5);';
            
            let costLabel = opt.cost ? `<span style="color:#ff3333; font-weight:bold;">Custo: ${opt.cost} EE</span>` : '';

            if(isEditMode) {
                html += `<div class="choice-card" style="padding:15px; width:48%; text-align:left; align-items:flex-start; cursor:pointer; transition:all 0.3s; ${borderStyle}" onclick="selectTreeNode('${opt.id}', 1, '${tree.treeId}', '${nature}')">
                            <h4 style="color:${isSel?'#a8ff00':'var(--theme-color)'}; font-size:1rem; margin-bottom:8px; border-bottom:1px solid rgba(255,255,255,0.1); width:100%;">[Cap ${opt.cap}] ${opt.name}</h4>
                            <p style="font-size:0.8rem; color:#ccc; line-height:1.4;"><strong>Efeito:</strong> ${opt.effect}</p>
                            <p style="font-size:0.75rem; color:#aaa; margin-top:8px;"><em>Ex: ${opt.example}</em></p>
                            <p style="font-size:0.8rem; margin-top:8px;">${costLabel}</p>
                         </div>`;
            } else if (isSel) {
                 html += `<div class="choice-card active" style="padding:15px; width:100%; text-align:left; align-items:flex-start;">
                            <h4 style="color:#a8ff00; margin-bottom:8px; border-bottom:1px solid rgba(255,255,255,0.1); width:100%;">[Cap ${opt.cap}] ${opt.name}</h4>
                            <p style="font-size:0.8rem;">${opt.effect}</p>
                            <p style="font-size:0.75rem; margin-top:8px;"><em>Ex: ${opt.example}</em></p>
                          </div>`;
            }
        });
        html += `</div>`;
    }
    
    if(t1Selected && isEditMode) {
         html += `<button type="button" class="souls-btn small-btn" style="margin-top:20px; border-color:red; color:red; width:100%;" onclick="relockTree('${tree.treeId}', 1, '${nature}')">Revogar Toda a Ramificação</button>`;
    }
    infoBox.innerHTML = html;
}

function handleNodeLevelClick(tree, level, selectedOpt, nature) {
    const infoBox = document.getElementById('tree-node-info');
    
    let costLabel = selectedOpt.cost ? `<span style="color:#ff3333; font-weight:bold;">Custo: ${selectedOpt.cost} EE</span>` : '';
    
    let html = `<strong style="font-size:1.1rem; color:#a8ff00;">NODO ATUAL: [Cap ${selectedOpt.cap}] ${selectedOpt.name}</strong>`;
    html += `<p style="font-size:0.85rem; color:#ccc; margin-top:8px;"><strong>Efeito:</strong> ${selectedOpt.effect}</p>`;
    html += `<p style="font-size:0.8rem; color:#aaa; margin-top:5px;"><em>Ex: ${selectedOpt.example}</em></p>`;
    if(costLabel) html += `<p style="font-size:0.85rem; margin-top:5px;">${costLabel}</p>`;
    
    const nextLevel = level + 1;
    if(tree.tiers[nextLevel]) {
        html += `<h4 style="margin-top:20px; color:#fff; border-bottom:1px solid #444; padding-bottom:5px;">Habilidades Desbloqueadas - Nível ${nextLevel}:</h4>`;
        html += `<div style="display:flex; flex-wrap:wrap; gap:10px; justify-content:flex-start; margin-top:10px;">`;
        
        tree.tiers[nextLevel].forEach(opt => {
            const isSel = currentUnlockedNodes.includes(opt.id);
            const borderStyle = isSel ? 'border-color:#a8ff00; background:rgba(168,255,0,0.1); box-shadow:inset 0 0 10px #a8ff00;' : 'border-color:#555; background:rgba(0,0,0,0.5);';
            
            let nCostLabel = opt.cost ? `<span style="color:#ff3333; font-weight:bold;">Custo: ${opt.cost} EE</span>` : '';

            if(isEditMode) {
                html += `<div class="choice-card" style="padding:15px; width:48%; text-align:left; align-items:flex-start; cursor:pointer; transition:all 0.3s; ${borderStyle}" onclick="selectTreeNode('${opt.id}', ${nextLevel}, '${tree.treeId}', '${nature}')">
                            <h4 style="color:${isSel?'#a8ff00':'var(--theme-color)'}; font-size:0.9rem; margin-bottom:8px; border-bottom:1px solid rgba(255,255,255,0.1); width:100%;">[Cap ${opt.cap}] ${opt.name}</h4>
                            <p style="font-size:0.75rem; color:#ccc; line-height:1.4;"><strong>Efeito:</strong> ${opt.effect}</p>
                            <p style="font-size:0.7rem; color:#aaa; margin-top:8px;"><em>Ex: ${opt.example}</em></p>
                            <p style="font-size:0.75rem; margin-top:8px;">${nCostLabel}</p>
                         </div>`;
            } else if (isSel) {
                 html += `<div class="choice-card active" style="padding:15px; width:100%; text-align:left; align-items:flex-start;">
                            <h4 style="color:#a8ff00; margin-bottom:8px; border-bottom:1px solid rgba(255,255,255,0.1); width:100%;">[Cap ${opt.cap}] ${opt.name}</h4>
                            <p style="font-size:0.8rem;">${opt.effect}</p>
                            <p style="font-size:0.75rem; margin-top:8px;"><em>Ex: ${opt.example}</em></p>
                          </div>`;
            }
        });
        html += `</div>`;
    } else {
        html += `<h4 style="margin-top:20px; color:#d4af37;">[ ÁPICE ALCANÇADO ]</h4>`;
    }
    
    if(isEditMode) {
         html += `<button type="button" class="souls-btn small-btn" style="margin-top:20px; border-color:red; color:red; width:100%;" onclick="relockTree('${tree.treeId}', ${level}, '${nature}')">Revogar Deste Ponto em Diante</button>`;
    }
    infoBox.innerHTML = html;
}

function selectTreeNode(optId, level, treeId, nature) {
    if(!isEditMode) return;
    const trees = advancedTreeData[nature];
    const tree = trees.find(t => t.treeId === treeId);
    
    // Remove existing selection at this level and subsequent levels for this tree
    for(let l = level; l <= Object.keys(tree.tiers).length; l++) {
        if(tree.tiers[l]) {
            tree.tiers[l].forEach(o => {
                currentUnlockedNodes = currentUnlockedNodes.filter(id => id !== o.id);
            });
        }
    }
    currentUnlockedNodes.push(optId);
    document.getElementById('tree-unlocked-data').value = JSON.stringify(currentUnlockedNodes);
    renderTree(nature);
    
    // Refresh view: if level 1, click root. If >1, click previous level node to see selections.
    if(level === 1) {
        handleRootClick(tree, nature);
    } else {
        const prevOpt = tree.tiers[level-1].find(o => currentUnlockedNodes.includes(o.id));
        if(prevOpt) handleNodeLevelClick(tree, level-1, prevOpt, nature);
    }
}

function relockTree(treeId, level, nature) {
    if(!isEditMode) return;
    const trees = advancedTreeData[nature];
    const tree = trees.find(t => t.treeId === treeId);
    
    for(let l = level; l <= Object.keys(tree.tiers).length; l++) {
        if(tree.tiers[l]) {
            tree.tiers[l].forEach(o => {
                currentUnlockedNodes = currentUnlockedNodes.filter(id => id !== o.id);
            });
        }
    }
    document.getElementById('tree-unlocked-data').value = JSON.stringify(currentUnlockedNodes);
    renderTree(nature);
    
    if(level === 1) {
        handleRootClick(tree, nature);
    } else {
        const prevOpt = tree.tiers[level-1].find(o => currentUnlockedNodes.includes(o.id));
        if(prevOpt) handleNodeLevelClick(tree, level-1, prevOpt, nature);
    }
}


/* =====================================================================
   OVERRIDES — REPOSITÓRIOS POR CONTA + MESA COMPARTILHADA POR CÓDIGO
   ===================================================================== */

const MS_REPO_KEY = 'mundosSombriosCharacterReposV3';
const MS_JOINED_KEY = 'mundosSombriosJoinedReposV3';
const MS_TABLE_MIGRATION_KEY = 'mundosSombriosTableMigrationV3';
const MS_CHAR_MIGRATION_KEY = 'mundosSombriosCharMigrationV3';

function msClone(value) {
    return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

function msReadJSON(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch (err) {
        console.warn('[Mundos Sombrios] Falha ao ler JSON:', key, err);
        return fallback;
    }
}

function msWriteJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function msEnsureRepoStore() {
    const store = msReadJSON(MS_REPO_KEY, {});
    return (store && typeof store === 'object') ? store : {};
}

function msEnsureUserRepo(userId) {
    const store = msEnsureRepoStore();
    if (!store[userId]) {
        store[userId] = {
            characters: [],
            joinedTables: [],
            ownedTables: []
        };
        msWriteJSON(MS_REPO_KEY, store);
    }
    return store[userId];
}

function msSyncRepoStore(userId, repo) {
    const store = msEnsureRepoStore();
    store[userId] = repo;
    msWriteJSON(MS_REPO_KEY, store);
    return store;
}

function msGetAllRepoCharacters(store = msEnsureRepoStore()) {
    return Object.values(store).flatMap(repo => Array.isArray(repo.characters) ? repo.characters : []);
}

function msGetAllRepoJoinedTables(store = msEnsureRepoStore()) {
    return Object.values(store).flatMap(repo => Array.isArray(repo.joinedTables) ? repo.joinedTables : []);
}

function msFindCharacterByRef(ownerId, charId) {
    if (!ownerId || charId === undefined || charId === null) return null;
    const store = msEnsureRepoStore();
    const repo = store[ownerId];
    if (repo && Array.isArray(repo.characters)) {
        const found = repo.characters.find(c => String(c.id) === String(charId));
        if (found) return msClone(found);
    }
    if (Array.isArray(allCharactersDB)) {
        const fallback = allCharactersDB.find(c => String(c.ownerId) === String(ownerId) && String(c.id) === String(charId));
        if (fallback) return msClone(fallback);
    }
    return null;
}

function msNormalizeTable(table) {
    if (!table) return null;
    if (!Array.isArray(table.participants)) table.participants = [];
    if (!Array.isArray(table.banned)) table.banned = [];
    return table;
}

function msRefreshLegacyCharacterUnion() {
    const store = msEnsureRepoStore();
    allCharactersDB = msGetAllRepoCharacters(store).map(msClone);
    msWriteJSON('mundosSombriosChars', allCharactersDB);
}

function msRefreshLegacyJoinedUnion(userId) {
    const repo = msEnsureUserRepo(userId);
    allJoinedTablesDB = (repo.joinedTables || []).map(t => msClone(t));
    msWriteJSON('mundosSombriosJoined', allJoinedTablesDB);
}

function msSeedRepoStoreFromLegacyCharacters() {
    if (localStorage.getItem(MS_CHAR_MIGRATION_KEY)) return;
    const store = msEnsureRepoStore();
    let changed = false;

    if (Object.keys(store).length === 0 && Array.isArray(allCharactersDB) && allCharactersDB.length) {
        allCharactersDB.forEach(char => {
            const ownerId = char.ownerId || (currentUser && currentUser.id) || 'u3';
            if (!store[ownerId]) store[ownerId] = { characters: [], joinedTables: [], ownedTables: [] };
            store[ownerId].characters.push(msClone(char));
            changed = true;
        });
    }

    if (changed) msWriteJSON(MS_REPO_KEY, store);
    localStorage.setItem(MS_CHAR_MIGRATION_KEY, '1');
}

function msSeedTablesFromLegacy() {
    if (localStorage.getItem(MS_TABLE_MIGRATION_KEY)) return;
    if (!Array.isArray(allTablesDB)) allTablesDB = [];
    allTablesDB = allTablesDB.map(t => {
        const table = msNormalizeTable(msClone(t));
        if (table && !table.participants.length && table.ownerId) {
            table.participants.push({
                userId: table.ownerId,
                charId: null,
                charName: 'Mesa de Origem',
                ownerId: table.ownerId,
                isOwner: true,
                linkedAt: Date.now()
            });
        }
        return table;
    });
    msWriteJSON('mundosSombriosTables', allTablesDB);
    localStorage.setItem(MS_TABLE_MIGRATION_KEY, '1');
}

function msSyncCurrentUserView() {
    if (!currentUser) return;
    const store = msEnsureRepoStore();
    const repo = msEnsureUserRepo(currentUser.id);
    characters = msClone(repo.characters || []);
    myTables = (allTablesDB || []).filter(t => String(t.ownerId) === String(currentUser.id)).map(msClone);
    joinedTables = (allTablesDB || []).filter(t => (t.participants || []).some(p => String(p.userId) === String(currentUser.id)) && String(t.ownerId) !== String(currentUser.id)).map(msClone);
    allCharactersDB = msGetAllRepoCharacters(store).map(msClone);
    allJoinedTablesDB = msGetAllRepoJoinedTables(store).map(msClone);
    msWriteJSON('mundosSombriosChars', allCharactersDB);
    msWriteJSON('mundosSombriosJoined', allJoinedTablesDB);
}

function msResolveCurrentUserCharSelection() {
    const sel = document.getElementById('join-char-select-vtt');
    if (!sel) return null;
    const value = sel.value;
    if (value === '' || value === null || value === undefined) return null;
    const index = Number(value);
    if (Number.isNaN(index)) return null;
    if (!Array.isArray(characters) || !characters[index]) return null;
    return msClone(characters[index]);
}

function msGetTableByCodeOrId(idOrCode) {
    const token = String(idOrCode || '').trim();
    if (!token) return null;
    const byId = (allTablesDB || []).find(t => String(t.id) === token);
    if (byId) return msNormalizeTable(msClone(byId));
    const byCode = (allTablesDB || []).find(t => String(t.code || '').toUpperCase() === token.toUpperCase());
    return byCode ? msNormalizeTable(msClone(byCode)) : null;
}

function msUpsertTable(table) {
    const normalized = msNormalizeTable(msClone(table));
    const idx = (allTablesDB || []).findIndex(t => String(t.id) === String(normalized.id));
    if (idx >= 0) allTablesDB[idx] = normalized;
    else allTablesDB.push(normalized);
    msWriteJSON('mundosSombriosTables', allTablesDB);
    return normalized;
}

function msPersistCharacterToRepo(char, ownerId, charIdOverride = null) {
    if (!ownerId) ownerId = currentUser ? currentUser.id : null;
    if (!ownerId) return;

    const store = msEnsureRepoStore();
    const repo = store[ownerId] || { characters: [], joinedTables: [], ownedTables: [] };
    const charId = charIdOverride !== null && charIdOverride !== undefined ? charIdOverride : char.id;
    const targetIdx = Array.isArray(repo.characters)
        ? repo.characters.findIndex(c => String(c.id) === String(charId))
        : -1;

    const saved = msClone(char);
    saved.ownerId = ownerId;
    if (charId !== undefined && charId !== null) saved.id = charId;

    if (!Array.isArray(repo.characters)) repo.characters = [];
    if (targetIdx >= 0) repo.characters[targetIdx] = saved;
    else repo.characters.push(saved);

    store[ownerId] = repo;
    msWriteJSON(MS_REPO_KEY, store);
    msRefreshLegacyCharacterUnion();
}

function msPersistJoinedTableRepo(userId, tableCode, tableName, tableId) {
    const store = msEnsureRepoStore();
    const repo = store[userId] || { characters: [], joinedTables: [], ownedTables: [] };
    if (!Array.isArray(repo.joinedTables)) repo.joinedTables = [];
    const item = { code: tableCode, name: tableName, tableId: tableId || null, joinedAt: Date.now() };
    const idx = repo.joinedTables.findIndex(t => String(t.code).toUpperCase() === String(tableCode).toUpperCase());
    if (idx >= 0) repo.joinedTables[idx] = item;
    else repo.joinedTables.push(item);
    store[userId] = repo;
    msWriteJSON(MS_REPO_KEY, store);
    msRefreshLegacyJoinedUnion(userId);
}

function msRemoveJoinedTableRepo(userId, tableCode) {
    const store = msEnsureRepoStore();
    const repo = store[userId] || { characters: [], joinedTables: [], ownedTables: [] };
    repo.joinedTables = (repo.joinedTables || []).filter(t => String(t.code).toUpperCase() !== String(tableCode).toUpperCase());
    store[userId] = repo;
    msWriteJSON(MS_REPO_KEY, store);
    msRefreshLegacyJoinedUnion(userId);
}

function msLinkParticipantToTable(tableCode, participant) {
    const table = msGetTableByCodeOrId(tableCode);
    if (!table) return null;
    const participants = Array.isArray(table.participants) ? table.participants : [];
    const clean = {
        userId: participant.userId,
        charId: participant.charId,
        charName: participant.charName || 'Alma Vinculada',
        ownerId: participant.ownerId || participant.userId,
        isOwner: !!participant.isOwner,
        linkedAt: participant.linkedAt || Date.now()
    };
    const idx = participants.findIndex(p => String(p.userId) === String(clean.userId) && String(p.charId) === String(clean.charId));
    if (idx >= 0) participants[idx] = clean;
    else participants.push(clean);
    table.participants = participants;
    msUpsertTable(table);
    return table;
}

function msUnlinkParticipantFromTable(tableCode, userId, charId = null) {
    const table = msGetTableByCodeOrId(tableCode);
    if (!table) return null;
    table.participants = (table.participants || []).filter(p => {
        const sameUser = String(p.userId) === String(userId);
        if (charId === null || charId === undefined) return !sameUser;
        return !(sameUser && String(p.charId) === String(charId));
    });
    msUpsertTable(table);
    return table;
}

function loadUserData() {
    if (!currentUser) return;
    msSeedRepoStoreFromLegacyCharacters();
    msSeedTablesFromLegacy();
    msSyncCurrentUserView();
}

function saveGlobalCharacters() {
    if (!currentUser) return;
    const store = msEnsureRepoStore();
    store[currentUser.id] = {
        characters: msClone(Array.isArray(characters) ? characters : []),
        joinedTables: (store[currentUser.id]?.joinedTables || []),
        ownedTables: (store[currentUser.id]?.ownedTables || [])
    };
    msWriteJSON(MS_REPO_KEY, store);
    msRefreshLegacyCharacterUnion();
}

function saveGlobalJoinedTables() {
    if (!currentUser) return;
    const joined = Array.isArray(joinedTables) ? joinedTables : [];
    const store = msEnsureRepoStore();
    const repo = store[currentUser.id] || { characters: [], joinedTables: [], ownedTables: [] };
    repo.joinedTables = joined.map(t => ({
        code: t.code,
        name: t.name,
        tableId: t.id || t.tableId || null,
        joinedAt: t.joinedAt || Date.now()
    }));
    store[currentUser.id] = repo;
    msWriteJSON(MS_REPO_KEY, store);
    msRefreshLegacyJoinedUnion(currentUser.id);
}

function openCreateTableModal() {
    if (!currentUser) {
        alert('Faça login antes de forjar uma fenda.');
        return;
    }
    if (currentUser.role === 'jogador') {
        alert('Apenas Mestres ou Administradores têm o poder de abrir novas Fendas.');
        return;
    }
    document.getElementById('new-table-name').value = '';
    document.getElementById('create-table-modal').style.display = 'flex';
}

function confirmCreateTable() {
    if (!currentUser) {
        alert('Faça login para criar mesas.');
        return;
    }
    if ((myTables || []).length >= MAX_TABLES) {
        alert("Você atingiu o limite máximo de 10 Fendas (Mesas).");
        return;
    }
    const nameInput = document.getElementById('new-table-name');
    const name = nameInput ? nameInput.value.trim() : '';
    if (!name) {
        alert("A fenda precisa de um nome.");
        return;
    }

    currentVttTheme = document.getElementById('new-table-theme').value;
    document.getElementById('create-table-modal').style.display = 'none';

    isDraftMode = true;
    enterVTT('draft', true, name);
}

function saveDraftTable() {
    if (!currentUser) return;
    const code = generateRoomCode();
    const newTable = {
        id: Date.now().toString(),
        name: document.getElementById('vtt-table-name').innerText,
        code: code,
        theme: currentVttTheme,
        ownerId: currentUser.id,
        banned: [],
        participants: [{
            userId: currentUser.id,
            charId: null,
            charName: currentUser.username,
            ownerId: currentUser.id,
            isOwner: true,
            linkedAt: Date.now()
        }]
    };

    msUpsertTable(newTable);
    myTables = (allTablesDB || []).filter(t => String(t.ownerId) === String(currentUser.id)).map(msClone);
    isDraftMode = false;
    currentTableData = msClone(newTable);
    document.getElementById('btn-save-table').style.display = 'none';
    alert(`Fenda Imortalizada com sucesso!\nCódigo de Acesso para os Jogadores: ${code}`);
    renderAncoragem();
}

function deleteTable(id) {
    if (confirm("Tem certeza que deseja apagar essa Fenda para sempre? O mundo será destruído.")) {
        allTablesDB = (allTablesDB || []).filter(t => String(t.id) !== String(id));
        msWriteJSON('mundosSombriosTables', allTablesDB);
        if (currentUser) {
            const repo = msEnsureUserRepo(currentUser.id);
            repo.ownedTables = (repo.ownedTables || []).filter(t => String(t.id) !== String(id));
            msSyncRepoStore(currentUser.id, repo);
        }
        renderAncoragem();
    }
}

function leaveJoinedTable(code) {
    if (confirm("Deseja cortar sua conexão permanente com esta Fenda?")) {
        msRemoveJoinedTableRepo(currentUser.id, code);
        joinedTables = joinedTables.filter(t => String(t.code).toUpperCase() !== String(code).toUpperCase());
        renderAncoragem();
    }
}

function openJoinTableModal() {
    const select = document.getElementById('join-char-select-vtt');
    select.innerHTML = '';
    if (!Array.isArray(characters) || characters.length === 0) {
        select.innerHTML = '<option disabled>Nenhuma alma no santuário</option>';
    } else {
        characters.forEach((c, i) => select.innerHTML += `<option value="${i}">${c.name} - ${c.nature}</option>`);
    }
    document.getElementById('join-code-input').value = '';
    document.getElementById('join-modal').style.display = 'flex';
}

function confirmJoinTable() {
    const code = document.getElementById('join-code-input').value.trim().toUpperCase();
    const charIndexRaw = document.getElementById('join-char-select-vtt').value;
    const charIndex = charIndexRaw === '' ? null : Number(charIndexRaw);

    if (!code || charIndex === null || Number.isNaN(charIndex)) {
        alert("Preencha o código e selecione uma alma.");
        return;
    }

    document.getElementById('join-modal').style.display = 'none';
    myVttCharIndex = charIndex;

    const selectedChar = characters[charIndex] ? msClone(characters[charIndex]) : null;
    const table = msGetTableByCodeOrId(code);
    if (!table) {
        alert('Código de mesa inválido.');
        return;
    }

    if (String(table.ownerId) === String(currentUser.id)) {
        if (selectedChar) {
            msLinkParticipantToTable(table.code, {
                userId: currentUser.id,
                charId: selectedChar.id,
                charName: selectedChar.name,
                ownerId: currentUser.id,
                isOwner: true
            });
            msPersistJoinedTableRepo(currentUser.id, table.code, table.name, table.id);
        }
        alert("Você é o Mestre desta mesa! Entrando como Mestre.");
        enterVTT(table.id, true);
        return;
    }

    if (selectedChar) {
        msLinkParticipantToTable(table.code, {
            userId: currentUser.id,
            charId: selectedChar.id,
            charName: selectedChar.name,
            ownerId: currentUser.id,
            isOwner: false
        });
        msPersistJoinedTableRepo(currentUser.id, table.code, table.name, table.id);
    }

    joinedTables = (allTablesDB || []).filter(t => (t.participants || []).some(p => String(p.userId) === String(currentUser.id)) && String(t.ownerId) !== String(currentUser.id)).map(msClone);
    enterVTT(code, false);
}

function enterVTT(tableIdOrCode, asGM, draftName = null) {
    isVttGM = !!asGM;
    document.querySelectorAll('.gm-only-btn').forEach(el => el.style.display = asGM ? 'flex' : 'none');

    tablePlayers = [];
    currentTableData = null;
    diceHistory = [];
    renderDiceHistory();

    if (tableIdOrCode === 'draft') {
        document.getElementById('vtt-table-name').innerText = draftName || "Forjando Nova Fenda...";
        document.getElementById('btn-save-table').style.display = 'block';
    } else {
        document.getElementById('btn-save-table').style.display = 'none';
        const table = msGetTableByCodeOrId(tableIdOrCode);
        currentTableData = table ? msClone(table) : null;
        document.getElementById('vtt-table-name').innerText = currentTableData ? currentTableData.name : ("Sessão Mestra");
        if (currentTableData && currentTableData.theme) {
            document.getElementById('vtt-theme-select').value = currentTableData.theme;
            previewVttTheme();
        }

        const participants = Array.isArray(currentTableData?.participants) ? currentTableData.participants : [];
        const hydrated = participants
            .map(p => {
                const resolved = msFindCharacterByRef(p.ownerId, p.charId);
                if (!resolved) return null;
                resolved.isMe = String(p.userId) === String(currentUser.id);
                resolved.isNPC = !!resolved.isNPC;
                resolved.ownerId = p.ownerId;
                resolved.sourceOwnerId = p.ownerId;
                resolved.sourceCharId = p.charId;
                resolved.participantUserId = p.userId;
                return resolved;
            })
            .filter(Boolean);

        if (asGM && hydrated.length === 0 && currentUser && Array.isArray(characters) && characters.length) {
            // fallback visual: o mestre vê pelo menos as próprias fichas, sem interferir no sistema.
            characters.forEach(c => {
                const mine = msClone(c);
                mine.isMe = true;
                mine.ownerId = currentUser.id;
                mine.sourceOwnerId = currentUser.id;
                mine.sourceCharId = mine.id;
                hydrated.push(mine);
            });
        }

        if (!asGM && myVttCharIndex !== -1 && characters[myVttCharIndex]) {
            const selected = msClone(characters[myVttCharIndex]);
            const already = hydrated.some(c => String(c.id) === String(selected.id));
            if (!already) {
                selected.isMe = true;
                selected.ownerId = currentUser.id;
                selected.sourceOwnerId = currentUser.id;
                selected.sourceCharId = selected.id;
                hydrated.unshift(selected);
            }
        }

        tablePlayers = hydrated;
    }

    showScreen('screen-vtt');

    document.querySelectorAll('.vtt-floating-window').forEach(el => el.style.display = 'none');
    toggleVttWindow('vtt-chat-box');
    renderVttCards();
}

function renderAncoragem() {
    if (!currentUser) return;
    msSeedRepoStoreFromLegacyCharacters();
    msSeedTablesFromLegacy();
    msSyncCurrentUserView();

    const gmList = document.getElementById('gm-tables-list');
    const plList = document.getElementById('player-tables-list');
    if (!gmList || !plList) return;
    gmList.innerHTML = '';
    plList.innerHTML = '';

    if ((myTables || []).length === 0) {
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

    if ((joinedTables || []).length === 0) {
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

function toggleEditUI() {
    const form = document.getElementById('char-form');
    if (!form) return;
    form.classList.toggle('view-mode', !isEditMode);

    const btn = document.getElementById('btn-toggle-edit');
    if (btn) btn.innerText = isEditMode ? "SALVAR EDIÇÃO" : "INICIAR EDIÇÃO";

    document.querySelectorAll('#char-form input[type="text"], #char-form input[type="number"], #char-form textarea').forEach(el => {
        if (!isEditMode) el.setAttribute('readonly', true);
        else el.removeAttribute('readonly');
    });

    document.querySelectorAll('.choice-card').forEach(el => {
        el.style.pointerEvents = isEditMode ? 'auto' : 'none';
        if (isEditMode) el.classList.remove('locked');
    });

    document.querySelectorAll('.hide-on-view').forEach(el => el.style.display = isEditMode ? '' : 'none');

    const avatarGroup = document.getElementById('upload-avatar-group');
    const galleryGroup = document.getElementById('upload-gallery-group');
    if (avatarGroup) avatarGroup.style.display = '';
    if (galleryGroup) galleryGroup.style.display = '';

    const avatarInput = document.getElementById('input-avatar');
    const galleryInput = document.getElementById('input-gallery');
    if (avatarInput) avatarInput.disabled = !isEditMode;
    if (galleryInput) galleryInput.disabled = !isEditMode;

    if (!isEditMode) {
        document.querySelectorAll('.hide-on-view').forEach(el => {
            if (el.id === 'input-avatar' || el.id === 'input-gallery') return;
            el.style.display = 'none';
        });
    }
}

function buildCharacterPayloadFromBuilder() {
    const skills = [];
    document.querySelectorAll('#skills-list .list-item').forEach(item => skills.push(item.innerHTML));

    const powers = [];
    document.querySelectorAll('#powers-list .list-item').forEach(item => powers.push(item.innerHTML));

    const specificData = {};
    document.querySelectorAll('#specific-content-container input, #specific-content-container select, #specific-content-container textarea').forEach(el => {
        if (el.id) specificData[el.id] = el.value;
    });

    const resources = {};
    document.querySelectorAll('#resource-panel .res-val-input').forEach(inp => {
        resources[inp.getAttribute('data-type')] = inp.value;
    });

    const char = {
        id: editingIndex !== null
            ? ((document.getElementById('screen-vtt').classList.contains('active') && tablePlayers[editingIndex])
                ? (tablePlayers[editingIndex].sourceCharId || tablePlayers[editingIndex].id)
                : (characters[editingIndex]?.id || Date.now()))
            : Date.now(),
        ownerId: currentUser ? currentUser.id : null,
        name: document.getElementById('char-name').value,
        mode: currentMode,
        nature: currentNature,
        className: currentClass,
        avatar: currentAvatarBase64,
        gallery: msClone(currentGallery || []),
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
        equipment: msClone(currentSheetEquipment || []),
        specificData: specificData
    };
    return char;
}

function saveCharacter(e) {
    e.preventDefault();
    if (!isEditMode || !currentUser) return;

    const builder = document.getElementById('screen-builder');
    const payload = buildCharacterPayloadFromBuilder();

    // Edição do mestre dentro da mesa: persiste na ficha real do dono.
    if (builder.classList.contains('overlay') && isVttGM && editingIndex !== null && tablePlayers[editingIndex]) {
        const target = tablePlayers[editingIndex];
        const ownerId = target.sourceOwnerId || target.ownerId || currentUser.id;
        const charId = target.sourceCharId || target.id || payload.id;
        payload.id = charId;
        payload.ownerId = ownerId;
        payload.sourceOwnerId = ownerId;
        payload.sourceCharId = charId;
        tablePlayers[editingIndex] = { ...msClone(target), ...msClone(payload) };
        msPersistCharacterToRepo(payload, ownerId, charId);
        renderVttCards();
        closeBuilder();
        return;
    }

    if (editingIndex !== null) {
        characters[editingIndex] = msClone(payload);
    } else {
        characters.push(msClone(payload));
    }

    saveGlobalCharacters();
    closeBuilder();
}

function syncVttCharacterToOwner(char) {
    if (!char || char.isNPC) return;
    const ownerId = char.sourceOwnerId || char.ownerId || (currentUser ? currentUser.id : null);
    if (!ownerId) return;
    const charId = char.sourceCharId || char.id;
    msPersistCharacterToRepo(char, ownerId, charId);
    msRefreshLegacyCharacterUnion();
}

function loadCharacterToBuilder(index, sourceArray = characters, restrictToIdentity = false) {
    editingIndex = index;
    const char = sourceArray[index];
    currentMode = char.mode || 'exodo';
    populateSelects(currentMode);

    startBuilder(char.mode);

    if (char.nature) selectNature(char.nature);
    if (char.className) selectClass(char.className, true);

    const nameEl = document.getElementById('char-name');
    if (nameEl) nameEl.value = char.name || '';

    if (char.avatar) {
        currentAvatarBase64 = char.avatar;
        document.getElementById('avatar-preview-container').innerHTML = `<img src="${char.avatar}">`;
    } else {
        currentAvatarBase64 = '';
        document.getElementById('avatar-preview-container').innerHTML = '<span style="color:#666; font-size:0.8rem;">Nenhum retrato</span>';
    }

    currentGallery = Array.isArray(char.gallery) ? msClone(char.gallery) : [];
    renderGallery();

    if (char.stats) {
        document.getElementById('attr-for').value = char.stats.for;
        document.getElementById('attr-vig').value = char.stats.vig;
        document.getElementById('attr-agi').value = char.stats.agi;
        document.getElementById('attr-int').value = char.stats.int;
        document.getElementById('attr-prn').value = char.stats.prn;
        document.getElementById('attr-pre').value = char.stats.pre;
    }

    if (char.resources) {
        Object.keys(char.resources).forEach(key => {
            const inp = document.querySelector(`#resource-panel .res-val-input[data-type="${key}"]`);
            if (inp) inp.value = char.resources[key];
        });
    }

    const skillsList = document.getElementById('skills-list');
    skillsList.innerHTML = '';
    if (char.skillsHtml) {
        char.skillsHtml.forEach(skHtml => {
            const div = document.createElement('div');
            div.className = 'list-item';
            if (skHtml.includes('Nativo da')) div.classList.add('locked');
            div.innerHTML = skHtml;
            skillsList.appendChild(div);
        });
    }

    const powersList = document.getElementById('powers-list');
    powersList.innerHTML = '';
    if (char.powersHtml) {
        char.powersHtml.forEach(pwHtml => {
            const div = document.createElement('div');
            div.className = 'list-item';
            div.innerHTML = pwHtml;
            powersList.appendChild(div);
        });
    }

    currentSheetEquipment = Array.isArray(char.equipment) ? msClone(char.equipment) : [];
    renderEquipmentSheet();

    if (restrictToIdentity) {
        document.getElementById('btn-tab-stats').style.display = 'none';
        document.getElementById('btn-tab-skills').style.display = 'none';
        document.getElementById('btn-tab-powers').style.display = 'none';
        document.getElementById('btn-tab-equipment').style.display = 'none';
        isEditMode = false;
        toggleEditUI();
    } else {
        document.getElementById('btn-tab-stats').style.display = '';
        document.getElementById('btn-tab-skills').style.display = '';
        document.getElementById('btn-tab-powers').style.display = '';
        document.getElementById('btn-tab-equipment').style.display = '';
        const inVTTNow = document.getElementById('screen-vtt')?.classList.contains('active');
        isEditMode = !inVTTNow || isVttGM;
        const editBtn = document.getElementById('btn-toggle-edit');
        const saveBtn = document.getElementById('btn-final-save');
        if (inVTTNow && !isVttGM) { if (editBtn) editBtn.style.display='none'; if (saveBtn) saveBtn.style.display='none'; }
        toggleEditUI();
    }

    if (currentNature && String(currentNature).includes('Envolto')) {
        try {
            buildSkillTreeUI(currentNature);
        } catch (err) {
            console.warn('[Mundos Sombrios] Falha ao recriar skill tree do Envolto:', err);
        }
    }
}

function renderGallery() {
    const container = document.getElementById('gallery-container');
    if (!container) return;
    container.innerHTML = '';
    (currentGallery || []).forEach((img, idx) => {
        container.innerHTML += `
            <div class="gallery-thumb">
                <img src="${img}" onclick="viewFullscreen('${img}')">
                ${isEditMode ? `<button type="button" class="delete-btn" onclick="removeGalleryImage(${idx}, event)">X</button>` : ''}
            </div>
        `;
    });
}

function beginNewCharacter() {
    try {
        if (!currentUser) { alert('A sessão do Santuário expirou. Entre novamente no Vazio.'); showScreen('screen-login'); return false; }
        let mode = selectedGameMode;
        if (mode !== 'exodo' && mode !== 'ocultatun') mode = document.getElementById('char-mode')?.value || currentMode || '';
        if (mode !== 'exodo' && mode !== 'ocultatun') { alert('Escolha primeiro o modo de jogo: Êxodo ou Ocultatun.'); showScreen('screen-mode-select'); return false; }
        selectedGameMode = mode;
        try { msSeedRepoStoreFromLegacyCharacters(); msSeedTablesFromLegacy(); msSyncCurrentUserView(); }
        catch (e) { console.warn('[Mundos Sombrios] Falha não-bloqueante no repositório:', e); if (!Array.isArray(characters)) characters=[]; }
        const limit = currentUser.role === 'jogador' ? 5 : 10;
        if (characters.length >= limit) { alert(`O limite de ${limit} almas forjadas foi atingido.`); return false; }
        const required=['char-form','char-name','nature-grid','class-container','specific-content-container'];
        const missing=required.filter(id=>!document.getElementById(id));
        if(missing.length){ console.error('[Mundos Sombrios] Construtor incompleto:',missing); alert('A janela de criação não foi carregada corretamente. Recarregue o site.'); return false; }
        const opened=initBuilderForSelectedMode();
        if(opened !== false) return true;
        currentMode=mode; editingIndex=null; currentAvatarBase64=''; currentGallery=[]; currentPowerDraft=[]; currentSheetEquipment=[]; currentNature=''; currentClass=''; isEditMode=true;
        document.getElementById('char-form').reset(); document.getElementById('char-mode').value=mode; populateSelects(mode); startBuilder(mode); toggleEditUI(); return true;
    } catch(err) { console.error('[Mundos Sombrios] DESPERTAR NOVA ALMA falhou:',err); alert('Não foi possível abrir a criação da ficha. O erro foi registrado no console.'); return false; }
}

function initBuilderForSelectedMode() {
    if (!currentUser) {
        alert('A sessão do Santuário expirou. Entre novamente no Vazio.');
        showScreen('screen-login');
        return false;
    }

    const mode = (selectedGameMode === 'exodo' || selectedGameMode === 'ocultatun')
        ? selectedGameMode
        : (document.getElementById('char-mode')?.value || '');

    if (!mode || !ruleset[mode]) {
        alert('Escolha primeiro o modo de jogo: Êxodo ou Ocultatun.');
        showScreen('screen-mode-select');
        return false;
    }

    msSeedRepoStoreFromLegacyCharacters();
    msSeedTablesFromLegacy();
    msSyncCurrentUserView();

    const LIMIT = currentUser.role === 'jogador' ? 5 : 10;
    if (!Array.isArray(characters)) characters = [];
    if (characters.length >= LIMIT) {
        alert(`O limite de ${LIMIT} almas forjadas foi atingido.`);
        return false;
    }

    const requiredIds = ['char-form', 'char-name', 'nature-grid', 'class-container', 'specific-content-container'];
    const missing = requiredIds.filter(id => !document.getElementById(id));
    if (missing.length) {
        console.error('[Mundos Sombrios] Elementos ausentes no construtor:', missing);
        alert('Não foi possível abrir a criação de ficha porque a janela está incompleta. Recarregue o site.');
        return false;
    }

    editingIndex = null;
    currentAvatarBase64 = '';
    currentGallery = [];
    currentPowerDraft = [];
    currentSheetEquipment = [];
    isEditMode = true;

    document.getElementById('char-form').reset();
    document.getElementById('char-name').value = '';
    document.querySelectorAll('.attr-input').forEach(el => el.value = '0');
    document.getElementById('pts-count').value = '0';
    document.querySelectorAll('.res-val-input').forEach(el => el.value = '');
    document.getElementById('avatar-preview-container').innerHTML = '<span style="color:#666; font-size:0.8rem;">Nenhum retrato</span>';
    document.getElementById('gallery-container').innerHTML = '';
    document.getElementById('skills-list').innerHTML = '';
    document.getElementById('powers-list').innerHTML = '';
    renderEquipmentSheet();
    document.getElementById('specific-content-container').innerHTML = '';
    currentUnlockedNodes = [];
    if (document.getElementById('tree-unlocked-data')) document.getElementById('tree-unlocked-data').value = '';

    selectedGameMode = mode;
    populateSelects(mode);
    if (!startBuilder(mode)) return false;
    toggleEditUI();
    return true;
}


/* =====================================================================
   FINAL PATCH — DESPERTAR NOVA ALMA / ABERTURA ROBUSTA DO CONSTRUTOR
   Este bloco fica no fim do arquivo para ser a implementação efetivamente
   exposta pelo botão, evitando conflitos de versões anteriores da função.
   ===================================================================== */
(function installCharacterCreationGuard(){
    window.beginNewCharacter = function beginNewCharacterFinal(){
        try {
            if (!currentUser) {
                alert('A sessão do Santuário expirou. Entre novamente no Vazio.');
                showScreen('screen-login');
                return false;
            }

            let mode = (selectedGameMode === 'exodo' || selectedGameMode === 'ocultatun')
                ? selectedGameMode
                : ((currentMode === 'exodo' || currentMode === 'ocultatun') ? currentMode : (sessionStorage.getItem('mundosSombriosSelectedMode') || ''));
            if (mode !== 'exodo' && mode !== 'ocultatun') {
                alert('Escolha primeiro o modo de jogo: Êxodo ou Ocultatun.');
                showScreen('screen-mode-select');
                return false;
            }

            // O repositório é atualizado, mas nunca pode impedir a abertura do construtor.
            try {
                if (typeof msEnsureUserRepo === 'function') {
                    const repo = msEnsureUserRepo(currentUser.id);
                    characters = Array.isArray(repo.characters) ? msClone(repo.characters) : [];
                } else if (!Array.isArray(characters)) {
                    characters = [];
                }
            } catch (repoError) {
                console.warn('[Mundos Sombrios] Repositório indisponível; usando visão local da conta.', repoError);
                if (!Array.isArray(characters)) characters = [];
            }

            const limit = currentUser.role === 'jogador' ? 5 : 10;
            if (characters.length >= limit) {
                alert(`O limite de ${limit} almas forjadas foi atingido.`);
                return false;
            }

            const ids = ['screen-builder','char-form','char-mode','char-name','nature-grid',
                         'class-container','specific-content-container','avatar-preview-container',
                         'gallery-container','skills-list','powers-list'];
            const missing = ids.filter(id => !document.getElementById(id));
            if (missing.length) {
                console.error('[Mundos Sombrios] Elementos ausentes na criação:', missing);
                alert('A janela de criação não foi carregada corretamente. Recarregue o site.');
                return false;
            }
            if (typeof ruleset === 'undefined' || !ruleset || !ruleset[mode]) {
                console.error('[Mundos Sombrios] Ruleset indisponível para:', mode);
                alert('As regras do modo escolhido ainda não foram carregadas.');
                return false;
            }

            selectedGameMode = mode;
            currentMode = mode;
            editingIndex = null;
            currentNature = '';
            currentClass = '';
            currentAvatarBase64 = '';
            currentGallery = [];
            currentPowerDraft = [];
            currentSheetEquipment = [];
            currentUnlockedNodes = [];
            isEditMode = true;

            const form = document.getElementById('char-form');
            form.reset();
            document.getElementById('char-mode').value = mode;
            document.getElementById('char-name').value = '';
            const pts = document.getElementById('pts-count');
            if (pts) pts.value = '0';
            document.querySelectorAll('.attr-input').forEach(el => el.value = '0');
            document.querySelectorAll('.res-val-input').forEach(el => el.value = '');
            document.getElementById('avatar-preview-container').innerHTML = '<span style="color:#666;font-size:.8rem">Nenhum retrato</span>';
            document.getElementById('gallery-container').innerHTML = '';
            document.getElementById('skills-list').innerHTML = '';
            document.getElementById('powers-list').innerHTML = '';
            document.getElementById('specific-content-container').innerHTML = '';
            const treeData = document.getElementById('tree-unlocked-data');
            if (treeData) treeData.value = '';

            // Monta as opções diretamente; não depende de initBuilderForSelectedMode.
            if (typeof populateSelects === 'function') populateSelects(mode);
            if (typeof startBuilder === 'function') {
                if (startBuilder(mode) === false) throw new Error('startBuilder recusou o modo ' + mode);
            } else {
                throw new Error('startBuilder não está disponível');
            }

            // Garantia final: a tela é aberta mesmo que uma rotina visual secundária falhe.
            const builder = document.getElementById('screen-builder');
            builder.classList.remove('overlay');
            builder.classList.add('active');
            builder.style.zIndex = '1500';
            if (typeof openTab === 'function') openTab('tab-identity');
            if (typeof toggleEditUI === 'function') toggleEditUI();
            return true;
        } catch (err) {
            console.error('[Mundos Sombrios] Falha definitiva em DESPERTAR NOVA ALMA:', err);
            // Último fallback: abre a janela e deixa a ficha limpa, sem perder a sessão.
            try {
                const builder = document.getElementById('screen-builder');
                if (builder) {
                    builder.classList.remove('overlay');
                    builder.classList.add('active');
                    builder.style.zIndex = '1500';
                }
                const form = document.getElementById('char-form');
                if (form) form.reset();
                const mode = (selectedGameMode === 'exodo' || selectedGameMode === 'ocultatun') ? selectedGameMode : 'exodo';
                const modeInput = document.getElementById('char-mode');
                if (modeInput) modeInput.value = mode;
                if (typeof openTab === 'function') openTab('tab-identity');
                if (typeof toggleEditUI === 'function') toggleEditUI();
                return true;
            } catch (fallbackError) {
                console.error('[Mundos Sombrios] Fallback do construtor falhou:', fallbackError);
                alert('Não foi possível abrir a criação da ficha. Recarregue o site e tente novamente.');
                return false;
            }
        }
    };
})();


/* ============================================================
   CÓDICE DOS MUNDOS — BIBLIOTECAS ÊXODO / OCULTATON
   ============================================================ */
(function initWorldCodex() {
  const screen = document.getElementById('screen-codex');
  if (!screen || screen.dataset.codexV2 === '1') return;
  screen.dataset.codexV2 = '1';

  const files = {
    exodo: [
      {
        name: 'Livro Base — Êxodo',
        description: 'Livro-base e regras do modo de jogo Êxodo.',
        file: 'assets/codices/Livro-Base-Exodo.pdf',
        kind: 'Livro Base'
      }
    ],
    ocultaton: [
      {
        name: 'Livro Base — Ocultaton',
        description: 'Livro-base e regras do modo de jogo Ocultaton.',
        file: 'assets/codices/Livro-Base-Ocultatun.pdf',
        kind: 'Livro Base'
      }
    ]
  };

  const state = { library: null };

  function esc(v) {
    return String(v).replace(/[&<>"']/g, c => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[c]));
  }

  function renderHub() {
    state.library = null;
    screen.innerHTML = `
      <section class="codex-hub">
        <h1 class="codex-hub-title">Códices dos Mundos</h1>
        <p class="codex-hub-subtitle">
          Escolha a biblioteca do modo de jogo que deseja consultar.
          Cada biblioteca reúne seu livro-base e suas futuras expansões.
        </p>
        <div class="codex-library-choice">
          <article class="codex-mode-card exodo" data-library="exodo">
            <h2>Êxodo</h2>
            <p>Assimilação, evolução biológica, tecnologia e sobrevivência em uma realidade transformada.</p>
            <button class="codex-enter">Acessar Biblioteca</button>
          </article>
          <article class="codex-mode-card ocultaton" data-library="ocultaton">
            <h2>Ocultaton</h2>
            <p>Horror paranormal, ocultismo, entidades e fenômenos além da compreensão humana.</p>
            <button class="codex-enter">Acessar Biblioteca</button>
          </article>
        </div>
      </section>`;
    screen.querySelectorAll('[data-library]').forEach(el => {
      el.addEventListener('click', () => renderLibrary(el.dataset.library));
    });
  }

  function renderLibrary(mode) {
    state.library = mode;
    const title = mode === 'exodo' ? 'Biblioteca Êxodo' : 'Biblioteca Ocultaton';
    const desc = mode === 'exodo'
      ? 'Arquivo de ficção científica e assimilação.'
      : 'Arquivo de horror paranormal e ocultismo.';
    const list = files[mode] || [];
    screen.innerHTML = `
      <section class="codex-library ${mode}">
        <header class="codex-library-header">
          <button class="codex-back" type="button">← Códices</button>
          <div>
            <h2>${title}</h2>
            <div>${desc}</div>
          </div>
        </header>
        <div class="codex-file-grid">
          ${list.map((f,i) => `
            <article class="codex-file-card">
              <small>${esc(f.kind)}</small>
              <h3>${esc(f.name)}</h3>
              <p>${esc(f.description)}</p>
              <button class="codex-read" data-index="${i}" type="button">Ler no Códice</button>
            </article>`).join('')}
        </div>
      </section>`;
    screen.querySelector('.codex-back').addEventListener('click', renderHub);
    screen.querySelectorAll('.codex-read').forEach(btn => {
      btn.addEventListener('click', () => openReader(list[Number(btn.dataset.index)]));
    });
  }

  function openReader(file) {
    const old = document.querySelector('.codex-reader');
    if (old) old.remove();
    const reader = document.createElement('div');
    reader.className = 'codex-reader';
    reader.innerHTML = `
      <header class="codex-reader-header">
        <strong class="codex-reader-title">${esc(file.name)}</strong>
        <button class="codex-back" type="button">Fechar</button>
      </header>
      <iframe title="${esc(file.name)}" src="${encodeURI(file.file)}"></iframe>`;
    document.body.appendChild(reader);
    reader.querySelector('button').addEventListener('click', () => reader.remove());
  }

  // Expose a small hook so the existing navigation can open the hub.
  window.openWorldCodex = renderHub;

  // If the existing screen is opened normally, initialize the hub.
  renderHub();
})();

// =====================================================================
// V0.9 — RITUAIS HERMÉTICOS + FORJA MULTISSISTEMA
// =====================================================================
(function(){
    window.currentHermeticRituals = window.currentHermeticRituals || [];
    window.msForgeContext = 'vtt'; // 'vtt' | 'sheet'

    const ritualStateMap = () => Object.fromEntries((window.currentHermeticRituals || []).map(r => [r.id, r]));
    const esc = s => (typeof escHtml === 'function' ? escHtml(String(s ?? '')) : String(s ?? ''));

    function hermeticCharacterActive(){
        return currentMode === 'ocultatun' && currentNature === 'Agente Designado (Ocultatun)' && currentClass === 'Hermético';
    }

    function ritualLimits(){
        const int = Number(document.getElementById('attr-int')?.value || 0);
        const prn = Number(document.getElementById('attr-prn')?.value || 0);
        return { known: Math.max(0, int + 3), sync: Math.max(0, int + prn) };
    }

    function normalizeRitualState(list){
        const raw = Array.isArray(list) ? list : [];
        const valid = [];
        raw.forEach(x => {
            const id = typeof x === 'string' ? x : x?.id;
            const ritual = hermeticRitualById(id);
            if (!ritual) return;
            valid.push({ id: ritual.id, known: x?.known !== false, synchronized: !!x?.synchronized });
        });
        return valid;
    }

    window.renderHermeticRituals = function(){
        const panel = document.getElementById('tab-rituals');
        const btn = document.getElementById('btn-tab-rituals');
        if (!panel || !btn) return;
        const active = hermeticCharacterActive();
        btn.style.display = active ? '' : 'none';
        panel.style.display = active ? '' : 'none';
        if (!active) return;

        const limits = ritualLimits();
        const state = ritualStateMap();
        const knownCount = Object.values(state).filter(r => r.known).length;
        const syncCount = Object.values(state).filter(r => r.synchronized).length;
        const knownEl = document.getElementById('hermetic-known-count');
        const syncEl = document.getElementById('hermetic-sync-count');
        if (knownEl) knownEl.textContent = `${knownCount}/${limits.known}`;
        if (syncEl) syncEl.textContent = `${syncCount}/${limits.sync}`;

        const query = (document.getElementById('hermetic-ritual-search')?.value || '').trim().toLowerCase();
        const filter = document.getElementById('hermetic-ritual-filter')?.value || 'all';
        const grid = document.getElementById('hermetic-ritual-grid');
        if (!grid) return;
        grid.innerHTML = '';

        HERMETIC_RITUALS.forEach(r => {
            const st = state[r.id] || { id:r.id, known:false, synchronized:false };
            const hay = `${r.number} ${r.name} ${r.material} ${r.gesture} ${r.verbal} ${r.effect}`.toLowerCase();
            if (query && !hay.includes(query)) return;
            if (filter === 'known' && !st.known) return;
            if (filter === 'synchronized' && !st.synchronized) return;
            if (filter === 'available' && (st.known || st.synchronized)) return;
            const article = document.createElement('article');
            article.className = `ritual-card ${st.known?'is-known':''} ${st.synchronized?'is-synchronized':''}`;
            article.innerHTML = `
                <div class="ritual-card-head">
                    <div class="ritual-sigil" title="Sigilo ${r.number}">${r.sigil}</div>
                    <div class="ritual-title-wrap"><span class="ritual-number">RITUAL ${String(r.number).padStart(2,'0')} · CAP ${r.cap}</span><h4>${esc(r.name)}</h4><span class="ritual-cost">${r.epCost} EP</span></div>
                </div>
                <div class="ritual-card-body">
                    <p><b>Material:</b> ${esc(r.material)}</p>
                    <p><b>Gesto:</b> ${esc(r.gesture)}</p>
                    <p><b>Verbo:</b> <em>${esc(r.verbal)}</em></p>
                    <p><b>Salvaguarda:</b> ${esc(r.save)}</p>
                    <p><b>Tempo:</b> ${esc(r.time)}</p>
                    <p class="ritual-effect"><b>Efeito:</b> ${esc(r.effect)}</p>
                </div>
                <div class="ritual-card-actions hide-on-view">
                    <label><input type="checkbox" class="ritual-known-toggle" data-id="${r.id}" ${st.known?'checked':''}> Conhecido</label>
                    <label><input type="checkbox" class="ritual-sync-toggle" data-id="${r.id}" ${st.synchronized?'checked':''}> Sintonizado</label>
                </div>`;
            grid.appendChild(article);
        });

        grid.querySelectorAll('.ritual-known-toggle').forEach(cb => cb.addEventListener('change', function(){
            const id = this.dataset.id;
            let row = state[id];
            if (!row) row = {id, known:false, synchronized:false};
            row.known = this.checked;
            if (!this.checked) row.synchronized = false;
            state[id] = row;
            window.currentHermeticRituals = Object.values(state);
            renderHermeticRituals();
            toggleEditUI();
        }));
        grid.querySelectorAll('.ritual-sync-toggle').forEach(cb => cb.addEventListener('change', function(){
            const id = this.dataset.id;
            let row = state[id];
            if (!row) row = {id, known:true, synchronized:false};
            if (this.checked) {
                if (!row.known) row.known = true;
                const already = Object.values(state).filter(x => x.synchronized).length;
                if (!row.synchronized && already >= limits.sync) {
                    this.checked = false;
                    return alert(`O Hermético só pode manter ${limits.sync} ritual(is) sintonizado(s) com INT ${Number(document.getElementById('attr-int')?.value||0)} + PRN ${Number(document.getElementById('attr-prn')?.value||0)}.`);
                }
            }
            row.synchronized = this.checked;
            state[id] = row;
            window.currentHermeticRituals = Object.values(state);
            renderHermeticRituals();
            toggleEditUI();
        }));
    };

    window.setHermeticRituals = function(list){
        window.currentHermeticRituals = normalizeRitualState(list);
        renderHermeticRituals();
    };

    window.syncHermeticRitualUI = function(){
        const active = hermeticCharacterActive();
        const btn = document.getElementById('btn-tab-rituals');
        const tab = document.getElementById('tab-rituals');
        if (btn) btn.style.display = active ? '' : 'none';
        if (tab) tab.style.display = active ? '' : 'none';
        if (active) renderHermeticRituals();
    };

    // Capture existing builder hooks and extend them.
    const _selectNature = window.selectNature;
    window.selectNature = function(natureName){
        const result = _selectNature.call(this, natureName);
        window.currentHermeticRituals = [];
        syncHermeticRitualUI();
        return result;
    };
    const _selectClass = window.selectClass;
    window.selectClass = function(className, skipAutofill=false){
        const result = _selectClass.call(this, className, skipAutofill);
        syncHermeticRitualUI();
        if (hermeticCharacterActive()) {
            const desc = document.getElementById('subclass-description');
            if (desc) desc.innerText = `${classDescDict[className] || 'Arquiteto da Simetria.'}\n\nCódice: INT + 3 rituais conhecidos · Sintonia: INT + PRN · Custo padrão: Capacidade × 2 EP.`;
        }
        return result;
    };
    const _initBuilder = window.initBuilderForSelectedMode;
    window.initBuilderForSelectedMode = function(){
        const result = _initBuilder.apply(this, arguments);
        if (result) { window.currentHermeticRituals = []; syncHermeticRitualUI(); }
        return result;
    };
    const _toggleEditUI = window.toggleEditUI;
    window.toggleEditUI = function(){
        const result = _toggleEditUI.apply(this, arguments);
        document.querySelectorAll('#tab-rituals input[type="checkbox"]').forEach(el => el.disabled = !isEditMode);
        return result;
    };
    const _buildPayload = window.buildCharacterPayloadFromBuilder;
    window.buildCharacterPayloadFromBuilder = function(){
        const payload = _buildPayload.apply(this, arguments);
        payload.rituals = msClone(window.currentHermeticRituals || []);
        payload.hermeticRitualLimits = ritualLimits();
        return payload;
    };
    const _loadCharacter = window.loadCharacterToBuilder;
    window.loadCharacterToBuilder = function(){
        const result = _loadCharacter.apply(this, arguments);
        const sourceArray = arguments[1] || characters;
        const index = arguments[0];
        const char = sourceArray[index];
        window.currentHermeticRituals = normalizeRitualState(char?.rituals || []);
        syncHermeticRitualUI();
        if (arguments[2]) {
            const ritualBtn=document.getElementById('btn-tab-rituals'), ritualTab=document.getElementById('tab-rituals');
            if (ritualBtn) ritualBtn.style.display='none';
            if (ritualTab) ritualTab.style.display='none';
        }
        renderEquipmentSheet();
        return result;
    };

    // -----------------------------------------------------------------
    // Equipment normalization + mode-accurate forge schemas.
    // -----------------------------------------------------------------
    window.normalizeEquipment = function(item){
        const x = msClone(item || {});
        x.id = x.id || `eq-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
        x.name = x.name || 'Item sem nome';
        x.category = x.category || 'Equipamento';
        x.effect = x.effect || '';
        x.source = x.source || 'Inventário';
        if (x.pe !== undefined && x.pe !== null && x.pe !== '' && !isNaN(Number(x.pe))) x.pe = Number(x.pe);
        if (x.stage !== undefined && x.stage !== null && x.stage !== '' && !isNaN(Number(x.stage))) x.stage = Number(x.stage);
        if (x.charges !== undefined && x.charges !== null && x.charges !== '' && !isNaN(Number(x.charges))) x.charges = Number(x.charges);
        return x;
    };

    function charModeNature(char){
        const nature = char?.nature || currentNature || '';
        const mode = char?.mode || currentMode || (nature.includes('Ocultatun') || nature.includes('Envolto') || nature.includes('Ordem dos Sete') ? 'ocultatun' : 'exodo');
        return { mode, nature };
    }

    window.currentBuilderCharacter = function(){
        return {
            mode: currentMode || document.getElementById('char-mode')?.value || 'exodo',
            nature: currentNature || document.getElementById('char-nature')?.value || '',
            className: currentClass || document.getElementById('char-class')?.value || '',
            name: document.getElementById('char-name')?.value || '',
            stats: {
                for:Number(document.getElementById('attr-for')?.value||0),
                vig:Number(document.getElementById('attr-vig')?.value||0),
                agi:Number(document.getElementById('attr-agi')?.value||0),
                int:Number(document.getElementById('attr-int')?.value||0),
                prn:Number(document.getElementById('attr-prn')?.value||0),
                pre:Number(document.getElementById('attr-pre')?.value||0)
            }
        };
    };

    function forgeSchema(char){
        const {mode,nature} = charModeNature(char);
        if (nature === 'O Envolto (Horror Cósmico)') return {
            key:'envolto', mode:'ocultatun',
            title:'Engenharia do Blasfemo',
            subtitle:'Chassi Profano + Enxerto Aberrante + Válvula de Potência + Gatilho de Falha.',
            chassis:[['Ligeiro',2],['Padrão',5],['Massivo',8],['Proteção',4]],
            vectors:[], categories:['Artefato Blasfemo'],
            specials:true
        };
        if (nature === 'A Ordem dos Sete (Alta Glória)') return {
            key:'ordem', mode:'ocultatun',
            title:'Forja das Dádivas',
            subtitle:'Chassi Divino + Vetores de Ascensão + Estágio + Propósito Sagrado.',
            chassis:[['Ligeiro',2],['Padrão',5],['Massivo',8],['Proteção',4],['Utilitário',3]],
            vectors:['Arkhé','Ex-Nihilo','Poesis Pleroma'], categories:['Dádiva'],
            specials:true
        };
        if (mode === 'exodo') return {
            key:'exodo', mode:'exodo',
            title:'Forja de Dispositivos de Êxodo',
            subtitle:'Chassi + Vetores de Função (VF) + Estágio (ES) + MCP + Extras.',
            chassis:[['Equipamento',5],['Dispositivo',15],['Resquício',40]],
            vectors:['Emissão','Cinético','Biótico','Psíquico','Sensorial','Temporal','Contenção'], categories:['Equipamento','Dispositivo','Resquício'],
            specials:true
        };
        return {
            key:'ocultatun', mode:'ocultatun',
            title:'Forja da Ocultatun',
            subtitle:'Chassi + Vetores de Manifestação (VM) + Estágio (ES) + Categoria.',
            chassis:[['Ligeiro',2],['Padrão',5],['Massivo',8],['Proteção',4],['Utilitário',3]],
            vectors:(lists?.ocultatun?.powers?.['Agente Designado (Ocultatun)']||['Destrutiva','Fluxo','Fissura','Decadência','Manipulação','Propagação','Pactual','Quebra']),
            categories:['Ritualístico','Anômalo'], specials:true
        };
    }

    function refreshForgeFields(char){
        const schema = forgeSchema(char);
        const chassisEl = document.getElementById('forge-chassis');
        const categoryEl = document.getElementById('forge-category');
        const vectorsEl = document.getElementById('forge-vectors');
        const labelChassis = document.querySelector('#forge-chassis')?.closest('.form-group')?.querySelector('label');
        const labelCat = document.querySelector('#forge-category')?.closest('.form-group')?.querySelector('label');
        const labelVec = document.querySelector('#forge-vectors')?.closest('.form-group')?.querySelector('label');
        if (labelChassis) labelChassis.textContent = schema.key==='exodo' ? 'Categoria de item / chassi' : 'Chassi';
        if (labelCat) labelCat.textContent = schema.key==='ocultatun' ? 'Categoria de Item' : schema.key==='envolto' ? 'Natureza da Forja' : schema.key==='ordem' ? 'Categoria' : 'Categoria';
        if (labelVec) labelVec.textContent = schema.key==='exodo' ? 'Vetores de Função (VF)' : schema.key==='ocultatun' ? 'Vetores de Manifestação (VM)' : 'Vetores de Ascensão';
        chassisEl.innerHTML = schema.chassis.map(([name,pe])=>`<option value="${esc(name)}" data-pe="${pe}">${esc(name)} — ${pe} PE</option>`).join('');
        categoryEl.innerHTML = schema.categories.map(cat=>`<option value="${esc(cat)}">${esc(cat)}${cat==='Ritualístico'?' — desconto de 5 PE':''}${cat==='Anômalo'?' — custo integral':''}</option>`).join('');
        vectorsEl.innerHTML = schema.vectors.map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join('');
        const target = document.getElementById('forge-recipient')?.closest('.form-group');
        if(target) target.style.display = msForgeContext==='sheet' ? 'none' : '';
        const stageWrap = document.getElementById('forge-stage')?.closest('.form-group');
        if(stageWrap) stageWrap.style.display = schema.key==='envolto' ? 'none' : '';
        const vectorWrap = document.getElementById('forge-vectors')?.closest('.form-group');
        if(vectorWrap) vectorWrap.style.display = schema.vectors.length ? '' : 'none';
        const ex = document.getElementById('forge-exodo-fields');
        const en = document.getElementById('forge-envolto-fields');
        const or = document.getElementById('forge-ordem-fields');
        if(ex) ex.style.display = schema.key==='exodo' ? '' : 'none';
        if(en) en.style.display = schema.key==='envolto' ? '' : 'none';
        if(or) or.style.display = schema.key==='ordem' ? '' : 'none';
        const categoryWrap = categoryEl?.closest('.form-group');
        if(categoryWrap) categoryWrap.style.display = schema.categories.length ? '' : 'none';
        updateForgeCost();
    }

    function getForgeVectorValues(){ return [...document.getElementById('forge-vectors')?.selectedOptions || []].map(o=>o.value); }

    window.updateForgeCost = function(){
        const targetChar = msForgeContext==='sheet' ? currentBuilderCharacter() : getVttCharById(document.getElementById('forge-recipient')?.value) || currentBuilderCharacter();
        const schema = forgeSchema(targetChar);
        const ch = document.getElementById('forge-chassis');
        const base = Number(ch?.selectedOptions?.[0]?.dataset?.pe || 0);
        const stage = Math.min(10, Math.max(1, Number(document.getElementById('forge-stage')?.value || 1)));
        const vectors = getForgeVectorValues();
        let total = base;
        let lines = [`Chassi ${base} PE`];
        let details = {};

        if(schema.key==='exodo'){
            const vectorPE = vectors.length*5, esPE=stage*2;
            const mm=Number(document.getElementById('forge-mcp-multi')?.value||0);
            const me=Number(document.getElementById('forge-mcp-effect')?.value||0);
            const mcp=(mm||me) ? Math.max(10,3*mm)+2*me : 0;
            const extras=Number(document.getElementById('forge-extras')?.value||0);
            total += vectorPE+esPE+mcp+extras;
            details={vectorPE,esPE,mcp,extras};
            lines.push(`${vectorPE} PE VF`, `${esPE} PE ES ${stage}`, `${mcp} PE MCP`, `${extras} PE Extras`);
        } else if(schema.key==='ocultatun'){
            const vectorPE=vectors.length*5, esPE=stage*2, discount=document.getElementById('forge-category')?.value==='Ritualístico'?-5:0;
            total += vectorPE+esPE+discount;
            details={vectorPE,esPE,discount};
            lines.push(`${vectorPE} PE VM`, `${esPE} PE ES ${stage}`, `${discount} PE categoria`);
        } else if(schema.key==='envolto'){
            const residueCost=Number(document.getElementById('forge-residue')?.selectedOptions?.[0]?.dataset?.pe||0);
            const valve=Number(document.getElementById('forge-valve')?.value||0);
            const valveCost=[0,6,12][Math.max(0,Math.min(2,valve))]||0;
            const curse=document.getElementById('forge-curse')?.value ? -5 : 0;
            total += residueCost+valveCost+curse;
            details={residueCost,valveCost,curse,valve};
            lines.push(`${residueCost} PE enxerto`, `${valveCost} PE válvula T${valve}`, `${curse} PE maldição`);
        } else if(schema.key==='ordem'){
            const vectorPE=vectors.length*5, esPE=stage*2;
            total += vectorPE+esPE;
            details={vectorPE,esPE};
            lines.push(`${vectorPE} PE Ascensões`, `${esPE} PE ES ${stage}`);
        }
        const preview=document.getElementById('forge-preview');
        if(preview) preview.innerHTML=`<b>Custo estimado: ${total} PE</b><span>${lines.map(esc).join(' · ')}</span>`;
        return {schema,base,stage,vectors,total,details};
    };

    function buildForgeItem(target){
        const calc=updateForgeCost();
        const schema=calc.schema;
        const name=document.getElementById('forge-name')?.value.trim();
        if(!name) throw new Error('Defina o nome do item.');
        const chassis=document.getElementById('forge-chassis').value;
        const effect=document.getElementById('forge-effect').value.trim();
        const item={id:`eq-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,name,chassis,pe:calc.total,effect,source:'Forja oficial do site',system:schema.key};
        if(schema.key==='exodo'){
            const mm=Number(document.getElementById('forge-mcp-multi')?.value||0), me=Number(document.getElementById('forge-mcp-effect')?.value||0), stage=calc.stage;
            item.category=document.getElementById('forge-category').value;
            item.stage=stage; item.vectors=calc.vectors; item.integrity=Math.round(10+Number(document.getElementById('forge-chassis').selectedOptions[0].dataset.pe||0)/2);
            item.saturation=calc.vectors.reduce((sum,v)=>sum+({Emissão:4,'Cinético':2,Biótico:3,Psíquico:5,Sensorial:1,Temporal:5,Contenção:2}[v]||0),0)+(mm||me?2:0);
            item.mcp={multi:3*mm,effect:2*me}; item.extras=Number(document.getElementById('forge-extras')?.value||0);
        } else if(schema.key==='ocultatun'){
            item.category=document.getElementById('forge-category').value; item.stage=calc.stage; item.vectors=calc.vectors;
            const vig=Number(target?.stats?.vig||document.getElementById('attr-vig')?.value||0); item.charges=10+vig-calc.stage;
            item.activation=item.category==='Anômalo'?'Ao ativar: 1d4 Dano Mental (Sanidade) ou -5 PV.':'Após a missão, teste de degradação; o item ritualístico pode enferrujar/perder potência.';
        } else if(schema.key==='envolto'){
            item.category='Artefato Blasfemo'; item.residue=document.getElementById('forge-residue').value; item.valveTier=Number(document.getElementById('forge-valve').value||0); item.curse=document.getElementById('forge-curse').value || '';
            item.integrity={pv:Math.max(10,Math.round(10+(Number(document.getElementById('forge-chassis').selectedOptions[0].dataset.pe||0)*1.5))),rd:item.chassis==='Proteção'?10:5};
            item.activation='Canaliza a Energia do Envolto/EE do usuário conforme a válvula instalada.';
        } else if(schema.key==='ordem'){
            item.category='Dádiva'; item.stage=calc.stage; item.vectors=calc.vectors; item.purpose=document.getElementById('forge-purpose').value.trim();
            if(!item.purpose) throw new Error('A Dádiva exige um Propósito Sagrado.');
            const vig=Number(target?.stats?.vig||document.getElementById('attr-vig')?.value||0); item.charges=10+vig-calc.stage; item.forgeDC=10+calc.stage; item.recordacaoMin=25;
        }
        return normalizeEquipment(item);
    }

    window.openForgeForCurrentSheet = function(){
        msForgeContext='sheet';
        const modal=document.getElementById('forge-modal'); if(!modal)return;
        document.getElementById('forge-name').value=''; document.getElementById('forge-stage').value='1'; document.getElementById('forge-effect').value='';
        document.getElementById('forge-eyebrow').textContent='ARSENAL · FORJA DE FICHA';
        const schema=forgeSchema(currentBuilderCharacter());
        document.getElementById('forge-title').textContent=schema.title;
        document.getElementById('forge-subtitle').textContent=schema.subtitle;
        refreshForgeFields(currentBuilderCharacter());
        populateForgeRecipients();
        modal.style.display='flex';
    };

    window.openForgeWindow = function(){
        msForgeContext='vtt';
        const modal=document.getElementById('forge-modal'); if(!modal)return;
        const mode=getTableGameMode();
        const first=getVttCharById(document.getElementById('forge-recipient')?.value) || tablePlayers.find(p=>!p.isNPC) || {mode};
        const schema=forgeSchema(first);
        document.getElementById('forge-name').value=''; document.getElementById('forge-stage').value='1'; document.getElementById('forge-effect').value='';
        document.getElementById('forge-eyebrow').textContent='FORJA MULTISSISTEMA · PE';
        document.getElementById('forge-title').textContent=schema.title;
        document.getElementById('forge-subtitle').textContent=schema.subtitle;
        refreshForgeFields(first);
        populateForgeRecipients();
        modal.style.display='flex';
    };

    window.populateForgeRecipients = function(){
        const s=document.getElementById('forge-recipient'); if(!s)return;
        const mode=getTableGameMode();
        const targetList=tablePlayers.filter(p=>!p.isNPC);
        s.innerHTML=targetList.map(p=>`<option value="${esc(p.id)}">${esc(p.name)} · ${esc(p.nature||p.mode||mode)}</option>`).join('');
        if(!s.innerHTML) s.innerHTML='<option value="">Nenhum jogador compatível</option>';
        s.onchange=()=>{ if(msForgeContext==='vtt'){ const c=getVttCharById(s.value); const schema=forgeSchema(c||{}); document.getElementById('forge-title').textContent=schema.title; document.getElementById('forge-subtitle').textContent=schema.subtitle; refreshForgeFields(c||{}); } };
    };

    window.forgeItemForTable = function(){
        try{
            const target = msForgeContext==='sheet' ? currentBuilderCharacter() : getVttCharById(document.getElementById('forge-recipient')?.value);
            if(msForgeContext==='vtt' && !target) throw new Error('Defina um destinatário.');
            const item=buildForgeItem(target);
            if(msForgeContext==='sheet'){
                currentSheetEquipment.push(item);
                renderEquipmentSheet();
                closeForgeWindow();
                alert(`${item.name} foi adicionado à ficha. O custo calculado é ${item.pe} PE.`);
            } else {
                target.equipment=Array.isArray(target.equipment)?target.equipment:[];
                target.equipment.push(item);
                syncVttCharacterToOwner(target);
                currentTableData=currentTableData||{};
                currentTableData.forgedItems=Array.isArray(currentTableData.forgedItems)?currentTableData.forgedItems:[];
                currentTableData.forgedItems.push(item);
                renderVttCards(); renderVttEquipment(); renderEquipmentShop(); closeForgeWindow();
                alert(`${item.name} foi forjado e entregue a ${target.name}.`);
            }
        }catch(e){ alert(e.message || 'Não foi possível concluir a forja.'); }
    };

    window.closeForgeWindow = function(){ const m=document.getElementById('forge-modal'); if(m)m.style.display='none'; };

    // The existing equipment profile is refined so all four equipment architectures remain distinct.
    window.getEquipmentProfile = function(char=currentBuilderCharacter()){
        const {mode,nature}=charModeNature(char);
        if(nature==='O Envolto (Horror Cósmico)') return {mode,key:'envolto',eyebrow:'OCULTATUN · ENVOLTO',title:'Engenharia do Blasfemo',subtitle:'Chassi Profano, Resíduo Ontológico, Válvula de Potência e Gatilho de Falha.',addTitle:'Registrar Artefato Blasfemo',addSubtitle:'Use a forja para calcular o PE e registrar enxertos do Espaço Final.',labels:['Nome do artefato','Categoria / chassi','Resíduo / válvula / maldição','Efeito / corrupção'],placeholders:['Ex.: Lâmina que Chora','Artefato Blasfemo · Padrão','Carne Estática · T1 · Fome','Descrição e falha'],fields:'envolto'};
        if(nature==='A Ordem dos Sete (Alta Glória)') return {mode,key:'ordem',eyebrow:'OCULTATUN · ORDEM DOS SETE',title:'Dádivas Forjadas',subtitle:'Chassi Divino + Ascensões + Estágio + Propósito; cargas de integridade e Estase Dimensional.',addTitle:'Registrar Dádiva',addSubtitle:'Dádivas são estáveis e exigem Propósito Sagrado.',labels:['Nome da Dádiva','Chassi / categoria','Ascensões · ES · cargas','Propósito / efeito'],placeholders:['Ex.: Lança da Revelação','Dádiva · Padrão','Arkhé + Ex-Nihilo · ES 4','Propósito e efeito'],fields:'ordem'};
        if(mode==='exodo') return {mode,key:'exodo',eyebrow:'ÊXODO · ENGENHARIA',title:'Dispositivos & Equipamentos',subtitle:'PE = Chassi + VF + ES + MCP + Extras. O inventário acompanha o sistema técnico de Êxodo.',addTitle:'Registrar equipamento de Êxodo',addSubtitle:'Use a Forja para calcular PE, VF, ES, MCP e Integridade.',labels:['Nome do item','Categoria / tipo','PE · VF · ES · MCP','Efeito / função'],placeholders:['Ex.: Braçadeira Neurocinética','Dispositivo · VF Cinético','28 PE · ES 4 · MCP 0','Descrição'],fields:'exodo'};
        return {mode:'ocultatun',key:'ocultatun',eyebrow:'OCULTATUN · ARSENAL',title:'Arsenal Anômalo & Ritualístico',subtitle:'PE = Chassi + VM + ES + Categoria. Cargas e Gamma Lock pertencem ao próprio item.',addTitle:'Registrar equipamento da Ocultatun',addSubtitle:'Use a Forja para calcular Chassi, VM, ES e categoria.',labels:['Nome do item','Categoria / tipo','PE · ES · Cargas','Efeito / VM / observações'],placeholders:['Lâmina, rifle, dispositivo...','Ritualístico ou Anômalo · Chassi','Ex.: 11 PE · ES 3 · 10 cargas','Descrição'],fields:'ocultatun'};
    };
    window.applyEquipmentProfile = function(char=currentBuilderCharacter()){
        const p=getEquipmentProfile(char); const set=(id,val)=>{const e=document.getElementById(id); if(e)e.textContent=val;};
        set('equipment-sheet-eyebrow',p.eyebrow); set('equipment-sheet-title',p.title); set('equipment-sheet-subtitle',p.subtitle); set('equipment-add-eyebrow',p.eyebrow); set('equipment-add-title',p.addTitle); set('equipment-add-subtitle',p.addSubtitle);
        ['name','type','meta','effect'].forEach((k,i)=>{set(`sheet-eq-${k}-label`,p.labels[i]); const e=document.getElementById(`sheet-eq-${k}`); if(e)e.placeholder=p.placeholders[i];});
        const profile=document.getElementById('equipment-sheet-profile');
        if(profile){
            const data={
                exodo:['PE técnico','Chassi + VF + ES','MCP + Extras','Integridade / Saturação'],
                ocultatun:['PE de Arsenal','Chassi + VM + ES','Ritualístico / Anômalo','Cargas / Gamma Lock'],
                envolto:['PE blasfemo','Chassi + Resíduo','Válvula + Maldição','PV/RD do artefato'],
                ordem:['PE sagrado','Chassi + Ascensões','ES + Propósito','Cargas / Estase']
            }[p.key] || [];
            profile.innerHTML=data.map(x=>`<span>${esc(x)}</span>`).join('');
        }
    };
    window.renderEquipmentSheet = function(){
        const c=document.getElementById('equipment-sheet-list'); if(!c)return;
        applyEquipmentProfile(); c.innerHTML='';
        if(!currentSheetEquipment.length){ c.innerHTML='<div class="equipment-empty">Nenhum item registrado nesta ficha.</div>'; return; }
        const p=getEquipmentProfile();
        currentSheetEquipment.forEach((it,i)=>{
            let meta='';
            if(p.key==='exodo') meta=`<span><b>PE</b>${esc(it.pe??'—')}</span><span><b>ES</b>${esc(it.stage??'—')}</span><span><b>VF</b>${esc((it.vectors||[]).join(', ')||'—')}</span><span><b>Int.</b>${esc(it.integrity??'—')}</span>`;
            else if(p.key==='ocultatun') meta=`<span><b>PE</b>${esc(it.pe??'—')}</span><span><b>ES</b>${esc(it.stage??'—')}</span><span><b>Cargas</b>${esc(it.charges??'—')}</span><span><b>Cat.</b>${esc(it.category||'—')}</span>`;
            else if(p.key==='envolto') meta=`<span><b>PE</b>${esc(it.pe??'—')}</span><span><b>Resíduo</b>${esc(it.residue||'—')}</span><span><b>Válvula</b>T${esc(it.valveTier??0)}</span><span><b>Falha</b>${esc(it.curse||'—')}</span>`;
            else meta=`<span><b>PE</b>${esc(it.pe??'—')}</span><span><b>ES</b>${esc(it.stage??'—')}</span><span><b>Cargas</b>${esc(it.charges??'—')}</span><span><b>Propósito</b>${esc(it.purpose||'—')}</span>`;
            c.innerHTML += `<article class="equipment-item-card ${it.category==='Anômalo'||it.system==='envolto'?'anomalous':''} mode-${p.key}"><div class="equipment-item-main"><span class="equipment-tag">${esc(it.category||'Equipamento')}</span><h4>${esc(it.name)}</h4><p>${esc(it.effect||'Sem descrição.')}</p></div><div class="equipment-item-meta">${meta}<button class="hide-on-view equipment-remove" onclick="removeEquipmentFromCurrentSheet(${i})">×</button></div></article>`;
        });
    };
    window.addEquipmentToCurrentSheet = function(){
        const p=getEquipmentProfile(); const name=document.getElementById('sheet-eq-name').value.trim(); if(!name)return alert('Dê um nome ao item.');
        const type=document.getElementById('sheet-eq-type').value.trim()||'Equipamento'; const meta=document.getElementById('sheet-eq-meta').value.trim(); const effect=document.getElementById('sheet-eq-effect').value.trim()||'Sem descrição.';
        const item={name,category:type,effect,notes:meta,source:'Registro manual',system:p.key};
        if(p.key==='exodo'){item.link=meta;item.status='Íntegro';}
        else if(p.key==='ocultatun'){item.pe='—';item.stage='—';item.charges='—';}
        else if(p.key==='envolto'){item.pe='—';item.residue=meta;}
        else {item.pe='—';item.stage='—';item.charges='—';item.purpose=meta;}
        currentSheetEquipment.push(normalizeEquipment(item)); renderEquipmentSheet(); document.getElementById('equipment-add-modal').style.display='none'; ['sheet-eq-name','sheet-eq-type','sheet-eq-meta','sheet-eq-effect'].forEach(id=>document.getElementById(id).value='');
    };
    window.removeEquipmentFromCurrentSheet = function(i){ if(!isEditMode)return; currentSheetEquipment.splice(i,1); renderEquipmentSheet(); };

    const _openEquipmentAddModal=window.openEquipmentAddModal;
    window.openEquipmentAddModal=function(){ applyEquipmentProfile(); _openEquipmentAddModal(); };

    // Let the VTT equipment browser understand all four architectures.
    window.renderVttEquipment = function(){
        const c=document.getElementById('vtt-equipment-list'); if(!c)return; c.innerHTML='';
        if(!tablePlayers.length){c.innerHTML='<div class="equipment-empty">Nenhuma ficha presente na mesa.</div>';return;}
        tablePlayers.forEach((p,i)=>{
            const items=Array.isArray(p.equipment)?p.equipment:[], prof=getEquipmentProfile(p);
            c.innerHTML += `<section class="vtt-player-arsenal mode-${prof.key}"><div class="vtt-player-arsenal-head"><div><span class="eyebrow">${esc(prof.eyebrow)}</span><h4>${esc(p.name)}</h4><p>${esc(prof.subtitle)}</p></div><button class="souls-btn small-btn" onclick="openCharacterEquipmentFromVtt(${i})">ABRIR FICHA</button></div>${items.length ? items.map(it=>{ const bits=prof.key==='exodo'?`PE ${it.pe??'—'} · ES ${it.stage??'—'}`:prof.key==='ocultatun'?`PE ${it.pe??'—'} · ES ${it.stage??'—'} · Cargas ${it.charges??'—'}`:prof.key==='envolto'?`PE ${it.pe??'—'} · Válvula T${it.valveTier??0}`:`PE ${it.pe??'—'} · ES ${it.stage??'—'} · Cargas ${it.charges??'—'}`; return `<div class="vtt-eq-row"><div><b>${esc(it.name)}</b><span>${esc(it.category||'Equipamento')} · ${esc(bits)}</span></div><p>${esc(it.effect||'')}</p></div>`; }).join('') : '<div class="equipment-empty compact">Sem equipamentos registrados.</div>'}</section>`;
        });
    };

    // Add a visible builder-forge button next to the manual item button.
    const eqHead=document.querySelector('#tab-equipment .equipment-sheet-head');
    if(eqHead && !document.getElementById('btn-forge-sheet-item')){
        const b=document.createElement('button'); b.type='button'; b.id='btn-forge-sheet-item'; b.className='souls-btn small-btn hide-on-view'; b.textContent='⚒ FORJAR ITEM'; b.onclick=()=>openForgeForCurrentSheet(); eqHead.appendChild(b);
    }

    // Initialize once DOM is ready. The script is loaded at the end of body, so a microtask is sufficient.
    Promise.resolve().then(()=>{ syncHermeticRitualUI(); applyEquipmentProfile(); renderEquipmentSheet(); });
})();


// =====================================================================
// V0.11 — ALQUERINO · LABORATÓRIO DE SÍNTESE / INGREDIENTES / CAMINHOS
// Conteúdo canônico baseado no Livro Base — Ocultaton: Ecos 1.5.
// =====================================================================
(function(){
    const ALCHEMY_INGREDIENTS = [
      ['água de chuva coletada durante um fenômeno anômalo','R2'],['olho de criatura precognitiva','R3'],['página escrita antes do evento que descreve','R3'],
      ['cristal de memória temporal','R3'],['pena de ave que nunca pousou','R3'],['sangue de alguém que teve déjà-vu anômalo','R2'],
      ['relógio parado em uma morte','R4'],['olho de vidente','R4'],['tinta feita de memória futura','R4'],
      ['fragmento de objeto anômalo destruído','R4'],['sangue de testemunha morta','R4'],['cinza de documento apagado da história','R5'],
      ['segundo ponteiro de relógio que marcou um instante inexistente','R5'],['memória de uma pessoa apagada','R5'],['lágrima de alguém que ainda não morreu','R6'],
      ['fragmento de linha temporal colapsada','R6'],['sangue de viajante temporal','R6'],['fotografia de acontecimento que nunca aconteceu','R6'],
      ['primeiro instante de uma linha temporal','R7'],['último instante de uma linha temporal','R7'],['conhecimento de uma entidade temporal','R7'],
      ['sangue de penitente','R2'],['erva cultivada em local de sofrimento','R2'],['água benta ou equivalente ritual','R2'],
      ['lágrima de pessoa que perdoou seu maior inimigo','R3'],['cinza de confissão','R3'],['flor que cresce sobre sepultura','R2'],
      ['tecido regenerativo anômalo','R4'],['sangue de criatura regenerativa','R4'],['cicatriz voluntariamente reaberta','R3'],
      ['lágrima de criatura sobrenatural','R4'],['coração de animal empático','R4'],['confissão escrita por alguém condenado','R5'],
      ['coração de mártir','R5'],['sangue de três espécies diferentes','R5'],['relíquia de alguém que morreu por outra pessoa','R6'],
      ['tecido de entidade regenerativa Classe B','R6'],['essência vital preservada','R6'],['relíquia de um santo, mártir ou equivalente','R6'],
      ['fragmento de vida primordial','R7'],['sofrimento condenado','R7'],['conceito de perdão','R7'],
      ['pena de entidade celeste','R3'],['cinza de fogo sobrenatural','R2'],['sangue de criatura voadora','R2'],
      ['pena celestial','R3'],['carvão de incêndio anômalo','R3'],['óleo solar','R3'],
      ['osso de entidade alada','R4'],['chama de fenômeno paranormal','R4'],['metal que não projeta sombra','R3'],
      ['sangue de entidade celestial','R5'],['pena de arcanjo','R5'],['fogo de estrela anômala','R5'],
      ['seis penas celestiais diferentes','R6'],['fragmento de estrela','R6'],['lágrima de entidade divina','R6'],
      ['coração de entidade celeste','R6'],['cinza de anjo','R6'],['fragmento de espaço sagrado','R6'],
      ['essência de divindade','R7'],['chama primordial','R7'],['nome verdadeiro de uma entidade celeste','R7'],
      ['corda de execução','R2'],['sangue de alguém condenado injustamente','R3'],['carta do Enforcado','R3'],
      ['objeto de alguém que sacrificou a própria vida','R3'],['sangue de mártir','R3'],['fio de destino','R4'],
      ['poeira de nexo','EX'],['arrependimento','EX'],['mercúrio','EX']
    ].map(([name,rarity],i)=>({id:`ing-${i+1}`,name,rarity}));

    const P = (path,seq,name,cap,cd,effect,ingredients,cost='') => ({id:`${path.toLowerCase().replace(/[^a-z0-9]+/g,'-')}-${seq}`,source:'official',path,seq,name,cap,cd,effect,cost,ingredients});
    const OFFICIAL_PATHS = {
      'Profeta': {philosophy:'O futuro não é destino. É uma consequência que ainda não aconteceu.', nodes:[
        P('Profeta',1,'O Ouvinte',2,13,'Recebe Pré-Cognição menor. Uma vez por cena, pode perguntar ao Mestre: “Qual é o maior perigo imediato desta situação?” O Mestre responde honestamente.',['água de chuva coletada durante um fenômeno anômalo','olho de criatura precognitiva','página escrita antes do evento que descreve']),
        P('Profeta',2,'O Vidente',3,16,'Uma vez por cena: +5 Defesa Passiva contra o primeiro ataque que sofrer. Além disso, pode declarar “Eu já vi isso” e repetir um teste de Percepção ou Prontidão recém-falhado.',['cristal de memória temporal','pena de ave que nunca pousou','sangue de alguém que teve déjà-vu anômalo']),
        P('Profeta',3,'O Profeta',4,19,'Recebe Pré-Cognição de Combate. No início do combate, pode perguntar ao Mestre quem atacará primeiro, qual inimigo possui maior intenção hostil e qual ação provável de um inimigo. Além disso, ganha +2 Iniciativa.',['relógio parado em uma morte','olho de vidente','tinta feita de memória futura']),
        P('Profeta',4,'O Oráculo',5,22,'Recebe Pós-Cognição. Pode tocar objeto ou local e observar acontecimento ocorrido até 7 dias atrás. Custo: 2 ES. Pode realizar uma pergunta sobre a visão.',['fragmento de objeto anômalo destruído','sangue de testemunha morta','cinza de documento apagado da história'],'2 ES'),
        P('Profeta',5,'O Testemunho',7,25,'Uma vez por cena, antes de uma ação de um aliado, pode declarar “Eu sei que isso vai funcionar”. Se o aliado falhar, pode permitir uma segunda rolagem.',['segundo ponteiro de relógio que marcou um instante inexistente','memória de uma pessoa apagada','lágrima de alguém que ainda não morreu']),
        P('Profeta',6,'O Visionário',8,28,'Pode observar 1 minuto do futuro. Durante esse período, pode alterar uma decisão pessoal baseada no que viu. Uma vez por descanso longo: Reescrever Instante. Quando for atingido, pode retornar sua posição e estado para o início da rodada.',['fragmento de linha temporal colapsada','sangue de viajante temporal','fotografia de acontecimento que nunca aconteceu']),
        P('Profeta',7,'O Profeta Eterno',10,31,'Torna-se uma entidade de Pré-Cognição e Pós-Cognição. Pode observar passado, presente e futuros possíveis. Uma vez por sessão pode perguntar ao Mestre: “Qual acontecimento precisa ocorrer para que X seja possível?” A resposta é verdadeira.',['primeiro instante de uma linha temporal','último instante de uma linha temporal','conhecimento de uma entidade temporal'])
      ]},
      'Penitente': {philosophy:'Dor não é punição. Dor é conhecimento. E aquilo que compreende a própria dor pode decidir o que fazer com ela.', nodes:[
        P('Penitente',1,'O Arrependido',2,13,'Recebe Resistência Emocional +3. Pode reduzir uma condição mental Leve para nenhuma uma vez por cena.',['sangue de penitente','erva cultivada em local de sofrimento','água benta ou equivalente ritual']),
        P('Penitente',2,'O Disciplinado',3,16,'Recebe imunidade a medo comum e intimidação mundana. Pode gastar 1 ES para remover uma condição emocional Leve.',['lágrima de pessoa que perdoou seu maior inimigo','cinza de confissão','flor que cresce sobre sepultura'],'1 ES'),
        P('Penitente',3,'O Flagelado',4,19,'Recebe Regeneração 2 PV por rodada; não funciona se estiver em 0 PV. Além disso, pode converter 5 PV perdidos em +2 em um teste de Vontade.',['tecido regenerativo anômalo','sangue de criatura regenerativa','cicatriz voluntariamente reaberta']),
        P('Penitente',4,'O Confessor',5,22,'Pode controlar emoções. Ação Padrão + 3 ES. Um alvo realiza Vontade contra CD 10 + PRE + 5. Falha permite remover medo, reduzir raiva, acalmar pânico, induzir tristeza ou impedir uma reação emocional.',['lágrima de criatura sobrenatural','coração de animal empático','confissão escrita por alguém condenado'],'3 ES'),
        P('Penitente',5,'O Mártir',7,25,'Recebe Regeneração 5 PV/rodada. Pode receber ferimento destinado a outra pessoa a até 9m. Uma vez por rodada: Reação + 2 ES. Transfere até 10 PV de dano.',['coração de mártir','sangue de três espécies diferentes','relíquia de alguém que morreu por outra pessoa'],'2 ES'),
        P('Penitente',6,'O Santo',8,28,'Recebe Regeneração 10 PV/rodada. Pode restaurar olho, órgão, membro ou sentido. Uma vez por descanso longo: Ressurreição Parcial. Um cadáver morto há até 24 horas retorna com 1 PV.',['tecido de entidade regenerativa Classe B','essência vital preservada','relíquia de um santo, mártir ou equivalente']),
        P('Penitente',7,'O Penitente Divino',10,31,'Torna-se uma entidade que representa Redenção através do sofrimento. Pode regenerar aliados, restaurar corpo, remover estados mentais, transferir ferimento, ressuscitar morto e dividir sofrimento entre criaturas. Sua divindade exige uma regra: não pode remover sofrimento sem assumir alguma consequência equivalente.',['fragmento de vida primordial','sofrimento condenado','conceito de perdão'])
      ]},
      'Arcanjo': {philosophy:'A divindade não pede permissão para existir.', nodes:[
        P('Arcanjo',1,'Asas',2,13,'Recebe +2 AGI. Pode manifestar asas temporárias. Voo: 12 metros.',['pena de entidade celeste','cinza de fogo sobrenatural','sangue de criatura voadora']),
        P('Arcanjo',2,'Serafim Menor',3,16,'Recebe Resistência a fogo 5. Pode produzir fogo angelical: 1d6 dano energético.',['pena celestial','carvão de incêndio anômalo','óleo solar']),
        P('Arcanjo',3,'Guardião',4,19,'Voo: 25 metros. Recebe +3 Defesa Passiva. Fogo angelical: 2d6.',['osso de entidade alada','chama de fenômeno paranormal','metal que não projeta sombra']),
        P('Arcanjo',4,'Anjo',5,22,'Transformação Angelical. Ação Rápida + 3 ES. Durante uma cena: asas, olho luminoso, Resistência a dano físico 5, voo 30m e fogo angelical 3d6.',['sangue de entidade celestial','pena de arcanjo','fogo de estrela anômala'],'3 ES'),
        P('Arcanjo',5,'Serafim',7,25,'Transformação completa. Recebe +4 AGI, Resistência a dano 10 e Fogo Angelical 3d6. Pode emitir uma rajada de 6m.',['seis penas celestiais diferentes','fragmento de estrela','lágrima de entidade divina']),
        P('Arcanjo',6,'Arcanjo',8,28,'Recebe Velocidade sobrenatural. Uma vez por rodada, pode realizar uma ação de Movimento adicional. Fogo angelical: 5d6. Pode teleportar-se 18m como Ação Rápida.',['coração de entidade celeste','cinza de anjo','fragmento de espaço sagrado']),
        P('Arcanjo',7,'Arcanjo Divino',10,31,'Torna-se uma entidade angelológica. Recebe voo, velocidade sobrenatural, fogo celestial, resistência, aura sagrada e transformação angelical completa. Pode criar fogo celestial em reagente. Sua presença passa a impor uma autoridade conceitual.',['essência de divindade','chama primordial','nome verdadeiro de uma entidade celeste'])
      ]}
    };
    const HIDDEN_PATHS = [
      {path:'Enforcado',source:'hidden',note:'Trecho documentado no capítulo Caminhos Ocultos.',nodes:[
        P('Enforcado',1,'O Pendurado',2,13,'Pode suspender-se em superfícies. Recebe +2 AGI e vantagem para escapar de contenção.',['corda de execução','sangue de alguém condenado injustamente','carta do Enforcado']),
        P('Enforcado',2,'O Sacrifício',3,16,'Pode transferir 5 PV próprios para +5 em qualquer teste, uma vez por cena.',['objeto de alguém que sacrificou a própria vida','sangue de mártir','fio de destino']),
        P('Enforcado',3,'A Inversão',4,19,'Pode inverter cima/baixo, atração/repulsão, vantagem/desvantagem e direção de movimento. Custo: 2 ES.',['sangue de alguém condenado injustamente','fio de destino','carta do Enforcado'],'2 ES')
      ]}
    ];

    const SEQUENCES = [
      ['I','Despertar'],['II','Assimilação'],['III','Transfiguração'],['IV','Ascensão'],['V','Conceito'],['VI','Arquétipo'],['VII','Apoteose']
    ];

    const state = {
      selectedIngredients: [],
      inventory: {},
      unlocked: [],
      customFormulas: [],
      customPaths: [],
      preparations: []
    };
    ALCHEMY_INGREDIENTS.forEach(i=>state.inventory[i.id]=0);

    function isAlq(){ return currentMode==='ocultatun' && currentNature==='Agente de Carreira (Ocultatun)' && currentClass==='Alquerino'; }
    function esc(v){ return typeof escHtml==='function'?escHtml(String(v??'')):String(v??''); }
    function allNodes(){ return [...Object.values(OFFICIAL_PATHS).flatMap(x=>x.nodes), ...HIDDEN_PATHS.flatMap(x=>x.nodes)]; }
    function ingredientByName(name){ return ALCHEMY_INGREDIENTS.find(x=>x.name===name); }
    function rarityLabel(r){ return ({R1:'Comum',R2:'Incomum',R3:'Anômalo',R4:'Raro',R5:'Singular',R6:'Conceitual',R7:'Divino',EX:'Mencionado'})[r]||r; }
    function selectedIds(){ return state.selectedIngredients.slice(); }
    function selectedNames(){ return selectedIds().map(id=>ALCHEMY_INGREDIENTS.find(x=>x.id===id)?.name).filter(Boolean); }
    function normalizedSet(a){ return a.slice().sort((x,y)=>x.localeCompare(y,'pt-BR')); }
    function exactMatch(node){ return normalizedSet(node.ingredients).join('|')===normalizedSet(selectedNames()).join('|'); }

    window.switchAlchemyPanel=function(panel){
      document.querySelectorAll('.alchemy-nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.alchemyPanel===panel));
      document.querySelectorAll('.alchemy-panel').forEach(p=>p.classList.toggle('active',p.id===`alchemy-panel-${panel}`));
      if(panel==='paths') renderOfficialPaths();
      if(panel==='formulas') renderAlchemyFormulaLibrary();
      if(panel==='ingredients') renderAlchemyIngredientLibrary();
      if(panel==='forge') renderCustomPathBuilder();
    };

    window.renderAlchemyIngredients=function(){
      const grid=document.getElementById('alchemy-ingredient-grid'); if(!grid)return;
      const q=(document.getElementById('alchemy-ingredient-search')?.value||'').toLowerCase().trim();
      const rf=document.getElementById('alchemy-rarity-filter')?.value||'all';
      grid.innerHTML=ALCHEMY_INGREDIENTS.filter(i=>(rf==='all'||i.rarity===rf)&&(!q||i.name.toLowerCase().includes(q))).map(i=>{
        const qty=Number(state.inventory[i.id]||0), sel=state.selectedIngredients.includes(i.id);
        return `<button type="button" class="ingredient-chip ${sel?'selected':''}" onclick="toggleAlchemyIngredient('${i.id}')"><span class="ingredient-rarity ${i.rarity}">${i.rarity}</span><strong>${esc(i.name)}</strong><small>${rarityLabel(i.rarity)} · posse ${qty}</small></button>`;
      }).join('') || '<div class="alchemy-empty">Nenhum reagente encontrado.</div>';
    };

    window.renderAlchemyIngredientLibrary=function(){
      const grid=document.getElementById('alchemy-ingredient-library'); if(!grid)return;
      const q=(document.getElementById('alchemy-ingredient-library-search')?.value||'').toLowerCase().trim();
      const rf=document.getElementById('alchemy-ingredient-library-filter')?.value||'all';
      grid.innerHTML=ALCHEMY_INGREDIENTS.filter(i=>(rf==='all'||i.rarity===rf)&&(!q||i.name.toLowerCase().includes(q))).map(i=>`<div class="ingredient-library-card"><div><span class="ingredient-rarity ${i.rarity}">${i.rarity}</span><b>${esc(i.name)}</b><small>${rarityLabel(i.rarity)}</small></div><label>Qtd<input type="number" min="0" value="${Number(state.inventory[i.id]||0)}" onchange="setAlchemyIngredientQty('${i.id}',this.value)"></label></div>`).join('') || '<div class="alchemy-empty">Nenhum reagente.</div>';
    };
    window.setAlchemyIngredientQty=function(id,value){ state.inventory[id]=Math.max(0,Number(value)||0); renderAlchemyIngredients(); renderAlchemyIngredientLibrary(); renderCombinationVessel(); };
    window.__ALCHEMY_INGREDIENT_IDS=ALCHEMY_INGREDIENTS.map(i=>i.id);
    window.__setAlchemyBulkQty=function(op,n){ const q=Math.max(0,Number(n)||0); ALCHEMY_INGREDIENTS.forEach(i=>{ const cur=Math.max(0,Number(state.inventory[i.id]||0)); state.inventory[i.id]=op==='add'?cur+q:op==='sub'?Math.max(0,cur-q):q; }); renderAlchemyIngredients(); renderAlchemyIngredientLibrary(); renderCombinationVessel(); };
    window.toggleAlchemyIngredient=function(id){
      const idx=state.selectedIngredients.indexOf(id);
      if(idx>=0) state.selectedIngredients.splice(idx,1);
      else if(state.selectedIngredients.length<3) state.selectedIngredients.push(id);
      else return alert('A câmara de combinação comporta exatamente três reagentes.');
      renderAlchemyIngredients(); renderCombinationVessel(); renderCustomPathBuilder();
    };
    window.clearAlchemyCombination=function(){ state.selectedIngredients=[]; renderAlchemyIngredients(); renderCombinationVessel(); renderCustomPathBuilder(); };
    function renderCombinationVessel(){
      document.querySelectorAll('#alchemy-panel-bench .reagent-flask').forEach((f,i)=>{const id=state.selectedIngredients[i];const ing=id&&ALCHEMY_INGREDIENTS.find(x=>x.id===id);f.classList.toggle('filled',!!ing);f.querySelector('.flask-bulb b').textContent=ing?ing.rarity:'+';f.querySelector('.flask-bulb small').textContent=ing?ing.name:'vazio';});
      const c=document.getElementById('alchemy-free-reagent-count'); if(c)c.textContent=`${state.selectedIngredients.length}/3`;
      const cap=Number(document.getElementById('alchemy-free-cap')?.value||1), comp=Number(document.getElementById('alchemy-free-complexity')?.value||0); const cd=document.getElementById('alchemy-free-cd'); if(cd)cd.textContent=String(10+cap+comp);
    }
    function canPrepare(){ const int=Number(document.getElementById('attr-int')?.value||0), grau=Number(document.getElementById('spec-alquerino-ocultismo-grau')?.value||0); return state.preparations.length < (int+grau); }
    window.combineAlchemyIngredients=function(){
      if(state.selectedIngredients.length!==3) return alert('Selecione três ingredientes para a síntese.');
      const names=selectedNames(); const matches=allNodes().filter(exactMatch); const consume=document.getElementById('alchemy-consume-reagents')?.checked; const insufficient=state.selectedIngredients.filter(id=>(Number(state.inventory[id]||0)<1)); if(consume&&insufficient.length) return alert('A bancada não possui uma unidade de cada reagente selecionado. Ajuste o almoxarifado antes de consumir a mistura.');
      const box=document.getElementById('alchemy-unlocked-formula');
      if(!canPrepare()) return alert('O Alquerino já atingiu o limite de preparos deste descanso longo.');
      if(matches.length){ const m=matches[0]; if(!state.unlocked.includes(m.id))state.unlocked.push(m.id); if(consume)state.selectedIngredients.forEach(id=>state.inventory[id]=Math.max(0,Number(state.inventory[id]||0)-1)); state.preparations.push({id:`prep-${Date.now()}`,type:'Caminho',name:`${m.path} · ${m.name}`,cap:m.cap,insumo:names.join(' + '),note:`Etapa ${m.seq} desbloqueada · CD ${m.cd}`}); box.innerHTML=`<div class="formula-match success"><b>FÓRMULA RECONHECIDA</b><strong>${esc(m.path)} · ${esc(m.name)}</strong><span>Cap. ${m.cap} · CD ${m.cd}${m.cost?' · Custo '+esc(m.cost):''}</span><small>${esc(m.effect)}</small><button type="button" class="souls-btn mini-btn" onclick="switchAlchemyPanel('formulas')">ABRIR FÓRMULA</button></div>`; }
      else { if(consume)state.selectedIngredients.forEach(id=>state.inventory[id]=Math.max(0,Number(state.inventory[id]||0)-1)); box.innerHTML=`<div class="formula-match neutral"><b>SÍNTESE NÃO CATALOGADA</b><strong>Os três reagentes formam um composto livre.</strong><small>${esc(names.join(' + '))}</small><span>Use a Fórmula Livre para registrar o efeito, forma e estabilidade da mistura.</span></div>`; }
      window.currentAlquerinoPreparations=state.preparations; renderAlchemyIngredients(); renderAlchemyIngredientLibrary(); renderCombinationVessel(); renderAlquerinoLab();
    };

    window.renderOfficialPaths=function(){
      const wrap=document.getElementById('alquerino-official-paths'); if(!wrap)return;
      wrap.innerHTML=Object.values(OFFICIAL_PATHS).map(path=>`<article class="official-path-card"><header><div><span class="path-index">✦</span><b>Caminho ${esc(path.nodes[0].path)}</b><small>${esc(path.philosophy)}</small></div><span class="path-count">${path.nodes.filter(n=>state.unlocked.includes(n.id)).length}/7 DESBLOQUEADAS</span></header><div class="path-node-list">${path.nodes.map(n=>`<div class="path-node-card ${state.unlocked.includes(n.id)?'unlocked':''}"><div class="path-node-top"><span>Seq. ${n.seq}</span><b>${esc(n.name)}</b><em>CAP ${n.cap} · CD ${n.cd}</em></div><p>${esc(n.effect)}</p><div class="formula-ingredients">${n.ingredients.map(x=>`<span>${esc(x)}</span>`).join('')}</div><button type="button" class="path-use-btn" onclick="loadFormulaIngredients('${n.id}')">${state.unlocked.includes(n.id)?'FÓRMULA DESBLOQUEADA':'CARREGAR NA CÂMARA'}</button></div>`).join('')}</div></article>`).join('');
      const hidden=document.getElementById('alquerino-hidden-paths'); if(hidden)hidden.innerHTML=HIDDEN_PATHS.map(path=>`<article class="hidden-path-list"><h5>Caminho ${esc(path.path)}</h5><small>${esc(path.note)}</small>${path.nodes.map(n=>`<div class="hidden-node"><div><b>${esc(n.name)}</b><span>Cap. ${n.cap} · CD ${n.cd}</span></div><p>${esc(n.effect)}</p><div class="formula-ingredients">${n.ingredients.map(x=>`<span>${esc(x)}</span>`).join('')}</div><button type="button" class="path-use-btn" onclick="loadFormulaIngredients('${n.id}')">CARREGAR</button></div>`).join('')}</article>`).join('');
    };
    window.loadFormulaIngredients=function(nodeId){ const custom=[...state.customFormulas,...state.customPaths.flatMap(p=>p.nodes||[])]; const n=[...allNodes(),...custom].find(x=>x.id===nodeId); if(!n)return; state.selectedIngredients=(n.ingredients||[]).map(ingredientByName).filter(Boolean).map(x=>x.id); switchAlchemyPanel('bench'); setTimeout(()=>{renderAlchemyIngredients();renderCombinationVessel();},0); };

    window.renderAlchemyFormulaLibrary=function(){
      const grid=document.getElementById('alchemy-formula-library'); if(!grid)return;
      const q=(document.getElementById('alchemy-formula-search')?.value||'').toLowerCase().trim(); const f=document.getElementById('alchemy-formula-filter')?.value||'all';
      const formulas=[...allNodes(),...state.customFormulas,...state.customPaths.flatMap(p=>p.nodes||[])];
      grid.innerHTML=formulas.filter(x=>(f==='all'||(f==='official'&&x.source==='official')||(f==='hidden'&&x.source==='hidden')||(f==='custom'&&x.source==='custom'))&&(!q||`${x.path} ${x.name} ${x.effect} ${x.ingredients.join(' ')}`.toLowerCase().includes(q))).map(x=>`<article class="formula-library-card ${x.source}"><div class="formula-library-head"><span>${x.source==='custom'?'LIVRE':x.source==='hidden'?'OCULTA':'OFICIAL'}</span><b>${esc(x.path)} · ${esc(x.name)}</b><em>CAP ${x.cap} · CD ${x.cd}</em></div><p>${esc(x.effect)}</p><div class="formula-ingredients">${x.ingredients.map(i=>`<button type="button" onclick="loadIngredientByName('${encodeURIComponent(i)}')">${esc(i)}</button>`).join('')}</div><button type="button" class="path-use-btn" onclick="loadFormulaIngredients('${esc(x.id)}')">CARREGAR FÓRMULA</button></article>`).join('') || '<div class="alchemy-empty">Nenhuma fórmula encontrada.</div>';
    };
    window.loadIngredientByName=function(encoded){ const name=decodeURIComponent(encoded); const ing=ingredientByName(name); if(!ing)return; if(state.selectedIngredients.length<3&&!state.selectedIngredients.includes(ing.id)) state.selectedIngredients.push(ing.id); renderAlchemyIngredients(); renderCombinationVessel(); switchAlchemyPanel('bench'); };

    window.saveFreeAlchemyFormula=function(){
      if(!canPrepare())return alert('O limite de preparos deste descanso longo já foi alcançado.');
      if(state.selectedIngredients.length!==3)return alert('Combine três ingredientes antes de gravar uma fórmula livre.'); const consume=document.getElementById('alchemy-consume-reagents')?.checked; const insufficient=state.selectedIngredients.filter(id=>(Number(state.inventory[id]||0)<1)); if(consume&&insufficient.length)return alert('Faltam reagentes no almoxarifado para este preparo.');
      const name=(document.getElementById('alchemy-free-name')?.value||'Fórmula Livre').trim(); const type=document.getElementById('alchemy-free-type')?.value||'Poção'; const form=document.getElementById('alchemy-free-form')?.value||'Líquido'; const cap=Number(document.getElementById('alchemy-free-cap')?.value||1); const complexity=Number(document.getElementById('alchemy-free-complexity')?.value||0); const fn=(document.getElementById('alchemy-free-function')?.value||'').trim(); const stability=(document.getElementById('alchemy-free-stability')?.value||'').trim();
      const f={id:`free-${Date.now()}`,source:'custom',path:'Preparo Livre',seq:'—',name,effect:`${type} em forma de ${form}. Função: ${fn||'a definir'}. Estabilidade: ${stability||'a definir'}. CD ${10+cap+complexity}.`,cap,cd:10+cap+complexity,ingredients:selectedNames(),cost:'ES conforme Potências usadas'}; if(consume)state.selectedIngredients.forEach(id=>state.inventory[id]=Math.max(0,Number(state.inventory[id]||0)-1)); state.customFormulas.push(f); state.unlocked.push(f.id); state.preparations.push({id:f.id,type,name,cap,insumo:selectedNames().join(' + '),note:`Fórmula Livre · ${form} · CD ${f.cd}`}); window.currentAlquerinoPreparations=state.preparations; alert(`Fórmula “${name}” gravada na biblioteca.`); renderAlchemyFormulaLibrary(); renderAlquerinoLab(); };

    window.saveNewAlchemyPathNode=function(){
      if(state.selectedIngredients.length!==3)return alert('Uma nova etapa de Caminho precisa de três ingredientes selecionados na câmara.');
      const path=(document.getElementById('alchemy-new-path-name')?.value||'Caminho Novo').trim(); const philosopher=(document.getElementById('alchemy-new-path-philosophy')?.value||'').trim(); const seq=Number(document.getElementById('alchemy-new-path-seq')?.value||1); const cap=Number(document.getElementById('alchemy-new-path-cap')?.value||1); const cd=Number(document.getElementById('alchemy-new-path-cd')?.value||10+cap); const name=(document.getElementById('alchemy-new-path-ability')?.value||`Etapa ${seq}`).trim(); const effect=(document.getElementById('alchemy-new-path-effect')?.value||'').trim();
      let item=state.customPaths.find(x=>x.path===path); if(!item){item={path,philosophy,nodes:[],source:'custom'};state.customPaths.push(item);} item.nodes.push({id:`custom-path-${Date.now()}`,source:'custom',path,seq,name,cap,cd,effect,ingredients:selectedNames()}); item.nodes.sort((a,b)=>a.seq-b.seq); state.unlocked.push(item.nodes[item.nodes.length-1].id); renderCustomPathBuilder(); renderAlchemyFormulaLibrary(); alert(`Etapa ${seq} gravada em ${path}.`);
    };
    window.renderCustomPathBuilder=function(){
      const box=document.getElementById('alchemy-new-path-reagents'); if(box)box.innerHTML=selectedNames().map((n,i)=>`<div class="selected-reagent-line"><span>${String.fromCharCode(65+i)}</span><b>${esc(n)}</b><small>${ingredientByName(n)?.rarity||''}</small></div>`).join('')||'<div class="alchemy-empty">Selecione três ingredientes na Câmara de Combinação.</div>';
      const list=document.getElementById('alchemy-custom-path-list'); if(list)list.innerHTML=state.customPaths.map(p=>`<article class="custom-path-card"><header><b>${esc(p.path)}</b><small>${esc(p.philosophy||'')}</small></header>${p.nodes.map(n=>`<div><span>${n.seq} · ${esc(SEQUENCES[n.seq-1]?.[1]||'')}</span><b>${esc(n.name)}</b><p>${esc(n.effect)}</p></div>`).join('')}</article>`).join('')||'<div class="alchemy-empty">Nenhum Caminho novo gravado.</div>';
    };

    function getStats(){ const int=Number(document.getElementById('attr-int')?.value||0), pre=Number(document.getElementById('attr-pre')?.value||0), pat=Number(document.getElementById('spec-alquerino-patamar')?.value||1), grau=Number(document.getElementById('spec-alquerino-ocultismo-grau')?.value||0); return {int,pre,pat,grau,prepMax:int+grau,esMax:8+int+pre+pat}; }
    window.renderAlquerinoLab=function(){
      const tab=document.getElementById('tab-alquerino'), btn=document.getElementById('btn-tab-alquerino'); if(!tab||!btn)return; btn.style.display=isAlq()?'':'none'; tab.style.display=isAlq()?'':'none'; if(!isAlq())return;
      const s=getStats(); document.getElementById('alquerino-prep-capacity').textContent=String(s.prepMax); document.getElementById('alquerino-es-total').textContent=String(s.esMax); document.getElementById('alquerino-fadiga-total').textContent=String(state.fadiga||0);
      renderAlchemyIngredients(); renderAlchemyFormulaLibrary(); renderAlchemyIngredientLibrary(); renderOfficialPaths(); renderCombinationVessel(); renderCustomPathBuilder();
      const list=document.getElementById('alquerino-preparos-list'); if(list)list.innerHTML=state.preparations.length?state.preparations.map((p,i)=>`<article class="prepared-vial"><div class="prepared-vial-icon">⚗</div><div><b>${esc(p.name||p.type||'Preparo')}</b><small>${esc(p.cap?'Cap. '+p.cap:'')}${p.insumo?' · '+esc(p.insumo):''}</small><span>${esc(p.note||'')}</span></div><button type="button" class="hide-on-view" onclick="removeAlquerinoPreparation(${i})">×</button></article>`).join(''):'<div class="alchemy-empty">Nenhuma mistura pronta. Use a Câmara de Combinação e grave uma fórmula.</div>';
    };
    window.removeAlquerinoPreparation=function(i){ if(!isEditMode)return; state.preparations.splice(i,1); window.currentAlquerinoPreparations=state.preparations; renderAlquerinoLab(); };

    const oldPayload=window.buildCharacterPayloadFromBuilder;
    if(typeof oldPayload==='function') window.buildCharacterPayloadFromBuilder=function(){ const payload=oldPayload.apply(this,arguments); payload.alquerino={...(payload.alquerino||{}),patamar:document.getElementById('spec-alquerino-patamar')?.value||'1',ocultismoGrau:Number(document.getElementById('spec-alquerino-ocultismo-grau')?.value||0),inventory:msClone(state.inventory),unlocked:msClone(state.unlocked),customFormulas:msClone(state.customFormulas),customPaths:msClone(state.customPaths),preparacoes:msClone(state.preparations)}; return payload; };

    const oldSelectNature=window.selectNature; if(typeof oldSelectNature==='function') window.selectNature=function(){ const r=oldSelectNature.apply(this,arguments); resetState(); renderAlquerinoLab(); return r; };
    const oldSelectClass=window.selectClass; if(typeof oldSelectClass==='function') window.selectClass=function(){ const r=oldSelectClass.apply(this,arguments); renderAlquerinoLab(); return r; };
    const oldLoad=window.loadCharacterToBuilder;
    if(typeof oldLoad==='function') window.loadCharacterToBuilder=function(){ const r=oldLoad.apply(this,arguments); const sourceArray=arguments[1]||characters, idx=arguments[0], ch=sourceArray[idx], a=ch?.alquerino||{}; resetState(); Object.assign(state.inventory,a.inventory||{}); state.unlocked=Array.isArray(a.unlocked)?msClone(a.unlocked):[]; state.customFormulas=Array.isArray(a.customFormulas)?msClone(a.customFormulas):[]; state.customPaths=Array.isArray(a.customPaths)?msClone(a.customPaths):[]; state.preparations=Array.isArray(a.preparacoes)?msClone(a.preparacoes):[]; const pat=document.getElementById('spec-alquerino-patamar'); const og=document.getElementById('spec-alquerino-ocultismo-grau'); if(pat)pat.value=a.patamar||a.nivel||'1'; if(og)og.value=a.ocultismoGrau??'0'; window.currentAlquerinoPreparations=state.preparations; renderAlquerinoLab(); return r; };
    function resetState(){ state.selectedIngredients=[]; ALCHEMY_INGREDIENTS.forEach(i=>state.inventory[i.id]=0); state.unlocked=[]; state.customFormulas=[]; state.customPaths=[]; state.preparations=[]; window.currentAlquerinoPreparations=state.preparations; }
    const oldToggle=window.toggleEditUI; if(typeof oldToggle==='function')window.toggleEditUI=function(){const r=oldToggle.apply(this,arguments);document.querySelectorAll('#tab-alquerino input,#tab-alquerino select,#tab-alquerino textarea,#tab-alquerino button').forEach(el=>{if(el.classList.contains('alchemy-nav-btn'))return;el.disabled=!isEditMode;});renderAlquerinoLab();return r;};

    document.addEventListener('DOMContentLoaded',()=>setTimeout(renderAlquerinoLab,80));
})();

/* =====================================================================
   V0.27 — ESPAÇO FINAL: VIEWPORT LIVRE, ÁREA INTERNA FIXA 1960×1360
   A árvore não é redimensionada, reposicionada nem reconstruída pelo pan.
   O movimento atua somente no viewport externo através de scrollLeft/Top.
   ===================================================================== */
let efViewportPanState = null;

function efApplyTreeZoom(scrollWrapper, frame, zoom) {
    if (!scrollWrapper || !frame) return;
    efTreeZoom = 1;
    scrollWrapper.style.zoom = '1';
    scrollWrapper.style.transform = 'none';
    scrollWrapper.style.transformOrigin = 'top left';
    scrollWrapper.style.margin = '0';
    scrollWrapper.style.width = '1600px';
    scrollWrapper.style.height = '1180px';
    scrollWrapper.style.minWidth = '1600px';
    scrollWrapper.style.minHeight = '1180px';
    const out = document.getElementById('ef-zoom-value');
    if (out) out.textContent = '100% · ESCALA 1:1';
}

function efFitTreeViewport(scrollWrapper, frame) {
    if (!scrollWrapper || !frame) return;
    efTreeZoomManual = true;
    efApplyTreeZoom(scrollWrapper, frame, 1);
    requestAnimationFrame(() => {
        frame.scrollLeft = Math.max(0, (frame.scrollWidth - frame.clientWidth) / 2);
        frame.scrollTop = Math.max(0, (frame.scrollHeight - frame.clientHeight) / 2);
    });
}

function efBindTreeViewportPan(frame) {
    if (!frame || frame.dataset.panBound === '1') return;
    frame.dataset.panBound = '1';
    frame.classList.add('ef-free-pan');

    // Prefer pan by translating the internal scroll wrapper so the visual
    // background moves even when scrollbars are not present. Fallback to
    // scrollLeft/scrollTop when wrapper is missing.
    const wrapper = frame.querySelector('#tree-scroll-wrapper') || document.getElementById('tree-scroll-wrapper');

    frame.addEventListener('pointerdown', function(ev) {
        if (ev.button !== 0) return;
        const target = ev.target;
        if (target && target.closest && (
            target.closest('.ef-node') ||
            target.closest('button') ||
            target.closest('input') ||
            target.closest('select') ||
            target.closest('textarea') ||
            target.closest('a')
        )) return;

        if (wrapper) {
            // read existing translate values (stored in data attributes)
            const startX = Number(wrapper.dataset.panX) || 0;
            const startY = Number(wrapper.dataset.panY) || 0;
            efViewportPanState = {
                pointerId: ev.pointerId,
                x: ev.clientX,
                y: ev.clientY,
                startX,
                startY,
                moved: false,
                mode: 'transform'
            };
        } else {
            efViewportPanState = {
                pointerId: ev.pointerId,
                x: ev.clientX,
                y: ev.clientY,
                left: frame.scrollLeft,
                top: frame.scrollTop,
                moved: false,
                mode: 'scroll'
            };
        }

        frame.classList.add('ef-panning');
        try { frame.setPointerCapture(ev.pointerId); } catch (_) {}
        ev.preventDefault();
    }, {passive:false});

    frame.addEventListener('pointermove', function(ev) {
        const state = efViewportPanState;
        if (!state || state.pointerId !== ev.pointerId) return;
        const dx = ev.clientX - state.x;
        const dy = ev.clientY - state.y;
        if (Math.abs(dx) + Math.abs(dy) > 2) state.moved = true;

        if (state.mode === 'transform' && wrapper) {
            const tx = state.startX + dx;
            const ty = state.startY + dy;
            wrapper.style.transform = `translate(${tx}px, ${ty}px)`;
            wrapper.dataset.panX = tx;
            wrapper.dataset.panY = ty;
        } else {
            frame.scrollLeft = state.left - dx;
            frame.scrollTop = state.top - dy;
        }
        ev.preventDefault();
    }, {passive:false});

    const endPan = function(ev) {
        const state = efViewportPanState;
        if (!state || (ev.pointerId != null && state.pointerId !== ev.pointerId)) return;
        efViewportPanState = null;
        frame.classList.remove('ef-panning');
        try { frame.releasePointerCapture(state.pointerId); } catch (_) {}
        if (state.moved) ev.preventDefault();
    };
    frame.addEventListener('pointerup', endPan, {passive:false});
    frame.addEventListener('pointercancel', endPan, {passive:false});
    frame.addEventListener('lostpointercapture', function() {
        efViewportPanState = null;
        frame.classList.remove('ef-panning');
    });
}

function efBindTreeViewControls() {
    const frame = document.querySelector('#ef-space-final .ef-tree-frame');
    const wrapper = document.getElementById('tree-scroll-wrapper');
    if (!frame || !wrapper) return;

    efApplyTreeZoom(wrapper, frame, 1);
    efBindTreeViewportPan(frame);

    const fit = document.getElementById('ef-fit-tree');
    if (fit && fit.dataset.v027Bound !== '1') {
        fit.dataset.v027Bound = '1';
        fit.textContent = 'CENTRALIZAR ÁREA';
        fit.addEventListener('click', function(ev) {
            ev.preventDefault();
            efFitTreeViewport(wrapper, frame);
        });
    }

    ['ef-zoom-out','ef-zoom-in'].forEach(id => {
        const btn = document.getElementById(id);
        if (!btn) return;
        btn.disabled = true;
        btn.setAttribute('aria-disabled', 'true');
        btn.title = 'A Skill Tree usa sua escala normal 1:1; navegue pelo viewport para visualizar toda a área interna.';
    });
    const out = document.getElementById('ef-zoom-value');
    if (out) out.textContent = '100% · ESCALA 1:1';
}
