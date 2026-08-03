function switchAncoragemTab(tab) {
    document.getElementById('ancoragem-player-tab').style.display = tab === 'player' ? 'flex' : 'none';
    document.getElementById('ancoragem-gm-tab').style.display = tab === 'gm' ? 'flex' : 'none';
    document.querySelectorAll('#screen-ancoragem .tab-btn').forEach(b => b.classList.remove('active'));
    if(event && event.target) event.target.classList.add('active');
}

function generateRoomCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function openCreateTableModal() {
    if(currentUser.role === 'jogador') {
        alert('Apenas Mestres ou Administradores têm o poder de abrir novas Fendas.');
        return;
    }
    document.getElementById('new-table-name').value = '';
    document.getElementById('create-table-modal').style.display = 'flex';
}

function confirmCreateTable() {
    if(myTables.length >= MAX_TABLES) {
        alert('Você atingiu o limite máximo de 10 Fendas (Mesas).');
        return;
    }
    const name = document.getElementById('new-table-name').value.trim();
    if(!name) {
        alert('A fenda precisa de um nome.');
        return;
    }

    currentVttTheme = document.getElementById('new-table-theme').value;
    document.getElementById('create-table-modal').style.display = 'none';

    isDraftMode = true;
    if(typeof enterVTT === 'function') enterVTT('draft', true, name);
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
    allTablesDB.push(newTable);
    localStorage.setItem('mundosSombriosTables', JSON.stringify(allTablesDB));

    isDraftMode = false;
    currentTableData = newTable;

    document.getElementById('btn-save-table').style.display = 'none';
    alert(`Fenda Imortalizada com sucesso!\nCódigo de Acesso para os Jogadores: ${code}`);
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
        alert('Código copiado para a área de transferência!');
    });
}

function deleteTable(id) {
    if(confirm('Tem certeza que deseja apagar essa Fenda para sempre? O mundo será destruído.')) {
        myTables = myTables.filter(t => t.id !== id);
        allTablesDB = allTablesDB.filter(t => t.id !== id);
        localStorage.setItem('mundosSombriosTables', JSON.stringify(allTablesDB));
        renderAncoragem();
    }
}

function leaveJoinedTable(code) {
    if(confirm('Deseja cortar sua conexão permanente com esta Fenda?')) {
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
        alert('Preencha o código e selecione uma alma.');
        return;
    }

    document.getElementById('join-modal').style.display = 'none';
    myVttCharIndex = parseInt(charIndex);

    const ownTable = myTables.find(t => t.code === code);
    if(ownTable) {
        alert('Você é o Mestre desta mesa! Entrando como Mestre.');
        enterVTT(ownTable.id, true);
        return;
    }

    let existingJoin = joinedTables.find(t => t.code === code);
    if(!existingJoin) {
        existingJoin = { code: code, name: 'Fenda ' + code, ownerId: currentUser.id };
        joinedTables.push(existingJoin);
        saveGlobalJoinedTables();
    }

    enterVTT(code, false);
}
