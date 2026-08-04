/* Mundos Sombrios — Biblioteca pública do Códice.
   Leitura: todos os usuários.
   Escrita/exclusão global: somente ADM.
   Arquivos enviados pelo ADM ficam em localStorage nesta instalação.
*/
const CODEX_LIBRARY_KEY = 'mundosSombriosCodexLibrary';

function codexLibrarySeed() {
    const catalog = window.CODEX_FILE_CATALOG || [];
    const current = JSON.parse(localStorage.getItem(CODEX_LIBRARY_KEY) || '[]');
    const existing = new Set(current.map(x => x.id));
    let changed = false;
    catalog.forEach(item => {
        if (!existing.has(item.id)) {
            current.push({...item, managed: false, uploadedAt: Date.now()});
            changed = true;
        }
    });
    if (changed) localStorage.setItem(CODEX_LIBRARY_KEY, JSON.stringify(current));
    return current;
}

function getCodexLibrary() {
    return codexLibrarySeed();
}

function isCodexAdmin() {
    return !!(window.currentUser && currentUser.role === 'admin');
}

function escapeCodexHtml(v) {
    return String(v ?? '').replace(/[&<>"']/g, c => ({
        '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[c]));
}

function renderCodexLibrary() {
    const root = document.getElementById('codex-file-library');
    const tools = document.getElementById('codex-admin-tools');
    if (!root) return;
    if (tools) tools.style.display = isCodexAdmin() ? 'flex' : 'none';

    const files = getCodexLibrary();
    if (!files.length) {
        root.innerHTML = '<div class="codex-empty">Nenhum arquivo foi disponibilizado no Códice.</div>';
        return;
    }

    root.innerHTML = files.map(file => {
        const adminDelete = isCodexAdmin() ? `
            <button class="codex-file-delete" title="Excluir para todos"
                onclick="adminDeleteCodexFile('${escapeCodexHtml(file.id)}')">×</button>` : '';
        const badge = file.mode ? `<span class="codex-file-badge">${escapeCodexHtml(file.mode)}</span>` : '';
        const managed = file.managed ? '<span class="codex-file-managed">ADM</span>' : '<span class="codex-file-managed">BASE</span>';
        return `
          <article class="codex-file-card">
            <div class="codex-file-icon">${file.type === 'PDF' ? 'PDF' : 'DOC'}</div>
            <div class="codex-file-info">
              <div class="codex-file-meta">${badge}${managed}</div>
              <h4>${escapeCodexHtml(file.title || file.name)}</h4>
              <p>${escapeCodexHtml(file.name || 'Arquivo do Códice')}</p>
            </div>
            <div class="codex-file-actions">
              <button class="souls-btn small-btn" onclick="openCodexFile('${escapeCodexHtml(file.id)}')">ABRIR / LER</button>
              ${adminDelete}
            </div>
          </article>`;
    }).join('');
}

function openCodexFile(id) {
    const file = getCodexLibrary().find(x => x.id === id);
    if (!file) return;
    if (file.dataUrl) {
        const w = window.open();
        if (w) {
            w.document.write(`<title>${escapeCodexHtml(file.title || file.name)}</title>
              <style>html,body{margin:0;height:100%;background:#111;color:#ddd}iframe{width:100%;height:100%;border:0}</style>
              <iframe src="${file.dataUrl}" title="${escapeCodexHtml(file.title || file.name)}"></iframe>`);
            w.document.close();
        } else alert('O navegador bloqueou a nova janela. Permita pop-ups para ler o arquivo.');
        return;
    }
    if (file.file) window.open(encodeURI(file.file), '_blank', 'noopener');
}

function adminUploadCodexFiles(fileList) {
    if (!isCodexAdmin()) {
        alert('Somente o ADM pode adicionar arquivos ao Códice.');
        return;
    }
    const files = Array.from(fileList || []);
    if (!files.length) return;
    const maxEach = 8 * 1024 * 1024;
    let library = getCodexLibrary();
    let pending = files.length;

    files.forEach(file => {
        if (file.size > maxEach) {
            pending--;
            alert(`"${file.name}" excede o limite de 8 MB e não foi adicionado.`);
            if (!pending) renderCodexLibrary();
            return;
        }
        const reader = new FileReader();
        reader.onload = e => {
            const id = 'adm-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2,8);
            library.push({
                id, title:file.name.replace(/\.[^.]+$/, ''), name:file.name,
                type:(file.type || '').includes('pdf') ? 'PDF' : 'ARQUIVO',
                mode:'BIBLIOTECA',
                dataUrl:e.target.result, managed:true, uploadedAt:Date.now()
            });
            pending--;
            if (!pending) {
                try {
                    localStorage.setItem(CODEX_LIBRARY_KEY, JSON.stringify(library));
                    renderCodexLibrary();
                    alert('Arquivo(s) disponibilizado(s) no Códice para todos os usuários desta instalação.');
                } catch(err) {
                    alert('Não foi possível salvar o arquivo. O armazenamento do navegador foi excedido.');
                }
            }
        };
        reader.readAsDataURL(file);
    });
}

function adminDeleteCodexFile(id) {
    if (!isCodexAdmin()) {
        alert('Somente o ADM pode excluir arquivos do Códice.');
        return;
    }
    const file = getCodexLibrary().find(x => x.id === id);
    if (!file) return;
    if (!confirm(`Excluir "${file.title || file.name}" para todos os usuários?`)) return;
    const next = getCodexLibrary().filter(x => x.id !== id);
    localStorage.setItem(CODEX_LIBRARY_KEY, JSON.stringify(next));
    renderCodexLibrary();
}

document.addEventListener('DOMContentLoaded', () => {
    // Expose seed catalog generated from the attached source files.
    fetch('codex-files/catalog.json')
      .then(r => r.json())
      .then(c => { window.CODEX_FILE_CATALOG = c; renderCodexLibrary(); })
      .catch(() => renderCodexLibrary());
});
