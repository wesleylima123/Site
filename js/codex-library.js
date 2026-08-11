
/* Mundos Sombrios — Biblioteca pública interna do Códice.
   Leitura interna em modal; ADM pode adicionar/excluir nesta instalação.
*/

const CODEX_LIBRARY_KEY = 'mundosSombriosCodexLibraryV2';

function codexLibrarySeed() {
    const catalog = window.CODEX_FILE_CATALOG || [];
    const current = JSON.parse(localStorage.getItem(CODEX_LIBRARY_KEY) || '[]');
    const existing = new Set(current.map(x => x.id));
    let changed = false;

    for (const item of catalog) {
        if (!existing.has(item.id)) {
            current.push({
                ...item,
                managed: !!item.managed,
                uploadedAt: Date.now()
            });
            existing.add(item.id);
            changed = true;
        }
    }

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

function groupCodexFiles(mode) {
    const files = getCodexLibrary().filter(x => x.mode === mode);
    const base = files.filter(x => x.kind === 'base');
    const expansions = files.filter(x => x.kind !== 'base');
    return { base, expansions };
}

function fileCardMarkup(file) {
    const adminDelete = isCodexAdmin() ? `
        <button class="codex-file-delete" title="Excluir para todos"
            onclick="adminDeleteCodexFile('${escapeCodexHtml(file.id)}')">×</button>` : '';
    const badgeMode = file.mode === 'exodo' ? 'ÊXODO' : 'OCULTATUN';
    const badgeKind = file.kind === 'base' ? 'BASE' : 'EXPANSÃO';
    return `
      <article class="codex-file-card">
        <div class="codex-file-icon ${file.mode === 'exodo' ? 'codex-icon-exodo' : 'codex-icon-ocultatun'}">
          ${file.mode === 'exodo' ? 'Σ' : '◈'}
        </div>
        <div class="codex-file-info">
          <div class="codex-file-meta">
            <span class="codex-file-badge">${badgeMode}</span>
            <span class="codex-file-kind">${badgeKind}</span>
            ${file.managed ? '<span class="codex-file-managed">ADM</span>' : '<span class="codex-file-managed">BASE</span>'}
          </div>
          <h4>${escapeCodexHtml(file.title || file.name)}</h4>
          <p>${escapeCodexHtml(file.name || 'Arquivo do Códice')}</p>
        </div>
        <div class="codex-file-actions">
          <button class="souls-btn small-btn" onclick="openCodexFile('${escapeCodexHtml(file.id)}')">LER NO CÓDICE</button>
          ${adminDelete}
        </div>
      </article>`;
}

function renderCodexLibrary(mode) {
    const root = document.getElementById('codex-file-library');
    const tools = document.getElementById('codex-admin-tools');
    const info = window.CODEX_MODE_INFO ? window.CODEX_MODE_INFO[mode] : null;
    if (!root) return;

    if (tools) tools.style.display = isCodexAdmin() ? 'flex' : 'none';

    const { base, expansions } = groupCodexFiles(mode);

    const sectionMarkup = (title, items) => items.length ? `
      <section class="codex-file-section">
        <div class="codex-section-head">
          <h4>${escapeCodexHtml(title)}</h4>
          <span>${items.length} arquivo(s)</span>
        </div>
        <div class="codex-file-grid">${items.map(fileCardMarkup).join('')}</div>
      </section>` : '';

    if (!base.length && !expansions.length) {
      root.innerHTML = '<div class="codex-empty">Nenhum arquivo foi disponibilizado para esta biblioteca.</div>';
      return;
    }

    root.innerHTML = `
      ${sectionMarkup('Livro base', base)}
      ${sectionMarkup('Expansões', expansions)}
    `;

    const summaryRoot = document.getElementById('codex-mode-summary');
    if (summaryRoot && info) {
      summaryRoot.innerHTML = `
        <section class="codex-summary-card">
          <h4>${escapeCodexHtml(info.summaryTitle)}</h4>
          <div class="codex-chips">
            ${(info.chips || []).map(x => `<span class="codex-chip">${escapeCodexHtml(x)}</span>`).join('')}
          </div>
          <ul>${(info.summary || []).map(x => `<li>${escapeCodexHtml(x)}</li>`).join('')}</ul>
        </section>
      `;
    }
}

function openCodexFile(id) {
    const file = getCodexLibrary().find(x => x.id === id);
    if (!file) return;

    const modal = document.getElementById('codex-reader-modal');
    const frame = document.getElementById('codex-reader-frame');
    const title = document.getElementById('codex-reader-title');
    const kicker = document.getElementById('codex-reader-kicker');

    const src = file.dataUrl || encodeURI(file.file);
    if (frame) frame.src = src;
    if (title) title.textContent = file.title || file.name || 'Arquivo do Códice';
    if (kicker) kicker.textContent = file.mode === 'exodo' ? 'ÊXODO / LEITOR' : 'OCULTATUN / LEITOR';
    if (modal) modal.style.display = 'block';
}

function closeCodexReader() {
    const modal = document.getElementById('codex-reader-modal');
    const frame = document.getElementById('codex-reader-frame');
    if (frame) frame.src = 'about:blank';
    if (modal) modal.style.display = 'none';
}

function adminUploadCodexFiles(fileList) {
    if (!isCodexAdmin()) {
        alert('Somente o ADM pode adicionar arquivos ao Códice.');
        return;
    }

    const files = Array.from(fileList || []);
    if (!files.length) return;

    const currentMode = window.currentCodexMode === 'ocultatun' ? 'ocultatun' : 'exodo';
    const maxEach = 8 * 1024 * 1024;
    const selected = getCodexLibrary();
    let pending = 0;

    files.forEach(file => {
        if (file.size > maxEach) {
            alert(`"${file.name}" excede o limite de 8 MB e não foi adicionado.`);
            return;
        }
        pending++;
        const reader = new FileReader();
        reader.onload = e => {
            const id = 'adm-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
            selected.push({
                id,
                title: file.name.replace(/\.[^.]+$/, ''),
                name: file.name,
                type: (file.type || '').includes('pdf') ? 'PDF' : 'ARQUIVO',
                mode: currentMode,
                kind: 'expansao',
                file: `codex-files/${file.name}`,
                dataUrl: e.target.result,
                managed: true,
                uploadedAt: Date.now()
            });
            pending--;
            if (pending === 0) {
                localStorage.setItem(CODEX_LIBRARY_KEY, JSON.stringify(selected));
                renderCodexLibrary(currentMode);
            }
        };
        reader.readAsDataURL(file);
        // Persist the file into the codex-files folder via user-visible package generation only;
        // the current browser upload is only persisted as data URL in localStorage for this session.
        // The UI still works inside this installation.
    });
}

function adminDeleteCodexFile(id) {
    if (!isCodexAdmin()) {
        alert('Somente o ADM pode excluir arquivos do Códice.');
        return;
    }
    const file = getCodexLibrary().find(x => x.id === id);
    if (!file) return;
    if (!confirm(`Excluir "${file.title || file.name}" para todos os usuários desta instalação?`)) return;

    const next = getCodexLibrary().filter(x => x.id !== id);
    localStorage.setItem(CODEX_LIBRARY_KEY, JSON.stringify(next));
    renderCodexLibrary(file.mode || 'exodo');
}

document.addEventListener('DOMContentLoaded', () => {
    const currentMode = window.currentCodexMode === 'ocultatun' ? 'ocultatun' : 'exodo';
    renderCodexLibrary(currentMode);
});
