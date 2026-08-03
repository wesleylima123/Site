function doLogin() {
    const user = document.getElementById('login-user').value.trim();
    const pass = document.getElementById('login-pass').value.trim();

    if(!user || !pass) { alert('Preencha as credenciais.'); return; }

    const account = usersDB.find(u => u.username === user && u.password === pass);
    if(account) {
        currentUser = account;
        document.getElementById('login-user').value = '';
        document.getElementById('login-pass').value = '';

        document.getElementById('display-username').innerText = currentUser.username;

        const emblem = document.getElementById('master-emblem');
        if(currentUser.role === 'mestre' || currentUser.role === 'admin') {
            emblem.style.display = 'block';
            if(typeof makeDraggable === 'function') makeDraggable(emblem, emblem, false);
        } else {
            emblem.style.display = 'none';
        }

        document.getElementById('btn-admin-panel').style.display = currentUser.role === 'admin' ? 'block' : 'none';
        document.getElementById('tab-btn-gm').style.display = (currentUser.role === 'mestre' || currentUser.role === 'admin') ? 'inline-block' : 'none';

        loadUserData();

        if(currentUser.role === 'admin' && typeof renderAdminRequestsWindows === 'function') {
            renderAdminRequestsWindows();
        }

        showScreen('screen-mode-select');
    } else {
        alert('Entidade não reconhecida ou senha incorreta no Vazio.');
    }
}

function doLogout() {
    if(confirm('Deseja desconectar do Vazio?')) {
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

    if(!user || !pass || !email) { alert('Preencha todos os campos.'); return; }
    if(usersDB.find(u => u.username === user)) { alert('Nome já reclamado por outra alma.'); return; }

    const newUser = {
        id: 'u' + Date.now(),
        username: user,
        email: email,
        password: pass,
        role: 'jogador'
    };
    usersDB.push(newUser);
    localStorage.setItem('mundosSombriosUsers', JSON.stringify(usersDB));

    if(reqMaster) {
        requestsDB.push({ id: Date.now(), userId: newUser.id, username: user });
        localStorage.setItem('mundosSombriosRequests', JSON.stringify(requestsDB));
    }

    alert('Alma Despertada! Agora você pode atravessar o portal (Login).');
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
        alert('E-mail inexistente no Vazio.');
    }
    closeRecover();
}

function openAdminPanel() {
    if(typeof renderAdminPanel === 'function') renderAdminPanel();
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
    alert('Registro Akáshico alterado.');
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
        if(typeof makeDraggable === 'function') makeDraggable(win, win.querySelector(`#req-header-${req.id}`), false);
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
