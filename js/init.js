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
// USER DATABASE & AUTHENTICATION STATE
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

let currentMode = '';
let currentNature = '';
let currentClass = '';

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active', 'overlay'));
    const target = document.getElementById(id);
    target.classList.add('active');

    if(id === 'screen-char-select') {
        isEditMode = true;
        if(typeof renderCharList === 'function') renderCharList();
        if(currentUser) {
            document.getElementById('sanctuary-limits').innerText = `Almas Vivas: ${characters.length} / ${currentUser.role === 'jogador' ? 5 : 10}`;
        }
    }
    if(id === 'screen-ancoragem' && typeof renderAncoragem === 'function') {
        renderAncoragem();
    }
}

function selectGameMode(mode) {
    selectedGameMode = mode;
    const titleEl = document.getElementById('sanctuary-title');
    titleEl.innerText = mode === 'exodo' ? 'Santuário de Êxodo' : 'Santuário de Ocultatun';
    showScreen('screen-char-select');
}

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
